# 🤖 Campus Fix ML Service

Python FastAPI сервис для ML-анализа проблем обслуживания.

## Установка

```bash
pip install -r requirements.txt
```

## Запуск

```bash
# Разработка
python ml_api.py

# Или через uvicorn
uvicorn ml_api:app --reload --port 8000

# Production
uvicorn ml_api:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### POST /api/ml/recommend

Получить рекомендацию для проблемы.

**Request:**
```json
{
  "description": "my sink is clogged and water is not draining",
  "category": "plumbing",
  "location": "Dorm A - Room 205"
}
```

**Response:**
```json
{
  "confidence": "high",
  "similarity": 0.92,
  "cluster_id": 0,
  "similar_issues_count": 15,
  "suggested_category": "plumbing",
  "suggested_priority": "medium",
  "solution": "Check drain for clogs, try plunger...",
  "estimated_time": "30 minutes",
  "diy_possible": true,
  "tools_needed": ["Plunger", "Wrench"],
  "steps": ["Check if there's a visible clog", "..."],
  "fallback": false
}
```

### GET /api/ml/health

Проверка статуса сервиса.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "embeddings_loaded": true,
  "embeddings_count": 150,
  "clusters_count": 12,
  "solutions_count": 8
}
```

## Модели

Поместите обученные модели в папку `models/`:

- `embeddings.npy` - Sentence-BERT embeddings всех проблем
- `clusters.npy` - Предсказанные кластеры (DBSCAN/Hierarchical)
- `cluster_solutions.json` - Решения для каждого кластера
- `metadata.json` - Категории и приоритеты (опционально)

## Режимы работы

### 1. Full ML Mode
Если все модели загружены - использует semantic search.

### 2. Keyword-based Mode
Если моделей нет - использует keyword matching.

### 3. Default Solutions
Всегда есть default решения в коде.

## Интеграция с вашей моделью

Если у вас есть обученная модель кластеризации:

```python
# Сохраните embeddings
np.save('models/embeddings.npy', your_embeddings)

# Сохраните кластеры
np.save('models/clusters.npy', your_clusters)

# Создайте cluster_solutions.json
solutions = {
    "0": {
        "solution": "...",
        "estimated_time": "...",
        "diy_possible": true,
        ...
    }
}

import json
with open('models/cluster_solutions.json', 'w') as f:
    json.dump(solutions, f, indent=2)
```

## Тестирование

```bash
# Health check
curl http://localhost:8000/api/ml/health

# Test recommendation
curl -X POST http://localhost:8000/api/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{"description": "my sink is clogged"}'
```

## Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "ml_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t campus-fix-ml .
docker run -p 8000:8000 -v $(pwd)/models:/app/models campus-fix-ml
```

