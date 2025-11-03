from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
from pathlib import Path
import json

app = FastAPI(title="Campus Fix ML API", version="1.0.0")

# CORS для работы с frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные переменные для моделей
MODELS_DIR = Path("models")
embeddings = None
clusters = None
model = None
cluster_solutions = {}
categories = []
priorities = []

class IssueRequest(BaseModel):
    description: str
    category: Optional[str] = None
    location: Optional[str] = None

@app.on_event("startup")
async def load_models():
    """Загрузить все ML модели при старте сервиса"""
    global embeddings, clusters, model, cluster_solutions, categories, priorities
    
    try:
        print("\n" + "="*50)
        print("Loading ML Models...")
        print("="*50)
        
        # Создать папку models если не существует
        MODELS_DIR.mkdir(exist_ok=True)
        
        # Загрузить embeddings
        if (MODELS_DIR / "embeddings.npy").exists():
            embeddings = np.load(MODELS_DIR / "embeddings.npy")
            print(f"✓ Loaded embeddings: {embeddings.shape}")
        else:
            print("⚠️  embeddings.npy not found - will use fallback mode")
        
        # Загрузить кластеры
        if (MODELS_DIR / "clusters.npy").exists():
            clusters = np.load(MODELS_DIR / "clusters.npy")
            print(f"✓ Loaded clusters: {len(clusters)} items")
        else:
            print("⚠️  clusters.npy not found")
        
        # Загрузить категории и приоритеты
        if (MODELS_DIR / "metadata.json").exists():
            with open(MODELS_DIR / "metadata.json", 'r') as f:
                metadata = json.load(f)
                categories = metadata.get('categories', [])
                priorities = metadata.get('priorities', [])
            print(f"✓ Loaded metadata: {len(categories)} categories")
        
        # Загрузить Sentence-BERT модель
        print("Loading Sentence-BERT model (this may take a moment)...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✓ Loaded Sentence-BERT model")
        
        # Загрузить решения кластеров
        if (MODELS_DIR / "cluster_solutions.json").exists():
            with open(MODELS_DIR / "cluster_solutions.json", 'r', encoding='utf-8') as f:
                cluster_solutions = json.load(f)
            print(f"✓ Loaded {len(cluster_solutions)} cluster solutions")
        else:
            print("⚠️  cluster_solutions.json not found - using defaults")
            cluster_solutions = create_default_solutions()
            # Сохранить дефолтные решения
            with open(MODELS_DIR / "cluster_solutions.json", 'w', encoding='utf-8') as f:
                json.dump(cluster_solutions, f, indent=2, ensure_ascii=False)
            print("✓ Created default cluster_solutions.json")
        
        print("\n✅ ML models loaded successfully!")
        print("="*50 + "\n")
    except Exception as e:
        print(f"\n⚠️  Warning: Could not load all models: {e}")
        print("   Service will use fallback mode\n")

def create_default_solutions():
    """Создать дефолтные решения для кластеров"""
    return {
        "default": {
            "solution": "Contact the maintenance team for assistance. Please provide detailed description and photos if possible.",
            "estimated_time": "1-2 business days",
            "diy_possible": False,
            "tools_needed": [],
            "steps": ["Submit a detailed report", "Wait for technician assignment", "Maintenance team will contact you"],
            "default_priority": "medium"
        },
        "plumbing_sink": {
            "solution": "Check drain for clogs, try plunger, check shut-off valve",
            "estimated_time": "30 minutes",
            "diy_possible": True,
            "tools_needed": ["Plunger", "Wrench"],
            "steps": [
                "Check if there's a visible clog you can remove",
                "Try using a plunger",
                "Pour hot water down the drain",
                "Check if the shut-off valve is fully open"
            ],
            "default_priority": "medium"
        },
        "plumbing_toilet": {
            "solution": "Check flapper, adjust water level, clean fill valve",
            "estimated_time": "45 minutes",
            "diy_possible": True,
            "tools_needed": ["Plunger", "Screwdriver"],
            "steps": [
                "Is it clogged? Try a plunger first",
                "Not flushing? Check if the chain is connected inside the tank",
                "Running constantly? The flapper might need adjustment"
            ],
            "default_priority": "medium"
        },
        "electrical_lights": {
            "solution": "Replace bulb, check circuit breaker, inspect fixture",
            "estimated_time": "20 minutes",
            "diy_possible": True,
            "tools_needed": ["Light bulbs", "Ladder"],
            "steps": [
                "Check if the light bulb needs replacing",
                "Test other lights in the same room",
                "Check your circuit breaker panel"
            ],
            "default_priority": "low"
        },
        "electrical_outlet": {
            "solution": "⚠️ DANGER! Call electrician immediately. Do not use outlet.",
            "estimated_time": "2-4 hours (technician required)",
            "diy_possible": False,
            "tools_needed": ["Professional help required"],
            "steps": [
                "Do NOT use that outlet/switch",
                "Unplug everything nearby",
                "Turn off the circuit breaker if you know which one",
                "Call maintenance immediately"
            ],
            "default_priority": "high"
        },
        "hvac": {
            "solution": "Clean air filter, check for loose parts, lubricate fan",
            "estimated_time": "1 hour",
            "diy_possible": True,
            "tools_needed": ["New air filter", "Lubricant"],
            "steps": [
                "Check thermostat settings (should be 68-72°F)",
                "Ensure vents aren't blocked",
                "Check if the unit is actually running",
                "Try resetting the thermostat"
            ],
            "default_priority": "medium"
        },
        "internet": {
            "solution": "Restart router, check cables, forget/reconnect network",
            "estimated_time": "15 minutes",
            "diy_possible": True,
            "tools_needed": [],
            "steps": [
                "Restart your device",
                "Forget and reconnect to the network",
                "Try ethernet if available",
                "Test on another device"
            ],
            "default_priority": "low"
        }
    }

