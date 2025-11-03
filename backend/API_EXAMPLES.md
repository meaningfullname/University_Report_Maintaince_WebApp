# 📡 Примеры API запросов для Campus Fix

## Использование в браузере

### 1. Health Check
```
http://localhost:5000/api/health
```

### 2. Главная страница API
```
http://localhost:5000/
```

### 3. Получить все отчёты
```
http://localhost:5000/api/reports
```

### 4. Фильтрация отчётов
```
http://localhost:5000/api/reports?status=pending
http://localhost:5000/api/reports?urgency=high
http://localhost:5000/api/reports?search=dorm
http://localhost:5000/api/reports?status=pending&urgency=high
```

### 5. Статистика
```
http://localhost:5000/api/reports/stats/summary
```

---

## Использование с curl (Terminal/CMD)

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Получить все отчёты
```bash
curl http://localhost:5000/api/reports
```

### 3. Создать новый отчёт - Простой пример
```bash
curl -X POST http://localhost:5000/api/reports ^
  -H "Content-Type: application/json" ^
  -d "{\"location\":\"Dorm A - Room 205\",\"category\":\"plumbing\",\"urgency\":\"high\",\"description\":\"Bathroom sink is completely broken and leaking\"}"
```

### 4. Создать отчёт - С форматированием (Mac/Linux)
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Library - 2nd Floor",
    "category": "electrical",
    "urgency": "medium",
    "description": "Light fixture is flickering constantly",
    "contactInfo": "john.doe@university.edu"
  }'
```

### 5. Создать отчёт - Windows CMD
```bash
curl -X POST http://localhost:5000/api/reports -H "Content-Type: application/json" -d "{\"location\":\"Cafeteria - Main Hall\",\"category\":\"hvac\",\"urgency\":\"low\",\"description\":\"Air conditioning is making strange noises\"}"
```

### 6. Обновить отчёт (замените REPORT_ID)
```bash
curl -X PUT http://localhost:5000/api/reports/REPORT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "assignedTo": "Tech Team A"
  }'
```

### 7. Удалить отчёт (замените REPORT_ID)
```bash
curl -X DELETE http://localhost:5000/api/reports/REPORT_ID
```

### 8. Получить один отчёт (замените REPORT_ID)
```bash
curl http://localhost:5000/api/reports/REPORT_ID
```

### 9. Фильтрация - Только pending отчёты
```bash
curl "http://localhost:5000/api/reports?status=pending"
```

### 10. Фильтрация - High priority отчёты
```bash
curl "http://localhost:5000/api/reports?urgency=high"
```

### 11. Поиск по ключевому слову
```bash
curl "http://localhost:5000/api/reports?search=dorm"
```

### 12. Комбинированная фильтрация
```bash
curl "http://localhost:5000/api/reports?status=pending&urgency=high&search=library"
```

---

## Использование с PowerShell (Windows)

### 1. Создать отчёт
```powershell
$body = @{
    location = "Dorm B - Room 305"
    category = "internet"
    urgency = "medium"
    description = "WiFi connection keeps dropping every few minutes"
    contactInfo = "student@university.edu"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/reports" -Method Post -Body $body -ContentType "application/json"
```

### 2. Получить все отчёты
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/reports" -Method Get
```

### 3. Обновить отчёт
```powershell
$reportId = "REPLACE_WITH_ACTUAL_ID"
$updateBody = @{
    status = "in-progress"
    assignedTo = "Tech Team B"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/reports/$reportId" -Method Put -Body $updateBody -ContentType "application/json"
```

### 4. Удалить отчёт
```powershell
$reportId = "REPLACE_WITH_ACTUAL_ID"
Invoke-RestMethod -Uri "http://localhost:5000/api/reports/$reportId" -Method Delete
```

---

## Использование с JavaScript (fetch)

### 1. Получить все отчёты
```javascript
fetch('http://localhost:5000/api/reports')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 2. Создать отчёт
```javascript
const newReport = {
  location: "Gym - Weight Room",
  category: "furniture",
  urgency: "low",
  description: "Broken bench press seat cushion",
  contactInfo: "gym.manager@university.edu"
};

fetch('http://localhost:5000/api/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newReport)
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

### 3. Обновить отчёт
```javascript
const reportId = 'REPLACE_WITH_ACTUAL_ID';
const updates = {
  status: 'completed',
  completedDate: new Date().toISOString()
};

fetch(`http://localhost:5000/api/reports/${reportId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updates)
})
  .then(response => response.json())
  .then(data => console.log('Updated:', data))
  .catch(error => console.error('Error:', error));
