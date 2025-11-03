# 🤖 ML Integration Guide - Campus Fix

Интеграция машинного обучения для автоматических рекомендаций решений проблем.

## 📊 Архитектура

```
Frontend (React) → Backend (Node.js) → ML Service (Python/FastAPI) → Trained Models
     ↓                    ↓                      ↓
  AI Chat          /api/ml/*           Sentence-BERT + DBSCAN
```

## 🚀 Быстрый старт

### 1. Установите Python зависимости

```bash
cd backend_ml
pip install -r requirements.txt
```

### 2. Установите Node.js зависимости (axios)

```bash
cd backend
npm install
```

### 3. Обучите модель (опционально)

Если у вас есть ваша Python модель кластеризации:

```python
# Запустите вашу модель
python your_clustering_script.py

# Сохраните результаты в backend_ml/models/:
# - embeddings.npy
# - clusters.npy
# - cluster_solutions.json
```

### 4. Запустите ML сервис

```bash
cd backend_ml
python ml_api.py
# или
uvicorn ml_api:app --reload --port 8000
```

Проверьте: http://localhost:8000

### 5. Запустите backend (в другом терминале)

```bash
cd backend
npm run dev
```

### 6. Запустите frontend (в третьем терминале)

```bash
npm run dev
```

## 🎯 Как это работает

### 1. Пользователь описывает проблему в AI Chat

```
User: "my sink is clogged"
```

### 2. Frontend отправляет запрос

```javascript
const mlResult = await mlAPI.analyzeIssue(message);
```

### 3. Backend проксирует в ML service

```javascript
// backend/routes/ml.js
POST /api/ml/analyze
→ Python ML API
```

### 4. ML сервис анализирует

```python
# Генерирует embedding
new_embedding = model.encode([description])

# Находит похожие проблемы
similarities = cosine_similarity(new_embedding, embeddings)

# Возвращает решение из кластера
```

### 5. Frontend показывает рекомендацию

```
🤖 ML Analysis (high confidence)
Found 15 similar issues in our database.

Suggested Solution:
Check drain for clogs, try plunger...

⏱️ Estimated time: 30 minutes
✅ DIY possible: Yes
🛠️ Tools needed: Plunger, Wrench

Steps to try:
1. Check if there's a visible clog
2. Try using a plunger
3. Pour hot water down the drain
```

## 📁 Структура файлов

```
campus-fix/
├── backend/
│   ├── routes/
│   │   └── ml.js              # ML proxy API
│   └── server.js              # Подключает ML routes
├── backend_ml/                # Python ML сервис
│   ├── ml_api.py             # FastAPI сервер
│   ├── requirements.txt       # Python зависимости
│   └── models/
│       ├── embeddings.npy     # Обученные embeddings
│       ├── clusters.npy       # Кластеры
│       └── cluster_solutions.json  # Решения
└── src/
    ├── services/
    │   └── ml.js              # Frontend ML API
    └── App.jsx                # Использует ML в AI Chat
```

## 🔧 Конфигурация

### Backend (.env)

Добавьте в `backend/.env`:

```env
ML_API_URL=http://localhost:8000
```

### Frontend (.env)

Уже настроено через `VITE_API_URL`

## 📊 Формат данных

### cluster_solutions.json

```json
{
  "0": {
    "solution": "Check drain for clogs, try plunger",
    "estimated_time": "30 minutes",
    "diy_possible": true,
    "tools_needed": ["Plunger", "Wrench"],
    "steps": [
      "Check if there's a visible clog",
      "Try using a plunger",
      "Pour hot water down the drain"
    ],
    "default_priority": "medium"
  },
  "plumbing_sink": {
    "solution": "...",
    "estimated_time": "...",
    ...
  }
}
```

### metadata.json (optional)

```json
{
  "categories": ["plumbing", "electrical", "hvac", "internet", "furniture", "other"],
  "priorities": ["low", "medium", "high"]
}
```

## 🔄 Режимы работы

### 1. Full ML Mode (если модели обучены)

