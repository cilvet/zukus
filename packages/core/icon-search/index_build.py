#!/usr/bin/env python3
"""
Index builder for CLIP-based image search.
Processes a directory of images and creates a FAISS index for semantic search.

Usage:
    python index_build.py --assets_root "/path/to/images" --out_dir "data" --batch_size 32
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import List, Tuple

import faiss
import numpy as np
import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor


SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
MODEL_NAME = "openai/clip-vit-base-patch32"


def get_device() -> str:
    """Determine the best available device."""
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def collect_image_paths(assets_root: Path) -> List[Tuple[str, str]]:
    """
    Recursively collect all image paths under assets_root.
    
    Returns:
        List of tuples (relative_path, category)
        Category is the first folder under assets_root, or "__root__" if none.
    """
    image_paths = []
    
    for root, _, files in os.walk(assets_root):
        for filename in files:
            ext = Path(filename).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue
                
            full_path = Path(root) / filename
            relative_path = full_path.relative_to(assets_root)
            
            # Category is the first folder component
            parts = relative_path.parts
            if len(parts) > 1:
                category = parts[0]
            else:
                category = "__root__"
            
            image_paths.append((str(relative_path), category))
    
    # Sort for reproducibility
    image_paths.sort(key=lambda x: x[0])
    return image_paths


def load_image_safe(path: Path) -> Image.Image:
    """Load an image, returning None if corrupted."""
    try:
        img = Image.open(path)
        img = img.convert("RGB")
        return img
    except Exception:
        return None


def process_batch(
    processor: CLIPProcessor,
    model: CLIPModel,
    images: List[Image.Image],
    device: str
) -> np.ndarray:
    """Process a batch of images and return normalized embeddings."""
    inputs = processor(images=images, return_tensors="pt", padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.get_image_features(**inputs)
    
    # Convert to numpy and normalize L2
    embeddings = outputs.cpu().numpy().astype(np.float32)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1, norms)  # Avoid division by zero
    embeddings = embeddings / norms
    
    return embeddings


def build_index(
    assets_root: str,
    out_dir: str,
    batch_size: int = 32
) -> None:
    """Main function to build the FAISS index."""
    
    assets_path = Path(assets_root)
    out_path = Path(out_dir)
    
    if not assets_path.exists():
        print(f"Error: assets_root does not exist: {assets_root}", file=sys.stderr)
        sys.exit(1)
    
    out_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Collecting images from: {assets_root}")
    image_infos = collect_image_paths(assets_path)
    total_images = len(image_infos)
    print(f"Found {total_images} images")
    
    if total_images == 0:
        print("Error: No images found", file=sys.stderr)
        sys.exit(1)
    
    # Load model
    device = get_device()
    print(f"Loading CLIP model: {MODEL_NAME}")
    print(f"Device: {device}")
    
    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
    model.eval()
    
    # Get embedding dimension
    dummy_input = processor(images=[Image.new("RGB", (224, 224))], return_tensors="pt")
    dummy_input = {k: v.to(device) for k, v in dummy_input.items()}
    with torch.no_grad():
        dummy_output = model.get_image_features(**dummy_input)
    embedding_dim = dummy_output.shape[1]
    print(f"Embedding dimension: {embedding_dim}")
    
    # Process images in batches
    start_time = time.time()
    all_embeddings = []
    metadata_records = []
    corrupted_files = []
    processed_count = 0
    
    batch_images = []
    batch_infos = []
    
    for idx, (rel_path, category) in enumerate(image_infos):
        full_path = assets_path / rel_path
        img = load_image_safe(full_path)
        
        if img is None:
            corrupted_files.append(rel_path)
            continue
        
        batch_images.append(img)
        batch_infos.append((processed_count, rel_path, category))
        
        # Process batch when full
        if len(batch_images) >= batch_size:
            embeddings = process_batch(processor, model, batch_images, device)
            all_embeddings.append(embeddings)
            
            for (record_id, path, cat), _ in zip(batch_infos, range(len(batch_images))):
                metadata_records.append({
                    "id": record_id,
                    "path": path,
                    "category": cat
                })
                processed_count += 1
            
            batch_images = []
            batch_infos = []
            
            # Progress update
            progress = (idx + 1) / total_images * 100
            print(f"\rProcessing: {progress:.1f}% ({idx + 1}/{total_images})", end="", flush=True)
    
    # Process remaining batch
    if batch_images:
        embeddings = process_batch(processor, model, batch_images, device)
        all_embeddings.append(embeddings)
        
        for (record_id, path, cat), _ in zip(batch_infos, range(len(batch_images))):
            metadata_records.append({
                "id": record_id,
                "path": path,
                "category": cat
            })
            processed_count += 1
    
    print()  # New line after progress
    
    # Report corrupted files
    if corrupted_files:
        print(f"\nWarning: {len(corrupted_files)} corrupted/unreadable files skipped:", file=sys.stderr)
        for path in corrupted_files[:20]:
            print(f"  - {path}", file=sys.stderr)
        if len(corrupted_files) > 20:
            print(f"  ... and {len(corrupted_files) - 20} more", file=sys.stderr)
    
    # Combine all embeddings
    all_embeddings_np = np.vstack(all_embeddings)
    
    # Build FAISS index (IndexFlatIP for inner product / cosine similarity on normalized vectors)
    print(f"\nBuilding FAISS index...")
    index = faiss.IndexFlatIP(embedding_dim)
    index.add(all_embeddings_np)
    
    # Save index
    index_path = out_path / "faiss.index"
    faiss.write_index(index, str(index_path))
    print(f"Saved index to: {index_path}")
    
    # Save metadata
    metadata_path = out_path / "metadata.jsonl"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        for record in metadata_records:
            f.write(json.dumps(record, ensure_ascii=False) + '\n')
    print(f"Saved metadata to: {metadata_path}")
    
    # Summary
    elapsed = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"Indexing complete!")
    print(f"  Total images indexed: {processed_count}")
    print(f"  Embedding dimension: {embedding_dim}")
    print(f"  Device: {device}")
    print(f"  Model: {MODEL_NAME}")
    print(f"  Time elapsed: {elapsed:.1f}s")
    print(f"  Corrupted/skipped: {len(corrupted_files)}")
    print(f"{'='*50}")


def main():
    parser = argparse.ArgumentParser(
        description="Build FAISS index for CLIP-based image search"
    )
    parser.add_argument(
        "--assets_root",
        type=str,
        required=True,
        help="Root directory containing images"
    )
    parser.add_argument(
        "--out_dir",
        type=str,
        default="data",
        help="Output directory for index and metadata (default: data)"
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=32,
        help="Batch size for processing (default: 32)"
    )
    
    args = parser.parse_args()
    build_index(args.assets_root, args.out_dir, args.batch_size)


if __name__ == "__main__":
    main()