```

### 4. Удалить отчёт
```javascript
const reportId = 'REPLACE_WITH_ACTUAL_ID';

fetch(`http://localhost:5000/api/reports/${reportId}`, {
  method: 'DELETE'
})
  .then(response => response.json())
  .then(data => console.log('Deleted:', data))
  .catch(error => console.error('Error:', error));
```

---

## Постman Collection

### Создание коллекции в Postman:

1. Откройте Postman
2. Создайте новую коллекцию "Campus Fix API"
3. Добавьте следующие запросы:

#### GET - Health Check
```
GET http://localhost:5000/api/health
```

#### GET - All Reports
```
GET http://localhost:5000/api/reports
```

#### GET - Filtered Reports
```
GET http://localhost:5000/api/reports?status=pending&urgency=high
```

#### POST - Create Report
```
POST http://localhost:5000/api/reports
Headers: Content-Type: application/json
Body (raw JSON):
{
  "location": "Student Center - Lounge",
  "category": "other",
  "urgency": "medium",
  "description": "Water fountain not working properly",
  "contactInfo": "facilities@university.edu"
}
```

#### GET - Single Report
```
GET http://localhost:5000/api/reports/{{reportId}}
```

#### PUT - Update Report
```
PUT http://localhost:5000/api/reports/{{reportId}}
Headers: Content-Type: application/json
Body (raw JSON):
{
  "status": "in-progress",
  "assignedTo": "Tech Team C"
}
```

#### DELETE - Delete Report
```
DELETE http://localhost:5000/api/reports/{{reportId}}
```

#### GET - Statistics
```
GET http://localhost:5000/api/reports/stats/summary
```

---

## Тестовые данные

### Plumbing Issues
```json
{
  "location": "Dorm A - Room 101",
  "category": "plumbing",
  "urgency": "high",
  "description": "Toilet is overflowing and water is leaking into the hallway"
}
```

### Electrical Issues
```json
{
  "location": "Science Building - Lab 204",
  "category": "electrical",
  "urgency": "high",
  "description": "Outlet is sparking and making buzzing noises - URGENT!"
}
```

### HVAC Issues
```json
{
  "location": "Library - Study Room 3",
  "category": "hvac",
  "urgency": "medium",
  "description": "Room is extremely cold, heater seems not working"
}
```

### Internet Issues
```json
{
  "location": "Dorm C - Entire 3rd Floor",
  "category": "internet",
  "urgency": "medium",
  "description": "WiFi completely down for all rooms on 3rd floor"
}
```

### Furniture Issues
```json
{
  "location": "Cafeteria - Tables near windows",
  "category": "furniture",
  "urgency": "low",
  "description": "Several chairs have wobbly legs and need repair"
}
```

### Other Issues
```json
{
  "location": "Main Entrance - Lobby",
  "category": "other",
  "urgency": "medium",
  "description": "Automatic door is stuck half-open and won't close"
}
```

---

## Ожидаемые ответы

### Успешное создание
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "_id": "65abc123...",
    "location": "...",
    "category": "...",
    "urgency": "...",
    "description": "...",
    "status": "pending",
    "date": "2025-11-03T...",
    "estimatedCompletion": "2025-11-06T...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Ошибка валидации
```json
{
  "success": false,
  "message": "Please provide location, category, and description"
}
```

### Отчёт не найден
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## Быстрое тестирование всех endpoint'ов

### Bash скрипт (Mac/Linux)
```bash
#!/bin/bash

echo "Testing Campus Fix API..."

echo "\n1. Health Check:"
curl -s http://localhost:5000/api/health | json_pp

echo "\n2. Create Report:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"location":"Test Room","category":"plumbing","urgency":"high","description":"Test description for API"}')
echo $RESPONSE | json_pp

REPORT_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created Report ID: $REPORT_ID"

echo "\n3. Get All Reports:"
curl -s http://localhost:5000/api/reports | json_pp

echo "\n4. Get Single Report:"
curl -s http://localhost:5000/api/reports/$REPORT_ID | json_pp

echo "\n5. Update Report:"
curl -s -X PUT http://localhost:5000/api/reports/$REPORT_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}' | json_pp

echo "\n6. Delete Report:"
curl -s -X DELETE http://localhost:5000/api/reports/$REPORT_ID | json_pp

echo "\nAPI Testing Complete!"
```

Сохраните как `test-api.sh` и выполните:
```bash
chmod +x test-api.sh
./test-api.sh
```

