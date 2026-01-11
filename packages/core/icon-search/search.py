#!/usr/bin/env python3
"""
Search for images using CLIP text embeddings.

Usage:
    python search.py --index "data/faiss.index" --metadata "data/metadata.jsonl" --query "Bola de fuego" --top_k 12
    python search.py --index "data/faiss.index" --metadata "data/metadata.jsonl" --query "fire sword" --top_k 12 --category WeaponIcons
"""

import os
# Fix OpenMP conflict on macOS (torch + faiss both link libomp)
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor


MODEL_NAME = "openai/clip-vit-base-patch32"


def get_device() -> str:
    """Determine the best available device."""
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_metadata(metadata_path: str) -> List[dict]:
    """Load metadata from JSONL file, indexed by id."""
    records = []
    with open(metadata_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                record = json.loads(line)
                records.append(record)
    
    # Sort by id to ensure correct indexing
    records.sort(key=lambda x: x['id'])
    return records


def get_text_embedding(
    processor: CLIPProcessor,
    model: CLIPModel,
    text: str,
    device: str
) -> np.ndarray:
    """Get normalized text embedding for a query."""
    inputs = processor(text=[text], return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.get_text_features(**inputs)
    
    # Convert to numpy and normalize L2
    embedding = outputs.cpu().numpy().astype(np.float32)
    norm = np.linalg.norm(embedding, axis=1, keepdims=True)
    if norm[0, 0] != 0:
        embedding = embedding / norm
    
    return embedding


def search_images(
    index_path: str,
    metadata_path: str,
    query: str,
    top_k: int = 12,
    category_filter: Optional[str] = None
) -> dict:
    """
    Search for images matching the query.
    
    Returns:
        Dictionary with query info and results
    """
    
    # Validate paths
    if not Path(index_path).exists():
        print(f"Error: Index file not found: {index_path}", file=sys.stderr)
        sys.exit(1)
    
    if not Path(metadata_path).exists():
        print(f"Error: Metadata file not found: {metadata_path}", file=sys.stderr)
        sys.exit(1)
    
    # Load index and metadata
    index = faiss.read_index(index_path)
    metadata = load_metadata(metadata_path)
    
    # Load model
    device = get_device()
    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
    model.eval()
    
    # Get query embedding
    query_embedding = get_text_embedding(processor, model, query, device)
    
    # Search with multiplier if filtering
    search_k = top_k
    if category_filter:
        search_k = top_k * 5  # Fetch more results to filter
    
    # Limit to available vectors
    search_k = min(search_k, index.ntotal)
    
    # Search
    scores, indices = index.search(query_embedding, search_k)
    
    # Build results
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(metadata):
            continue
        
        record = metadata[idx]
        
        # Apply category filter
        if category_filter:
            if record['category'].lower() != category_filter.lower():
                continue
        
        results.append({
            "path": record['path'],
            "score": float(score),
            "category": record['category']
        })
        
        if len(results) >= top_k:
            break
    
    return {
        "query": query,
        "top_k": top_k,
        "category_filter": category_filter,
        "results": results
    }


def main():
    parser = argparse.ArgumentParser(
        description="Search images using CLIP text embeddings"
    )
    parser.add_argument(
        "--index",
        type=str,
        required=True,
        help="Path to FAISS index file"
    )
    parser.add_argument(
        "--metadata",
        type=str,
        required=True,
        help="Path to metadata JSONL file"
    )
    parser.add_argument(
        "--query",
        type=str,
        required=True,
        help="Text query to search for"
    )
    parser.add_argument(
        "--top_k",
        type=int,
        default=12,
        help="Number of results to return (default: 12)"
    )
    parser.add_argument(
        "--category",
        type=str,
        default=None,
        help="Filter results by category (optional)"
    )
    
    args = parser.parse_args()
    
    result = search_images(
        index_path=args.index,
        metadata_path=args.metadata,
        query=args.query,
        top_k=args.top_k,
        category_filter=args.category
    )
    
    # Output JSON to stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

