#!/usr/bin/env python3
"""
Test different description styles for spell image search.
Compares results from different description formats to find the best approach.
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import argparse
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


def test_spell_descriptions(
    index_path: str,
    metadata_path: str,
    spells_dir: str
):
    # Load infrastructure
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
    
    # Load some sample spells for testing
    spell_files = list(Path(spells_dir).glob('*.json'))[:10]  # Test with 10 spells
    
    # Different description styles to test
    styles = {
        "spanish_short": lambda s: s.get('visualdescription', s.get('name', '')),
        "english_name": lambda s: s.get('originalName', s.get('name', '')),
        "english_simple": lambda s: generate_english_simple(s),
        "english_visual": lambda s: generate_english_visual(s),
        "english_keywords": lambda s: generate_english_keywords(s),
    }
    
    print("=" * 80)
    print("TESTING DIFFERENT DESCRIPTION STYLES FOR IMAGE SEARCH")
    print("=" * 80)
    print()
    
    for spell_file in spell_files:
        with open(spell_file, 'r', encoding='utf-8') as f:
            spell = json.load(f)
        
        print("\n" + "=" * 80)
        print(f"SPELL: {spell.get('name')} ({spell.get('originalName', 'N/A')})")
        print(f"Level: {spell.get('level')}, School: {spell.get('school')}")
        print(f"Descriptors: {', '.join(spell.get('descriptors', []))}")
        print("-" * 80)
        
        for style_name, style_func in styles.items():
            query = style_func(spell)
            
            print(f"\n📝 Style: {style_name.upper()}")
            print(f"   Query: '{query}'")
            
            results = search_single(index, metadata, processor, model, query, device, top_k=3)
            
            print("   Top 3 results:")
            for i, res in enumerate(results, 1):
                print(f"      {i}. [{res['score']:.4f}] {res['category']}/{Path(res['path']).name}")
        
        print()
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80)


def generate_english_simple(spell: dict) -> str:
    """Style: Simple English name"""
    return spell.get('originalName', spell.get('name', ''))


def generate_english_visual(spell: dict) -> str:
    """Style: Visual elements in English"""
    name = spell.get('originalName', '').lower()
    descriptors = spell.get('descriptors', [])
    
    # Manual mapping for common patterns (in production, use LLM)
    if 'fire' in name or 'fuego' in descriptors:
        if 'ball' in name or 'bola' in name:
            return "fire explosion"
        if 'ray' in name or 'rayo' in name:
            return "fire beam"
        if 'wall' in name or 'muro' in name:
            return "wall of flames"
        return "fire magic"
    
    if 'ice' in name or 'hielo' in descriptors or 'frío' in descriptors:
        return "ice magic"
    
    if 'lightning' in name or 'eléctrico' in descriptors:
        return "lightning bolt"
    
    if 'heal' in name or 'curar' in name:
        return "healing magic"
    
    # Default: use original name
    return spell.get('originalName', spell.get('name', ''))


def generate_english_keywords(spell: dict) -> str:
    """Style: Keywords extracted from descriptors and school"""
    parts = []
    
    # Add descriptors translated
    descriptors = spell.get('descriptors', [])
    descriptor_map = {
        'fuego': 'fire',
        'frío': 'ice',
        'eléctrico': 'lightning',
        'ácido': 'acid',
        'sónico': 'sonic',
        'luz': 'light',
        'oscuridad': 'darkness',
    }
    
    for desc in descriptors:
        desc_lower = desc.lower()
        if desc_lower in descriptor_map:
            parts.append(descriptor_map[desc_lower])
    
    # Add school keyword
    school = spell.get('school', '')
    school_map = {
        'Evocación': 'magic',
        'Abjuración': 'protection',
        'Conjuración': 'summoning',
        'Ilusión': 'illusion',
        'Adivinación': 'divination',
        'Encantamiento': 'enchantment',
        'Nigromancia': 'necromancy',
        'Transmutación': 'transformation',
    }
    
    if school in school_map:
        parts.append(school_map[school])
    
    if parts:
        return ' '.join(parts)
    
    # Fallback to English name
    return spell.get('originalName', spell.get('name', ''))


def main():
    parser = argparse.ArgumentParser(
        description="Test different description styles for spell image search"
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
        "--spells_dir",
        type=str,
        default="../visualPlayground/server/data/entities/spell",
        help="Directory containing spell JSON files"
    )
    
    args = parser.parse_args()
    
    test_spell_descriptions(
        index_path=args.index,
        metadata_path=args.metadata,
        spells_dir=args.spells_dir
    )


if __name__ == "__main__":
    main()


