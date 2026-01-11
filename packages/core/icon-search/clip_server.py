#!/usr/bin/env python3
"""
FastAPI server for CLIP-based semantic image search.

Exposes the CLIP search functionality over HTTP for use by the Bun server.

Usage:
    python3 clip_server.py
    
Then access at http://localhost:8000
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import json
import logging
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np
import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import CLIPModel, CLIPProcessor

# =============================================================================
# Configuration
# =============================================================================

MODEL_NAME = "openai/clip-vit-base-patch32"
DEFAULT_INDEX_PATH = "data/faiss.index"
DEFAULT_METADATA_PATH = "data/metadata.jsonl"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# Models
# =============================================================================

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10
    category_filter: Optional[str] = None


class SearchResult(BaseModel):
    path: str
    score: float
    category: str


class SearchResponse(BaseModel):
    query: str
    top_k: int
    results: List[SearchResult]


class HealthResponse(BaseModel):
    status: str
    model: str
    device: str
    index_size: int


# =============================================================================
# CLIP Search Engine
# =============================================================================

class ClipSearchEngine:
    def __init__(
        self, 
        index_path: str = DEFAULT_INDEX_PATH,
        metadata_path: str = DEFAULT_METADATA_PATH
    ):
        logger.info("Initializing CLIP Search Engine...")
        
        # Validate paths
        if not Path(index_path).exists():
            raise FileNotFoundError(f"Index file not found: {index_path}")
        if not Path(metadata_path).exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        
        # Load FAISS index
        logger.info(f"Loading FAISS index from {index_path}")
        self.index = faiss.read_index(index_path)
        
        # Load metadata
        logger.info(f"Loading metadata from {metadata_path}")
        self.metadata = self._load_metadata(metadata_path)
        
        # Determine device
        self.device = self._get_device()
        logger.info(f"Using device: {self.device}")
        
        # Load CLIP model
        logger.info(f"Loading CLIP model: {MODEL_NAME}")
        self.processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        self.model = CLIPModel.from_pretrained(MODEL_NAME).to(self.device)
        self.model.eval()
        
        logger.info(f"✓ CLIP Search Engine ready! ({len(self.metadata)} images indexed)")
    
    def _get_device(self) -> str:
        if torch.cuda.is_available():
            return "cuda"
        if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    
    def _load_metadata(self, metadata_path: str) -> List[dict]:
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
    
    def _get_text_embedding(self, text: str) -> np.ndarray:
        inputs = self.processor(
            text=[text], 
            return_tensors="pt", 
            padding=True, 
            truncation=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model.get_text_features(**inputs)
        
        # Convert to numpy and normalize L2
        embedding = outputs.cpu().numpy().astype(np.float32)
        norm = np.linalg.norm(embedding, axis=1, keepdims=True)
        if norm[0, 0] != 0:
            embedding = embedding / norm
        
        return embedding
    
    def search(
        self, 
        query: str, 
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> List[SearchResult]:
        # Get query embedding
        query_embedding = self._get_text_embedding(query)
        
        # Search with multiplier if filtering
        search_k = top_k
        if category_filter:
            search_k = min(top_k * 5, self.index.ntotal)
        else:
            search_k = min(top_k, self.index.ntotal)
        
        # Search FAISS index
        scores, indices = self.index.search(query_embedding, search_k)
        
        # Build results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            
            record = self.metadata[idx]
            
            # Apply category filter
            if category_filter:
                if record['category'].lower() != category_filter.lower():
                    continue
            
            results.append(SearchResult(
                path=record['path'],
                score=float(score),
                category=record['category']
            ))
            
            if len(results) >= top_k:
                break
        
        return results


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title="CLIP Image Search API",
    description="Semantic image search using OpenAI CLIP",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global search engine instance
search_engine: Optional[ClipSearchEngine] = None


@app.on_event("startup")
async def startup_event():
    global search_engine
    try:
        search_engine = ClipSearchEngine()
    except Exception as e:
        logger.error(f"Failed to initialize search engine: {e}")
        raise


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    if search_engine is None:
        raise HTTPException(status_code=503, detail="Search engine not initialized")
    
    return HealthResponse(
        status="ok",
        model=MODEL_NAME,
        device=search_engine.device,
        index_size=len(search_engine.metadata)
    )


@app.post("/search", response_model=SearchResponse)
async def search_images(request: SearchRequest):
    """
    Semantic search for images using CLIP.
    
    Example:
        POST /search
        {
            "query": "blue lightning strike",
            "top_k": 10,
            "category_filter": "SkillsIcons"
        }
    """
    if search_engine is None:
        raise HTTPException(status_code=503, detail="Search engine not initialized")
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    if request.top_k < 1 or request.top_k > 100:
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 100")
    
    try:
        results = search_engine.search(
            query=request.query,
            top_k=request.top_k,
            category_filter=request.category_filter
        )
        
        return SearchResponse(
            query=request.query,
            top_k=request.top_k,
            results=results
        )
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search", response_model=SearchResponse)
async def search_images_get(
    q: str = Query(..., description="Search query"),
    top_k: int = Query(10, ge=1, le=100, description="Number of results"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Semantic search for images using CLIP (GET endpoint for convenience).
    
    Example:
        GET /search?q=blue+lightning&top_k=5&category=SkillsIcons
    """
    return await search_images(SearchRequest(
        query=q,
        top_k=top_k,
        category_filter=category
    ))


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CLIP Image Search API",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "search": "POST /search or GET /search?q=...",
        }
    }


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 80)
    print("🚀 Starting CLIP Image Search Server")
    print("=" * 80)
    print(f"\nModel: {MODEL_NAME}")
    print(f"Index: {DEFAULT_INDEX_PATH}")
    print(f"Metadata: {DEFAULT_METADATA_PATH}")
    print("\nServer will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\n" + "=" * 80 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )


