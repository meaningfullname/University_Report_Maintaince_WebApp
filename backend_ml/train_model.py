"""
Скрипт для обучения ML модели кластеризации проблем обслуживания
Генерирует синтетические данные и обучает модель
"""

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN, AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity
import json
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns

print("="*60)
print("Campus Fix ML Model Training")
print("="*60)
print()

# Создать папку для моделей
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

# =============================================
# 1. ГЕНЕРАЦИЯ СИНТЕТИЧЕСКИХ ДАННЫХ
# =============================================

print("Generating synthetic training data...")

# Примеры проблем для каждой категории
training_data = [
    # PLUMBING - Раковина (Cluster 0)
    "My sink is clogged and water won't drain",
    "Sink drain is blocked, water backing up",
    "Kitchen sink not draining properly",
    "Bathroom sink clogged with hair",
    "Water won't go down the drain in my sink",
    "Sink is completely blocked",
    "Slow draining sink in room 205",
    "Sink overflow, drain clogged",
    "Can't use sink, drain is blocked",
    "Sink filled with water, won't drain",
    
    # PLUMBING - Туалет (Cluster 1)
    "Toilet won't flush properly",
    "Toilet is clogged and overflowing",
    "Toilet keeps running after flush",
    "Toilet tank not filling up",
    "Toilet handle is broken",
    "Toilet leaking from base",
    "Toilet water running continuously",
    "Can't flush toilet, handle broken",
    "Toilet overflow emergency",
    "Toilet making strange noises",
    
    # PLUMBING - Протечки (Cluster 2)
    "Water leaking from ceiling",
    "Pipe burst in bathroom",
    "Leak under the sink",
    "Water dripping from faucet",
    "Shower head leaking constantly",
    "Water leak behind toilet",
    "Ceiling dripping water in my room",
    "Pipe leaking in dorm hallway",
    "Emergency water leak in room",
    "Faucet won't stop dripping",
    
    # ELECTRICAL - Освещение (Cluster 3)
    "Light bulb burned out in room",
    "Ceiling light not working",
    "Desk lamp won't turn on",
    "Bathroom light flickering",
    "Need light bulb replacement",
    "All lights out in my room",
    "Light switch not working",
    "Fluorescent light buzzing",
    "Light fixture broken",
    "No power to lights in room",
    
    # ELECTRICAL - Розетки (Cluster 4)
    "Outlet not working in room",
    "Power outlet sparked when I plugged in",
    "No electricity in wall outlet",
    "Outlet is loose and dangerous",
    "Multiple outlets not working",
    "Outlet smoking, emergency",
    "Can't charge phone, outlet dead",
    "Burnt smell from outlet",
    "Outlet making buzzing sound",
    "Need electrician, outlet sparking",
    
    # ELECTRICAL - Проводка (Cluster 5)
    "Circuit breaker keeps tripping",
    "Power outage in my room only",
    "Electrical short in room",
    "Exposed wires in wall",
    "Burning smell from wall outlet",
    "Electrical fire hazard",
    "No power in entire dorm room",
    "Breaker won't stay on",
    "Dangerous electrical situation",
    "Smoke from electrical panel",
    
    # HVAC - Отопление (Cluster 6)
    "Heater not working, room is freezing",
    "No heat in my dorm room",
    "Radiator is cold",
    "Heating system making loud noise",
    "Temperature too cold, heater broken",
    "Can't control room temperature",
    "Heater blowing cold air",
    "Room temperature very low",
    "Heating unit not turning on",
    "Thermostat not working",
    
    # HVAC - Кондиционер (Cluster 7)
    "AC not cooling room",
    "Air conditioner not working",
    "Room too hot, AC broken",
    "AC making strange noises",
    "Air conditioning unit leaking water",
    "AC blowing warm air",
    "Can't adjust temperature, AC broken",
    "Air conditioner won't turn on",
    "AC filter needs replacement",
    "Cooling system not functioning",
    
    # HVAC - Вентиляция (Cluster 8)
    "Strange smell from air vent",
    "No air flow from vents",
    "Vent cover fell off",
    "Air vent blocked",
    "Musty smell from HVAC",
    "Vent making rattling noise",
    "Poor air circulation in room",
    "Need air filter changed",
    "Vent leaking condensation",
    "Bad odor from heating system",
    
    # INTERNET/WIFI (Cluster 9)
    "WiFi not working in my room",
    "Internet connection very slow",
    "Can't connect to campus network",
    "No internet access in dorm",
    "Ethernet port not working",
    "WiFi keeps disconnecting",
    "Router not working",
    "Network down in building",
    "Can't get online, no signal",
    "Internet outage in room",
    
    # FURNITURE - Мебель (Cluster 10)
    "Desk drawer is broken",
    "Chair leg is loose",
    "Bed frame is squeaking",
    "Cabinet door won't close",
    "Desk is wobbly",
    "Broken shelf in closet",
    "Chair arm rest broken",
    "Bed slats need replacement",
    "Drawer handle came off",
    "Furniture damage needs repair",
    
    # FURNITURE - Матрас/Постель (Cluster 11)
    "Mattress is sagging badly",
    "Bed springs are broken",
    "Need new mattress, this one is old",
    "Mattress has stains and smells",
    "Bed frame collapsed",
    "Mattress protector torn",
    "Bed is uncomfortable and broken",
    "Spring poking through mattress",
    "Bed making creaking noise",
    "Need bed replacement",
    
    # OTHER - Окна/Двери (Cluster 12)
    "Window won't open",
    "Door lock is broken",
    "Window is drafty, cold air coming in",
    "Door handle loose",
    "Can't lock my room door",
    "Window screen has hole",
    "Door squeaks loudly",
    "Window won't close properly",
    "Broken window latch",
    "Door won't stay closed",
    
    # OTHER - Разное (Cluster 13)
    "Smoke detector beeping constantly",
    "Mold growing on wall",
    "Paint peeling from ceiling",
    "Pest problem in room",
    "Bad smell in room, can't identify",
    "Water stain on ceiling",
    "Carpet damaged and dirty",
    "Wall has hole that needs patching",
    "Blinds are broken",
    "Mirror fell off wall",
]

print(f"+ Generated {len(training_data)} training samples")
print()

# =============================================
# 2. ГЕНЕРАЦИЯ EMBEDDINGS
# =============================================

print("Loading Sentence-BERT model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("+ Model loaded")
print()

print("Generating embeddings...")
embeddings = model.encode(training_data, convert_to_numpy=True, show_progress_bar=True)
print(f"+ Embeddings shape: {embeddings.shape}")
print()

# =============================================
# 3. КЛАСТЕРИЗАЦИЯ
# =============================================

print("Performing clustering...")

# Попробуем оба метода
print("\n--- Method 1: DBSCAN ---")
dbscan = DBSCAN(eps=0.3, min_samples=3, metric='cosine')
dbscan_clusters = dbscan.fit_predict(embeddings)
n_dbscan_clusters = len(set(dbscan_clusters)) - (1 if -1 in dbscan_clusters else 0)
n_dbscan_noise = list(dbscan_clusters).count(-1)
print(f"DBSCAN found {n_dbscan_clusters} clusters (noise: {n_dbscan_noise} samples)")

print("\n--- Method 2: Agglomerative Clustering ---")
n_clusters = 14  # Мы создали примерно 14 категорий
agg = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward')
agg_clusters = agg.fit_predict(embeddings)
print(f"Agglomerative created {n_clusters} clusters")

# Выбираем Agglomerative (более предсказуемый)
clusters = agg_clusters
print(f"\n+ Using Agglomerative Clustering with {n_clusters} clusters")
print()

# =============================================
# 4. АНАЛИЗ КЛАСТЕРОВ
# =============================================

print("Cluster Analysis:")
print("-" * 60)

df = pd.DataFrame({
    'issue': training_data,
    'cluster': clusters
})

for cluster_id in sorted(df['cluster'].unique()):
    cluster_issues = df[df['cluster'] == cluster_id]['issue'].tolist()
    print(f"\nCluster {cluster_id} ({len(cluster_issues)} issues):")
    for issue in cluster_issues[:3]:  # Показать первые 3
        print(f"  • {issue}")
    if len(cluster_issues) > 3:
        print(f"  ... and {len(cluster_issues) - 3} more")

print()

# =============================================
# 5. СОЗДАНИЕ РЕШЕНИЙ ДЛЯ КЛАСТЕРОВ
# =============================================

print("Creating cluster solutions...")

# Определяем решения на основе анализа кластеров
cluster_solutions = {}

for cluster_id in sorted(df['cluster'].unique()):
    cluster_issues = df[df['cluster'] == cluster_id]['issue'].tolist()
    first_issue = cluster_issues[0].lower()
    
    # Определяем категорию и решение на основе содержимого
    if 'sink' in first_issue or 'drain' in first_issue:
        solution = {
            "solution": "Check drain for clogs, try plunger, check shut-off valve. Pour hot water down drain.",
            "estimated_time": "30 minutes",
            "diy_possible": True,
            "tools_needed": ["Plunger", "Wrench", "Bucket"],
            "steps": [
                "Check if there's a visible clog you can remove",
                "Try using a plunger",
                "Pour hot water down the drain",
                "Check if the shut-off valve is fully open",
                "If problem persists, submit maintenance request"
            ],
            "default_priority": "medium",
            "category": "plumbing"
        }
    elif 'toilet' in first_issue:
        solution = {
            "solution": "Check flapper, adjust water level, try plunger if clogged. Check chain connection.",
            "estimated_time": "45 minutes",
            "diy_possible": True,
            "tools_needed": ["Plunger", "Screwdriver"],
            "steps": [
                "Is it clogged? Try a plunger first",
                "Not flushing? Check if the chain is connected inside the tank",
                "Running constantly? The flapper might need adjustment",
                "Check water level in tank"
            ],
            "default_priority": "medium",
            "category": "plumbing"
        }
    elif 'leak' in first_issue or 'drip' in first_issue or 'pipe' in first_issue:
        solution = {
            "solution": "WARNING! Turn off water supply immediately. Place bucket under leak. Call maintenance urgently.",
            "estimated_time": "2-4 hours (emergency)",
            "diy_possible": False,
            "tools_needed": ["Bucket", "Towels"],
            "steps": [
                "Turn off water supply valve immediately",
                "Place bucket or towels to catch water",
                "Take photos of damage",
                "Submit emergency maintenance request",
                "Evacuate if flooding is severe"
            ],
            "default_priority": "high",
            "category": "plumbing"
        }
    elif 'light' in first_issue or 'bulb' in first_issue or 'lamp' in first_issue:
        solution = {
            "solution": "Replace bulb, check circuit breaker, inspect fixture. Try different bulb first.",
            "estimated_time": "15 minutes",
            "diy_possible": True,
            "tools_needed": ["Light bulbs", "Ladder"],
            "steps": [
                "Check if the light bulb needs replacing",
                "Test other lights in the same room",
                "Check your circuit breaker panel",
                "Try replacing with known working bulb"
            ],
            "default_priority": "low",
            "category": "electrical"
        }
    elif 'outlet' in first_issue or 'socket' in first_issue or 'spark' in first_issue or 'smoke' in first_issue:
        solution = {
            "solution": "DANGER! Do NOT use outlet. Unplug everything. Turn off breaker. Call electrician immediately.",
            "estimated_time": "2-4 hours (emergency - professional required)",
            "diy_possible": False,
            "tools_needed": ["Professional help required - DO NOT ATTEMPT DIY"],
            "steps": [
                "Do NOT use that outlet/switch",
                "Unplug everything nearby immediately",
                "Turn off the circuit breaker if you know which one",
                "Call campus security if smoke/fire",
                "Submit emergency maintenance request"
            ],
            "default_priority": "high",
            "category": "electrical"
        }
    elif 'power' in first_issue or 'electric' in first_issue or 'breaker' in first_issue or 'wire' in first_issue:
        solution = {
            "solution": "Check circuit breaker panel. Reset tripped breakers. If problem persists, call electrician.",
            "estimated_time": "1-2 hours (professional may be needed)",
            "diy_possible": False,
            "tools_needed": [],
            "steps": [
                "Locate circuit breaker panel",
                "Look for tripped breakers (switch in middle position)",
                "Turn breaker fully OFF then back ON",
                "If it trips again immediately, call electrician",
                "Do not force breakers or touch wires"
            ],
            "default_priority": "high",
            "category": "electrical"
        }
    elif 'heat' in first_issue or 'cold' in first_issue or 'radiator' in first_issue or 'temperature' in first_issue and 'internet' not in first_issue:
        solution = {
            "solution": "Check thermostat settings (68-72°F). Ensure vents not blocked. Try reset.",
            "estimated_time": "1 hour",
            "diy_possible": True,
            "tools_needed": [],
            "steps": [
                "Check thermostat settings (should be 68-72°F)",
                "Ensure vents aren't blocked by furniture",
                "Check if the unit is actually running",
                "Try resetting the thermostat",
                "Wait 15 minutes after adjustments"
            ],
            "default_priority": "high",
            "category": "hvac"
        }
    elif 'ac' in first_issue or 'air condition' in first_issue or 'cooling' in first_issue or 'hot' in first_issue:
        solution = {
            "solution": "Check thermostat, clean/replace filter, ensure unit is on. Check for ice buildup.",
            "estimated_time": "1 hour",
            "diy_possible": True,
            "tools_needed": ["New air filter (if available)"],
            "steps": [
                "Check thermostat is set to COOL mode",
                "Set temperature lower than current room temp",
                "Clean or replace air filter",
                "Check for ice on coils (turn off if frozen)",
                "Ensure nothing blocking air flow"
            ],
            "default_priority": "medium",
            "category": "hvac"
        }
    elif 'vent' in first_issue or 'air flow' in first_issue or 'smell' in first_issue and 'hvac' not in first_issue:
        solution = {
            "solution": "Check vents for blockage. Replace air filter if accessible. Report persistent odors.",
            "estimated_time": "30 minutes",
            "diy_possible": True,
            "tools_needed": [],
            "steps": [
                "Check all vents are open and unblocked",
                "Look for visible debris in vents",
                "Note any unusual smells (gas, burning, mold)",
                "If gas smell, evacuate and call emergency",
                "Submit maintenance request for persistent issues"
            ],
            "default_priority": "medium",
            "category": "hvac"
        }
    elif 'wifi' in first_issue or 'internet' in first_issue or 'network' in first_issue or 'ethernet' in first_issue:
        solution = {
            "solution": "Restart device, forget/reconnect network, try ethernet. Check IT status page.",
            "estimated_time": "15 minutes",
            "diy_possible": True,
            "tools_needed": ["Ethernet cable (optional)"],
            "steps": [
                "Restart your device",
                "Forget and reconnect to the WiFi network",
                "Try ethernet cable if available",
                "Check campus IT status page",
                "Test on another device to isolate problem",
                "Contact IT helpdesk if campus-wide"
            ],
            "default_priority": "low",
            "category": "internet"
        }
    elif 'furniture' in first_issue or 'desk' in first_issue or 'chair' in first_issue or 'drawer' in first_issue:
        solution = {
            "solution": "Tighten screws if loose. Report broken furniture for repair/replacement.",
            "estimated_time": "24-48 hours (maintenance)",
            "diy_possible": True,
            "tools_needed": ["Screwdriver (if you have one)"],
            "steps": [
                "Check for loose screws and tighten if possible",
                "Take photos of damage",
                "Remove any sharp or dangerous parts",
                "Submit maintenance request with photos",
                "Note if furniture is unusable"
            ],
            "default_priority": "low",
            "category": "furniture"
        }
    elif 'bed' in first_issue or 'mattress' in first_issue or 'spring' in first_issue:
        solution = {
            "solution": "Report mattress issues for replacement. Check bed frame for loose bolts.",
            "estimated_time": "1-3 days (replacement)",
            "diy_possible": False,
            "tools_needed": [],
            "steps": [
                "Document issue with photos",
                "Check if bed frame bolts need tightening",
                "Submit maintenance request for mattress replacement",
                "Request temporary sleeping arrangement if urgent",
                "Note any health/comfort concerns"
            ],
            "default_priority": "medium",
            "category": "furniture"
        }
    elif 'window' in first_issue or 'door' in first_issue or 'lock' in first_issue:
        solution = {
            "solution": "Check for obstructions. Lubricate hinges. Report lock/security issues immediately.",
            "estimated_time": "2-4 hours (lock issues are priority)",
            "diy_possible": False,
            "tools_needed": [],
            "steps": [
                "Check for visible obstructions",
                "Do NOT force locks or windows",
                "Report security issues (broken locks) immediately",
                "Take photos of damage",
                "Note if room security is compromised"
            ],
            "default_priority": "high" if 'lock' in first_issue else "medium",
            "category": "other"
        }
    else:
        # Default для остальных
        solution = {
            "solution": "Document the issue with photos and description. Submit maintenance request with details.",
            "estimated_time": "1-2 business days",
            "diy_possible": False,
            "tools_needed": [],
            "steps": [
                "Take clear photos of the issue",
                "Write detailed description",
                "Note when problem started",
                "Submit maintenance report",
                "Follow up if urgent"
            ],
            "default_priority": "medium",
            "category": "other"
        }
    
    cluster_solutions[str(cluster_id)] = solution
    print(f"  Cluster {cluster_id}: {solution['category']} - {solution['solution'][:50]}...")

print()

# =============================================
# 6. СОХРАНЕНИЕ МОДЕЛЕЙ
# =============================================

print("Saving models and data...")

# Сохранить embeddings
embeddings_path = MODELS_DIR / "embeddings.npy"
np.save(embeddings_path, embeddings)
print(f"+ Saved embeddings to {embeddings_path}")

# Сохранить кластеры
clusters_path = MODELS_DIR / "clusters.npy"
np.save(clusters_path, clusters)
print(f"+ Saved clusters to {clusters_path}")

# Сохранить решения кластеров
solutions_path = MODELS_DIR / "cluster_solutions.json"
with open(solutions_path, 'w', encoding='utf-8') as f:
    json.dump(cluster_solutions, f, indent=2, ensure_ascii=False)
print(f"+ Saved cluster solutions to {solutions_path}")

# Сохранить метаданные
metadata = {
    "n_samples": len(training_data),
    "n_clusters": len(set(clusters)),
    "embedding_dim": embeddings.shape[1],
    "model": "all-MiniLM-L6-v2",
    "clustering": "AgglomerativeClustering",
    "categories": ["plumbing", "electrical", "hvac", "internet", "furniture", "other"],
    "priorities": ["low", "medium", "high"]
}
metadata_path = MODELS_DIR / "metadata.json"
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"+ Saved metadata to {metadata_path}")

# Сохранить training data для справки
training_data_path = MODELS_DIR / "training_data.json"
with open(training_data_path, 'w') as f:
    json.dump({
        "issues": training_data,
        "clusters": clusters.tolist()
    }, f, indent=2)
print(f"+ Saved training data to {training_data_path}")

print()

# =============================================
# 7. ВИЗУАЛИЗАЦИЯ (опционально)
# =============================================

try:
    print("Creating visualization...")
    
    from sklearn.decomposition import PCA
    
    # Уменьшить размерность для визуализации
    pca = PCA(n_components=2)
    embeddings_2d = pca.fit_transform(embeddings)
    
    # Создать график
    plt.figure(figsize=(12, 8))
    scatter = plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1], 
                         c=clusters, cmap='tab20', alpha=0.6, s=100)
    plt.colorbar(scatter, label='Cluster')
    plt.title('Issue Clustering Visualization (PCA 2D projection)', fontsize=14, fontweight='bold')
    plt.xlabel('PCA Component 1')
    plt.ylabel('PCA Component 2')
    plt.grid(True, alpha=0.3)
    
    viz_path = MODELS_DIR / "clustering_visualization.png"
    plt.savefig(viz_path, dpi=150, bbox_inches='tight')
    print(f"+ Saved visualization to {viz_path}")
    plt.close()
    
except Exception as e:
    print(f"! Could not create visualization: {e}")

print()

# =============================================
# 8. ТЕСТИРОВАНИЕ
# =============================================

print("Testing model with sample queries...")
print("-" * 60)

test_queries = [
    "my bathroom sink won't drain",
    "the outlet is sparking",
    "room is too cold",
    "wifi not connecting",
    "desk drawer is broken"
]

for query in test_queries:
    # Генерировать embedding запроса
    query_embedding = model.encode([query], convert_to_numpy=True)
    
    # Найти наиболее похожий
    similarities = cosine_similarity(query_embedding, embeddings)[0]
    best_idx = np.argmax(similarities)
    best_similarity = similarities[best_idx]
    cluster_id = int(clusters[best_idx])
    
    print(f"\nQuery: '{query}'")
    print(f"  -> Most similar: '{training_data[best_idx]}'")
    print(f"  -> Similarity: {best_similarity:.3f}")
    print(f"  -> Cluster: {cluster_id}")
    print(f"  -> Solution: {cluster_solutions[str(cluster_id)]['solution'][:60]}...")
    print(f"  -> Category: {cluster_solutions[str(cluster_id)]['category']}")

print()
print("="*60)
print("SUCCESS! Model training completed!")
print("="*60)
print()
print("Files created in models/:")
print(f"  * embeddings.npy ({embeddings.nbytes / 1024:.1f} KB)")
print(f"  * clusters.npy ({clusters.nbytes / 1024:.1f} KB)")
print(f"  * cluster_solutions.json")
print(f"  * metadata.json")
print(f"  * training_data.json")
print(f"  * clustering_visualization.png (if matplotlib available)")
print()
print("You can now restart the ML API to use these trained models!")
print()

