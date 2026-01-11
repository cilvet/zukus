#!/usr/bin/env python3
"""
Apply images to all spell entities using CLIP-based semantic search.
Optimized version with batch processing.

Usage:
    python apply_images_to_spells.py \
        --spells_dir "../visualPlayground/server/data/entities/spell" \
        --index "data/faiss.index" \
        --metadata "data/metadata.jsonl"
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import argparse
import json
import sys
import time
from pathlib import Path
from typing import List, Tuple

import faiss
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor


MODEL_NAME = "openai/clip-vit-base-patch32"
BATCH_SIZE = 64

# Translation map for common Spanish descriptors to English
DESCRIPTOR_TRANSLATIONS = {
    "fuego": "fire",
    "frío": "ice cold frost",
    "frio": "ice cold frost",
    "hielo": "ice cold frost",
    "agua": "water",
    "aire": "air wind",
    "tierra": "earth ground",
    "electricidad": "electricity lightning",
    "rayo": "lightning thunder",
    "luz": "light holy",
    "oscuridad": "darkness shadow",
    "sombra": "shadow dark",
    "muerte": "death skull",
    "vida": "life heal",
    "curación": "healing",
    "curacion": "healing",
    "veneno": "poison",
    "ácido": "acid",
    "acido": "acid",
    "maligno": "evil dark",
    "benigno": "holy good",
    "caos": "chaos",
    "ley": "law order",
    "mental": "mind psychic",
    "miedo": "fear terror",
    "fuerza": "force energy",
    "sonido": "sound sonic",
    "sónico": "sound sonic",
    "sonico": "sound sonic",
}


def get_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_metadata(metadata_path: str) -> List[dict]:
    records = []
    with open(metadata_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    records.sort(key=lambda x: x['id'])
    return records


def build_search_query(spell: dict) -> str:
    """
    Build search query using visualdescription (ultra short, visual-focused).
    Falls back to originalName if not available.
    """
    visual_desc = spell.get('visualdescription', '')
    if visual_desc:
        return visual_desc
    
    original_name = spell.get('originalName', '')
    if original_name:
        return original_name
    
    return spell.get('name', '')


def get_text_embeddings_batch(
    processor: CLIPProcessor,
    model: CLIPModel,
    texts: List[str],
    device: str
) -> np.ndarray:
    """Get normalized text embeddings for a batch of queries."""
    inputs = processor(text=texts, return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.get_text_features(**inputs)
    
    embeddings = outputs.cpu().numpy().astype(np.float32)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1, norms)
    embeddings = embeddings / norms
    
    return embeddings


def process_spells(
    spells_dir: str,
    index_path: str,
    metadata_path: str,
    dry_run: bool = False
) -> None:
    """Process all spell files with batch optimization."""
    
    spells_path = Path(spells_dir)
    
    if not spells_path.exists():
        print(f"Error: Spells directory not found: {spells_dir}", file=sys.stderr)
        sys.exit(1)
    
    if not Path(index_path).exists():
        print(f"Error: Index file not found: {index_path}", file=sys.stderr)
        sys.exit(1)
    
    start_time = time.time()
    
    # Load index and metadata
    print("Loading FAISS index and metadata...")
    index = faiss.read_index(index_path)
    metadata = load_metadata(metadata_path)
    
    # Load CLIP model
    device = get_device()
    print(f"Loading CLIP model (device: {device})...")
    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
    model.eval()
    
    # Load all spells
    print("Loading spell files...")
    spell_files = list(spells_path.glob("*.json"))
    total = len(spell_files)
    print(f"Found {total} spell files")
    
    spells_data: List[Tuple[Path, dict, str]] = []  # (path, spell, query)
    
    for spell_file in spell_files:
        try:
            with open(spell_file, 'r', encoding='utf-8') as f:
                spell = json.load(f)
            query = build_search_query(spell)
            spells_data.append((spell_file, spell, query))
        except Exception as e:
            print(f"Error loading {spell_file.name}: {e}", file=sys.stderr)
    
    print(f"Loaded {len(spells_data)} spells successfully")
    
    # Process in batches
    print(f"\nProcessing embeddings in batches of {BATCH_SIZE}...")
    all_queries = [q for _, _, q in spells_data]
    all_embeddings = []
    
    for i in range(0, len(all_queries), BATCH_SIZE):
        batch_queries = all_queries[i:i + BATCH_SIZE]
        batch_embeddings = get_text_embeddings_batch(processor, model, batch_queries, device)
        all_embeddings.append(batch_embeddings)
        
        progress = min(i + BATCH_SIZE, len(all_queries))
        print(f"\rEmbeddings: {progress}/{len(all_queries)}", end="", flush=True)
    
    print()  # New line
    
    # Concatenate all embeddings
    all_embeddings_np = np.vstack(all_embeddings)
    
    # Search all at once
    print("Searching FAISS index...")
    scores, indices = index.search(all_embeddings_np, 1)  # Top 1 for each
    
    # Update spell files
    print("Updating spell files...")
    updated = 0
    errors = 0
    
    for i, (spell_file, spell, query) in enumerate(spells_data):
        try:
            idx = indices[i][0]
            if idx >= 0 and idx < len(metadata):
                image_path = metadata[idx]['path']
                spell['image'] = image_path
                
                if not dry_run:
                    with open(spell_file, 'w', encoding='utf-8') as f:
                        json.dump(spell, f, ensure_ascii=False, indent=2)
                
                updated += 1
            else:
                errors += 1
        except Exception as e:
            print(f"Error updating {spell_file.name}: {e}", file=sys.stderr)
            errors += 1
    
    elapsed = time.time() - start_time
    
    print(f"\n{'='*50}")
    print(f"Processing complete!")
    print(f"  Total files: {total}")
    print(f"  Updated: {updated}")
    print(f"  Errors: {errors}")
    print(f"  Time elapsed: {elapsed:.1f}s")
    if dry_run:
        print(f"  (DRY RUN - no files were modified)")
    print(f"{'='*50}")


def main():
    parser = argparse.ArgumentParser(
        description="Apply images to spell entities using CLIP search (batch optimized)"
    )
    parser.add_argument(
        "--spells_dir",
        type=str,
        required=True,
        help="Directory containing spell JSON files"
    )
    parser.add_argument(
        "--index",
        type=str,
        default="data/faiss.index",
        help="Path to FAISS index file"
    )
    parser.add_argument(
        "--metadata",
        type=str,
        default="data/metadata.jsonl",
        help="Path to metadata JSONL file"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't modify files, just show what would be done"
    )
    
    args = parser.parse_args()
    
    process_spells(
        spells_dir=args.spells_dir,
        index_path=args.index,
        metadata_path=args.metadata,
        dry_run=args.dry_run
    )


if __name__ == "__main__":
    main()
