# Campus Fix - University Maintenance Reporting System

Полноценное приложение для управления заявками на техническое обслуживание в университетском кампусе с AI-помощником.

## Возможности

- Создание отчетов о проблемах (CRUD операции)
- Поиск и фильтрация отчетов
- Отслеживание статуса заявок
- Современный UI с Tailwind CSS
- AI-помощник для диагностики проблем (фронтенд, интеграция с реальным AI - todo)
- Real-time обновления статуса
- Адаптивный дизайн

##  Технологический стек

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (иконки)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- CORS
- dotenv

##  Установка и запуск

### Предварительные требования
- Node.js (v16+)
- MongoDB (локально или MongoDB Atlas)

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd taiwindcss4
```

### 2. Установка зависимостей

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 3. Настройка переменных окружения

#### Frontend (.env в корне проекта)
```bash
VITE_API_URL=http://localhost:5000/api
```

#### Backend (backend/.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-fix
NODE_ENV=development
```

### 4. Запуск MongoDB

Убедитесь, что MongoDB запущен:
```bash
# Для Windows
mongod

# Для Mac/Linux
sudo mongod
```

Или используйте MongoDB Atlas (облачная версия) - просто замените MONGODB_URI на строку подключения из Atlas.

### 5. Запуск приложения

#### Вариант 1: Запуск в отдельных терминалах

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

#### Вариант 2: Создание скрипта запуска

Создайте файл `start-all.bat` (Windows):
```bash
start cmd /k "cd backend && npm run dev"
start cmd /k "npm run dev"
```

Или `start-all.sh` (Mac/Linux):
```bash
#!/bin/bash
cd backend && npm run dev &
npm run dev
```

### 6. Открытие в браузере

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

##  API Документация

Полная документация API доступна в `backend/README.md`

### Основные endpoints:

```
GET    /api/reports              - Получить все отчеты
POST   /api/reports              - Создать новый отчет
GET    /api/reports/:id          - Получить отчет по ID
PUT    /api/reports/:id          - Обновить отчет
DELETE /api/reports/:id          - Удалить отчет
GET    /api/reports/stats/summary - Получить статистику
```

##  Структура проекта

```
taiwindcss4/
├── backend/
│   ├── config/
│   │   └── db.js                 # Подключение к MongoDB
│   ├── models/
│   │   └── Report.js             # Модель отчета
│   ├── routes/
│   │   └── reports.js            # CRUD маршруты
│   ├── server.js                 # Точка входа backend
│   ├── package.json
│   └── README.md                 # Backend документация
├── src/
│   ├── services/
│   │   └── api.js                # API service для frontend
│   ├── App.jsx                   # Главный компонент
│   └── main.jsx
├── package.json
└── README.md
```

##  Тестирование API

### С помощью curl:

```bash
# Создать отчет
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Dorm A - Room 205",
    "category": "plumbing",
    "urgency": "high",
    "description": "Bathroom sink is not working properly"
  }'

# Получить все отчеты
curl http://localhost:5000/api/reports

# Получить с фильтрами
curl "http://localhost:5000/api/reports?status=pending&urgency=high"
```

### С помощью Postman:

Импортируйте коллекцию с endpoints из backend/README.md

##  Использование

1. **Создание отчета**:
   - Выберите вкладку "Report Issue"
   - Заполните форму (локация, категория, описание)
   - Выберите уровень приоритета
   - Нажмите "Submit Report"

2. **Просмотр отчетов**:
   - Перейдите на вкладку "My Reports"
   - Используйте поиск и фильтры
   - Отслеживайте статус каждой заявки

3. **AI-помощник** (текущая версия - mock):
   - Нажмите на иконку чата внизу справа
   - Опишите проблему на естественном языке
   - Получите рекомендации и автозаполнение формы
   - *В будущем будет интеграция с реальным AI*

##  Статусы отчетов

- **Pending** (Ожидает) - Заявка получена, ожидает назначения
- **In Progress** (В работе) - Назначен техник, работа ведется
- **Completed** (Завершено) - Проблема решена

##  TODO / Будущие улучшения

- [ ] Интеграция с реальным AI (OpenAI GPT-4 / Claude)
- [ ] Аутентификация пользователей (JWT)
- [ ] Загрузка фотографий к отчетам
- [ ] Email/SMS уведомления
- [ ] WebSocket для real-time обновлений
- [ ] Роли пользователей (студент, техник, администратор)
- [ ] Панель администратора для управления заявками
- [ ] Мобильное приложение
- [ ] Экспорт отчетов в PDF/Excel
- [ ] Система рейтингов и отзывов

##  Решение проблем

### Backend не запускается:
- Проверьте, запущен ли MongoDB
- Убедитесь, что порт 5000 свободен
- Проверьте переменные окружения в backend/.env

### Frontend не подключается к API:
- Проверьте, что backend запущен
- Убедитесь, что VITE_API_URL правильный в .env
- Проверьте CORS настройки в backend/server.js

### Ошибки MongoDB:
- Проверьте правильность MONGODB_URI
- Убедитесь, что у вас есть права на создание БД
- Попробуйте использовать MongoDB Compass для проверки подключения