- Использует trained embeddings
- Semantic search похожих проблем
- Возвращает решения из кластеров

### 2. Keyword-based Mode (если моделей нет)

- Keyword matching
- Предопределённые решения
- Всё равно работает!

### 3. Fallback Mode (если ML сервис недоступен)

- Rule-based логика во фронтенде
- Не требует ML сервиса

## 🎨 API Endpoints

### ML Service (Python)

```
POST /api/ml/recommend
GET  /api/ml/health
GET  /
```

### Backend (Node.js)

```
POST /api/ml/analyze
GET  /api/ml/health
```

## 📝 Пример использования

### Тестирование ML API напрямую

```bash
# Health check
curl http://localhost:8000/api/ml/health

# Analyze issue
curl -X POST http://localhost:8000/api/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "description": "my sink is clogged and water is not draining",
    "category": "plumbing"
  }'
```

### Через Node.js backend

```bash
curl -X POST http://localhost:5000/api/ml/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "my sink is clogged",
    "category": "plumbing"
  }'
```

## 🔍 Мониторинг

### Проверка статуса

```bash
# ML Service
curl http://localhost:8000/api/ml/health

# Через backend
curl http://localhost:5000/api/ml/health
```

### Логи

**Python ML Service:**
- Выводит в терминал
- Логирует загрузку моделей
- Показывает ошибки

**Node.js Backend:**
- `console.log` для ML запросов
- Логирует fallback при недоступности

## 🐛 Troubleshooting

### ML сервис не запускается

```bash
# Проверьте Python версию
python --version  # должен быть 3.8+

# Переустановите зависимости
pip install -r backend_ml/requirements.txt --upgrade
```

### Backend не может подключиться к ML

```bash
# Проверьте, запущен ли ML сервис
curl http://localhost:8000/api/ml/health

# Проверьте ML_API_URL в backend/.env
cat backend/.env | grep ML_API_URL
```

### Frontend не получает ML рекомендации

1. Откройте DevTools (F12) → Console
2. Ищите ошибки "ML analysis"
3. Проверьте Network tab → XHR → `/api/ml/analyze`

### Модели не найдены

```
⚠️ embeddings.npy not found - will use fallback mode
```

Это нормально! Сервис будет работать в keyword-based режиме.

Чтобы использовать обученные модели:
1. Обучите вашу модель кластеризации
2. Сохраните результаты в `backend_ml/models/`

## 🚀 Production Deployment

### Docker (рекомендуется)

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - ml_service
      - mongodb

  ml_service:
    build: ./backend_ml
    ports:
      - "8000:8000"
    volumes:
      - ./backend_ml/models:/app/models

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Без Docker

1. Deploy ML service на отдельный сервер
2. Обновите `ML_API_URL` в backend
3. Используйте nginx как reverse proxy

## 📈 Улучшения

### Следующие шаги:

1. **Онлайн обучение**
   - Добавить endpoint для обновления моделей
   - Переобучать на новых данных

2. **Feedback loop**
   - Пользователи оценивают рекомендации (👍/👎)
   - Использовать для улучшения модели

3. **A/B тестирование**
   - Сравнить ML vs rule-based
   - Измерить satisfaction

4. **Расширенная аналитика**
   - Dashboard для admins
   - Статистика по confidence
   - Tracking accuracy

## ✅ Checklist

- [ ] Python 3.8+ установлен
- [ ] pip install -r requirements.txt
- [ ] ML сервис запускается (localhost:8000)
- [ ] Backend подключается к ML
- [ ] Frontend показывает ML рекомендации
- [ ] Fallback работает без ML
- [ ] Логи чистые, нет ошибок

## 🎉 Готово!

Теперь ваш Campus Fix использует ML для умных рекомендаций! 🚀

**Протестируйте:**
1. Откройте сайт
2. Нажмите на AI Chat
3. Напишите: "my sink is clogged"
4. Должны увидеть "🤖 ML Analysis"

Если ML сервис не запущен - всё равно будет работать, просто без ML. 👍

