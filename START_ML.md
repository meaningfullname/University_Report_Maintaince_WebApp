# 🚀 Быстрый старт ML интеграции

## Сначала проверим, что всё работает БЕЗ ML

1. Запустите только backend и frontend:
   ```bash
   # Terminal 1
   cd backend
   npm run dev
   
   # Terminal 2
   npm run dev
   ```

2. Откройте http://localhost:5173
3. Попробуйте AI Chat - должен работать с rule-based логикой

## Теперь добавим ML

### Шаг 1: Установите Python зависимости

```bash
cd backend_ml
pip install -r requirements.txt
```

**Ожидайте 1-2 минуты** - устанавливаются тяжёлые библиотеки (transformers, torch).

### Шаг 2: Запустите ML сервис

```bash
# Из папки backend_ml
python ml_api.py
```

Должны увидеть:
```
==================================================
Loading ML Models...
==================================================
⚠️  embeddings.npy not found - will use fallback mode
⚠️  clusters.npy not found
✓ Loaded Sentence-BERT model
✓ Created default cluster_solutions.json

✅ ML models loaded successfully!
==================================================

INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Это нормально!** Сервис работает в keyword-based режиме.

### Шаг 3: Проверьте ML API

```bash
curl http://localhost:8000/api/ml/health
```

Должны увидеть:
```json
{
  "status": "ok",
  "model_loaded": true,
  ...
}
```

### Шаг 4: Установите axios в backend

```bash
cd backend
npm install
```

### Шаг 5: Протестируйте!

1. Откройте http://localhost:5173
2. Войдите как student (student@campus.edu / password)
3. Откройте AI Chat (иконка внизу справа)
4. Напишите: "my sink is clogged"
5. Должны увидеть **"🤖 ML Analysis"** в ответе!

## 🎯 Что происходит

```
User: "my sink is clogged"
  ↓
Frontend → Backend → ML Service → Keyword matching
  ↓
"Check drain for clogs, try plunger..."
  ↓
Frontend показывает ML рекомендацию
```

## 📊 Хотите использовать ВАШУ обученную модель?

### Вариант 1: Используйте вашу существующую модель

Обучите вашу модель кластеризации и сохраните:

```python
# В конце вашего скрипта добавьте:
import numpy as np

# Сохранить embeddings
np.save('embeddings.npy', system.embeddings)

# Сохранить кластеры
np.save('clusters.npy', system.clusters)

# Копировать в backend_ml/models/
# mv embeddings.npy backend_ml/models/
# mv clusters.npy backend_ml/models/
```

### Вариант 2: Интегрировать вашу модель напрямую

Замените функции в `ml_api.py` на вызовы вашей модели.

## 🐛 Если что-то не работает

### ML сервис не запускается

```bash
# Проверьте Python версию
python --version  # нужен 3.8+

# Переустановите
pip install -r requirements.txt --upgrade
```

### Backend не видит ML

```bash
# Проверьте, что ML работает
curl http://localhost:8000

# Проверьте axios установлен
cd backend
npm list axios
```

### Frontend не показывает ML

1. Откройте DevTools (F12)
2. Смотрите Console на ошибки
3. Проверьте Network → XHR

### Всё равно не работает?

**Не страшно!** Сайт будет работать с rule-based логикой.

ML - это дополнительная фича, не критичная.

## ✅ Checklist

- [ ] backend_ml запущен на порту 8000
- [ ] `curl http://localhost:8000` работает
- [ ] backend запущен на порту 5000
- [ ] frontend запущен на порту 5173
- [ ] В AI Chat появляется "🤖 ML Analysis"

## 🎉 Готово!

Теперь ваш AI Assistant использует ML!

**Попробуйте:**
- "my toilet is overflowing"
- "lights not working"
- "wifi is slow"
- "heater making noise"

Каждый раз должны видеть умные рекомендации от ML! 🚀

