#!/usr/bin/env python3
"""
Test manually crafted English queries to find optimal description patterns.
This helps understand what query styles work best with CLIP.
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import json
import sys
from pathlib import Path
from typing import List

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
    
    # Test cases: spell name and various query styles
    test_cases = [
        {
            "spell": "Fireball (Bola de fuego)",
            "queries": [
                "fireball",
                "fire explosion",
                "flame blast",
                "burning sphere",
                "explosion of fire",
                "fire magic spell",
                "red fire ball",
            ]
        },
        {
            "spell": "Lightning Bolt (Rayo)",
            "queries": [
                "lightning bolt",
                "electric beam",
                "thunder strike",
                "blue lightning",
                "electricity magic",
                "lightning attack",
            ]
        },
        {
            "spell": "Cure Wounds (Curar heridas)",
            "queries": [
                "cure wounds",
                "healing magic",
                "green healing light",
                "healing hands",
                "holy healing",
                "restoration spell",
            ]
        },
        {
            "spell": "Shield (Escudo)",
            "queries": [
                "shield",
                "magic shield",
                "protective barrier",
                "blue force field",
                "magical protection",
                "defense spell",
            ]
        },
        {
            "spell": "Invisibility (Invisibilidad)",
            "queries": [
                "invisibility",
                "transparent figure",
                "fade away",
                "disappearing magic",
                "stealth spell",
                "invisible person",
            ]
        },
        {
            "spell": "Finger of Death (Dedo de la muerte)",
            "queries": [
                "finger of death",
                "death magic",
                "dark necromancy",
                "black skull",
                "death ray",
                "necrotic energy",
                "skeleton hand",
            ]
        },
    ]
    
    print("=" * 80)
    print("MANUAL QUERY TESTING - Finding Optimal Query Patterns")
    print("=" * 80)
    print()
    
    for test_case in test_cases:
        print("\n" + "=" * 80)
        print(f"SPELL: {test_case['spell']}")
        print("-" * 80)
        
        for query in test_case['queries']:
            print(f"\n📝 Query: '{query}'")
            
            results = search_single(index, metadata, processor, model, query, device, top_k=3)
            
            print("   Top 3 results:")
            for i, res in enumerate(results, 1):
                print(f"      {i}. [{res['score']:.4f}] {res['category']}/{Path(res['path']).name}")
    
    print("\n\n" + "=" * 80)
    print("PATTERN ANALYSIS")
    print("=" * 80)
    print("""
Based on the results above, we can identify patterns for optimal query construction:

1. SIMPLE NOUNS work well:
   - "fireball", "shield", "lightning bolt"
   - Avoid verbose descriptions

2. DESCRIPTOR + ELEMENT patterns:
   - "fire explosion", "healing magic", "death magic"
   - Works better than full spell names for abstract concepts

3. VISUAL ATTRIBUTES help:
   - "blue lightning", "green healing light", "black skull"
   - Color + element can be very effective

4. AVOID:
   - Full sentences: "a magical shield that protects"
   - Articles: "the fireball", "a healing spell"
   - Overly specific: "necromantic finger pointing spell"

RECOMMENDATION:
Generate queries as: [color/visual-adj] [element/concept] [optional-type]
Examples:
- "fire explosion"
- "blue lightning"
- "green healing"
- "dark necromancy"
- "magic shield"
    """)
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()