@app.post("/api/ml/recommend")
async def get_recommendation(request: IssueRequest):
    """Получить ML рекомендацию для нового отчета"""
    
    # Если модели не загружены - fallback
    if model is None:
        return create_fallback_response("ML models not loaded")
    
    try:
        # Генерировать embedding нового описания
        new_embedding = model.encode([request.description], convert_to_numpy=True)
        
        # Если есть обученные embeddings - найти похожие
        if embeddings is not None and len(embeddings) > 0:
            similarities = cosine_similarity(new_embedding, embeddings)[0]
            top_idx = np.argmax(similarities)
            best_similarity = float(similarities[top_idx])
            
            # Если похожесть низкая - fallback
            if best_similarity < 0.6:
                return create_fallback_response("No similar issues found", best_similarity)
            
            # Определить confidence
            if best_similarity > 0.85:
                confidence = "high"
            elif best_similarity > 0.7:
                confidence = "medium"
            else:
                confidence = "low"
            
            # Получить кластер
            cluster_id = int(clusters[top_idx]) if clusters is not None else -1
            
            # Подсчитать количество похожих проблем
            similar_count = int(np.sum(similarities > 0.7))
        else:
            # Нет обученных данных - использовать keyword matching
            return keyword_based_recommendation(request.description)
        
        # Получить решение из кластера
        solution = get_solution_for_cluster(cluster_id, request.description)
        
        return {
            "confidence": confidence,
            "similarity": best_similarity,
            "cluster_id": cluster_id,
            "similar_issues_count": similar_count,
            "suggested_category": solution.get("category", request.category or "other"),
            "suggested_priority": solution.get("default_priority", "medium"),
            "solution": solution.get("solution"),
            "estimated_time": solution.get("estimated_time"),
            "diy_possible": solution.get("diy_possible", False),
            "tools_needed": solution.get("tools_needed", []),
            "steps": solution.get("steps", []),
            "fallback": False
        }
    except Exception as e:
        print(f"Error in ML recommendation: {e}")
        return create_fallback_response(str(e))

def get_solution_for_cluster(cluster_id, description):
    """Получить решение для кластера с умным сопоставлением"""
    
    desc_lower = description.lower()
    
    # Keyword-based matching
    if 'sink' in desc_lower or 'drain' in desc_lower:
        return {**cluster_solutions.get('plumbing_sink', {}), "category": "plumbing"}
    elif 'toilet' in desc_lower:
        return {**cluster_solutions.get('plumbing_toilet', {}), "category": "plumbing"}
    elif 'light' in desc_lower or 'bulb' in desc_lower:
        return {**cluster_solutions.get('electrical_lights', {}), "category": "electrical"}
    elif 'outlet' in desc_lower or 'socket' in desc_lower or 'spark' in desc_lower:
        return {**cluster_solutions.get('electrical_outlet', {}), "category": "electrical"}
    elif 'wifi' in desc_lower or 'internet' in desc_lower or 'network' in desc_lower:
        return {**cluster_solutions.get('internet', {}), "category": "internet"}
    elif 'heat' in desc_lower or 'cold' in desc_lower or 'ac' in desc_lower or 'hvac' in desc_lower:
        return {**cluster_solutions.get('hvac', {}), "category": "hvac"}
    
    # Попробовать из кластера
    solution_key = str(cluster_id)
    if solution_key in cluster_solutions:
        return cluster_solutions[solution_key]
    
    # Default
    return cluster_solutions.get('default', {})

def keyword_based_recommendation(description):
    """Fallback рекомендация на основе ключевых слов"""
    
    solution = get_solution_for_cluster(-1, description)
    
    return {
        "confidence": "medium",
        "similarity": 0.0,
        "cluster_id": -1,
        "similar_issues_count": 0,
        "suggested_category": solution.get("category", "other"),
        "suggested_priority": solution.get("default_priority", "medium"),
        "solution": solution.get("solution"),
        "estimated_time": solution.get("estimated_time"),
        "diy_possible": solution.get("diy_possible", False),
        "tools_needed": solution.get("tools_needed", []),
        "steps": solution.get("steps", []),
        "fallback": False,
        "method": "keyword-based"
    }

def create_fallback_response(reason, similarity=0.0):
    """Создать fallback ответ"""
    return {
        "confidence": "low",
        "similarity": similarity,
        "message": reason,
        "fallback": True,
        "suggested_category": "other",
        "suggested_priority": "medium"
    }

@app.get("/api/ml/health")
async def health_check():
    """Health check для ML сервиса"""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "embeddings_loaded": embeddings is not None,
        "embeddings_count": len(embeddings) if embeddings is not None else 0,
        "clusters_count": len(set(clusters)) if clusters is not None else 0,
        "solutions_count": len(cluster_solutions)
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Campus Fix ML API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "recommend": "/api/ml/recommend",
            "health": "/api/ml/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

