# Campus Fix Backend API

Backend API для системы отчетов о техническом обслуживании Campus Fix.

## Технологии

- Node.js
- Express.js
- MongoDB (Mongoose)
- CORS
- dotenv

## Установка

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Создайте файл `.env` в корневой папке backend:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-fix
NODE_ENV=development
```

3. Убедитесь, что MongoDB запущен на вашем компьютере

4. Запустите сервер:
```bash
# Режим разработки (с автоперезагрузкой)
npm run dev

# Режим продакшена
npm start
```

## API Endpoints

### Reports (Отчеты)

#### Получить все отчеты
```
GET /api/reports
```

Query параметры:
- `status` - Фильтр по статусу (pending, in-progress, completed, all)
- `urgency` - Фильтр по приоритету (low, medium, high, all)
- `search` - Поиск по location, description, category

Пример:
```
GET /api/reports?status=pending&urgency=high
GET /api/reports?search=dorm
```

#### Получить отчет по ID
```
GET /api/reports/:id
```

#### Создать новый отчет
```
POST /api/reports
Content-Type: application/json

{
  "location": "Dorm A - Room 205",
  "category": "plumbing",
  "urgency": "high",
  "description": "Bathroom sink not working",
  "contactInfo": "john@example.com" (опционально)
}
```

Обязательные поля:
- `location` (минимум 5 символов)
- `category` (plumbing, electrical, hvac, internet, furniture, other)
- `description` (минимум 10 символов)

Опциональные поля:
- `urgency` (low, medium, high) - по умолчанию: medium
- `contactInfo`

#### Обновить отчет
```
PUT /api/reports/:id
Content-Type: application/json

{
  "status": "in-progress",
  "assignedTo": "Tech Team A"
}
```

Можно обновить любое из полей:
- `location`
- `category`
- `urgency`
- `description`
- `contactInfo`
- `status`
- `assignedTo`

#### Удалить отчет
```
DELETE /api/reports/:id
```

#### Получить статистику
```
GET /api/reports/stats/summary
```

Возвращает:
- Общее количество отчетов
- Распределение по статусам
- Распределение по приоритетам

### Служебные endpoints

#### Health Check
```
GET /api/health
```

#### Информация об API
```
GET /
```

## Структура проекта

```
backend/
├── config/
│   └── db.js           # Подключение к MongoDB
├── models/
│   └── Report.js       # Модель отчета
├── routes/
│   └── reports.js      # CRUD маршруты для отчетов
├── .env                # Переменные окружения (не в git)
├── .env.example        # Пример переменных окружения
├── .gitignore          # Игнорируемые файлы
├── package.json        # Зависимости проекта
├── README.md           # Документация
└── server.js           # Точка входа приложения
```

## Модель данных Report

```javascript
{
  location: String (required, min 5 chars),
  category: String (required, enum),
  urgency: String (default: 'medium'),
  description: String (required, min 10 chars),
  contactInfo: String (optional),
  status: String (default: 'pending'),
  date: Date (auto),
  estimatedCompletion: Date (auto),
  completedDate: Date (auto when completed),
  assignedTo: String (optional),
  photos: [String] (optional),
  timestamps: true (createdAt, updatedAt)
}
```

## Автоматические функции

1. **Автоматический расчет estimatedCompletion**:
   - High priority: +1 день
   - Medium priority: +3 дня
   - Low priority: +5 дней

2. **Автоматическая установка completedDate**:
   - Устанавливается автоматически при изменении статуса на 'completed'

## Примеры использования

### Создание отчета
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Library - 2nd Floor",
    "category": "electrical",
    "urgency": "medium",
    "description": "Light fixture is flickering constantly"
  }'
```

### Получение всех отчетов
```bash
curl http://localhost:5000/api/reports
```

### Фильтрация отчетов
```bash
curl http://localhost:5000/api/reports?status=pending&urgency=high
```

### Обновление отчета
```bash
curl -X PUT http://localhost:5000/api/reports/[REPORT_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "assignedTo": "Tech Team B"
  }'
```

### Удаление отчета
```bash
curl -X DELETE http://localhost:5000/api/reports/[REPORT_ID]
```

## TODO (будущие функции)

- [ ] AI Assistant integration
- [ ] Аутентификация пользователей
- [ ] Загрузка фотографий
- [ ] Email уведомления
- [ ] WebSocket для real-time обновлений
- [ ] Роли пользователей (студент, техник, админ)

## Разработка

Для разработки используйте:
```bash
npm run dev
```

Это запустит сервер с nodemon, который будет автоматически перезапускаться при изменении файлов.

