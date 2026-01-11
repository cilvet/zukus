#!/usr/bin/env python3
"""
Test different description lengths to find the optimal balance.
Compares short, medium, and longer descriptions for the same spells.
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import json
import sys
from pathlib import Path
from typing import List, Dict

import faiss
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor

MODEL_NAME = "openai/clip-vit-base-patch32"


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
                record = json.loads(line)
                records.append(record)
    records.sort(key=lambda x: x['id'])
    return records


def get_text_embedding(
    processor: CLIPProcessor,
    model: CLIPModel,
    text: str,
    device: str
) -> np.ndarray:
    inputs = processor(text=[text], return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.get_text_features(**inputs)
    
    embedding = outputs.cpu().numpy().astype(np.float32)
    norm = np.linalg.norm(embedding, axis=1, keepdims=True)
    if norm[0, 0] != 0:
        embedding = embedding / norm
    
    return embedding


def search_single(
    index: faiss.Index,
    metadata: List[dict],
    processor: CLIPProcessor,
    model: CLIPModel,
    query: str,
    device: str,
    top_k: int = 5
) -> List[dict]:
    query_embedding = get_text_embedding(processor, model, query, device)
    scores, indices = index.search(query_embedding, top_k)
    
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(metadata):
            continue
        
        record = metadata[idx]
        results.append({
            "path": record['path'],
            "score": float(score),
            "category": record['category']
        })
    
    return results


def main():
    # Load infrastructure
    index_path = "data/faiss.index"
    metadata_path = "data/metadata.jsonl"
    
    if not Path(index_path).exists():
        print(f"Error: Index file not found: {index_path}", file=sys.stderr)
        sys.exit(1)
    
    if not Path(metadata_path).exists():
        print(f"Error: Metadata file not found: {metadata_path}", file=sys.stderr)
        sys.exit(1)
    
    index = faiss.read_index(index_path)
    metadata = load_metadata(metadata_path)
    
    device = get_device()
    print(f"Using device: {device}\n")
    
    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
    model.eval()
    
    # Test cases with different length descriptions
    test_cases = [
        {
            "spell": "Fireball",
            "short": "fire explosion",           # ~14 chars, 2 words
            "medium": "bright fire explosion",    # ~22 chars, 3 words
            "long": "magical fire explosion with flames",  # ~38 chars, 5 words
        },
        {
            "spell": "Lightning Bolt",
            "short": "blue lightning",
            "medium": "blue lightning strike",
            "long": "powerful blue lightning bolt attack",
        },
        {
            "spell": "Cure Wounds",
            "short": "green healing",
            "medium": "green healing light",
            "long": "bright green healing light energy",
        },
        {
            "spell": "Shield",
            "short": "magic shield",
            "medium": "glowing magic shield",
            "long": "translucent blue magic shield barrier",
        },
        {
            "spell": "Invisibility",
            "short": "transparent fade",
            "medium": "transparent fading figure",
            "long": "person slowly fading into transparent mist",
        },
        {
            "spell": "Finger of Death",
            "short": "death magic",
            "medium": "dark death magic",
            "long": "dark necrotic death magic energy",
        },
        {
            "spell": "Ice Storm",
            "short": "ice storm",
            "medium": "blue ice storm",
            "long": "swirling blue ice storm with crystals",
        },
        {
            "spell": "Summon Monster",
            "short": "summoning portal",
            "medium": "magic summoning portal",
            "long": "glowing magic summoning portal with energy",
        },
        {
            "spell": "Web",
            "short": "spider web",
            "medium": "sticky spider web",
            "long": "large sticky spider web trap",
        },
        {
            "spell": "Teleport",
            "short": "magic portal",
            "medium": "swirling magic portal",
            "long": "bright swirling magical teleportation portal",
        },
    ]
    
    print("=" * 90)
    print("TESTING DIFFERENT DESCRIPTION LENGTHS")
    print("=" * 90)
    print()
    
    # Collect statistics
    length_stats = {
        "short": {"scores": [], "avg_top1": 0},
        "medium": {"scores": [], "avg_top1": 0},
        "long": {"scores": [], "avg_top1": 0},
    }
    
    for test_case in test_cases:
        print("\n" + "=" * 90)
        print(f"SPELL: {test_case['spell']}")
        print("-" * 90)
        
        for length_type in ["short", "medium", "long"]:
            query = test_case[length_type]
            char_count = len(query)
            word_count = len(query.split())
            
            print(f"\n📝 {length_type.upper()}: '{query}' ({char_count} chars, {word_count} words)")
            
            results = search_single(index, metadata, processor, model, query, device, top_k=3)
            
            if results:
                length_stats[length_type]["scores"].append(results[0]["score"])
            
            print("   Top 3 results:")
            for i, res in enumerate(results, 1):
                marker = "⭐" if i == 1 else "  "
                print(f"   {marker} {i}. [{res['score']:.4f}] {res['category']}/{Path(res['path']).name}")
    
    # Calculate averages
    print("\n\n" + "=" * 90)
    print("STATISTICS - Average Top-1 Scores")
    print("=" * 90)
    
    for length_type in ["short", "medium", "long"]:
        scores = length_stats[length_type]["scores"]
        if scores:
            avg = sum(scores) / len(scores)
            length_stats[length_type]["avg_top1"] = avg
            print(f"{length_type.upper():10s}: {avg:.4f} (n={len(scores)})")
    
    # Determine winner
    best = max(length_stats.items(), key=lambda x: x[1]["avg_top1"])
    
    print("\n" + "=" * 90)
    print(f"🏆 WINNER: {best[0].upper()} descriptions (avg score: {best[1]['avg_top1']:.4f})")
    print("=" * 90)
    
    print("""
RECOMMENDATIONS:

SHORT (2-3 words, ~15-20 chars):
  ✅ Pros: Fast to generate, focused
  ❌ Cons: May be too generic for complex spells

MEDIUM (3-4 words, ~25-35 chars):
  ✅ Pros: Good balance of specificity and brevity
  ✅ Pros: Adds useful visual adjectives
  ❌ Cons: Slightly longer processing

LONG (5-7 words, ~40-60 chars):
  ✅ Pros: Very specific, detailed
  ❌ Cons: May include filler words
  ❌ Cons: CLIP has 77 token limit (less critical here)

Based on the scores above, choose the optimal length for your use case.
    """)
    
    print("\n" + "=" * 90)
    print("TESTING COMPLETE")
    print("=" * 90)


if __name__ == "__main__":
    main()


