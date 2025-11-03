# 🚀 Инструкция по установке Campus Fix

Пошаговое руководство для запуска проекта.

## Шаг 1: Установка предварительных требований

### Windows

1. **Node.js**
   - Скачайте с https://nodejs.org/ (LTS версию)
   - Установите с настройками по умолчанию
   - Проверьте установку:
   ```bash
   node --version
   npm --version
   ```

2. **MongoDB**
   
   **Вариант A: Локальная установка**
   - Скачайте MongoDB Community Server: https://www.mongodb.com/try/download/community
   - Установите с настройками по умолчанию
   - MongoDB обычно запускается как служба автоматически
   
   **Вариант B: MongoDB Atlas (облачная версия, рекомендуется для начинающих)**
   - Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
   - Создайте бесплатный кластер
   - Получите строку подключения (Connection String)
   - Используйте её в backend/.env как MONGODB_URI

### Mac

```bash
# Установка Homebrew (если ещё не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node

# Установка MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Запуск MongoDB
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
sudo apt-get install -y mongodb

# Запуск MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Шаг 2: Клонирование и установка проекта

```bash
# Перейдите в нужную папку
cd Desktop

# Если проект уже скачан, откройте его
cd taiwindcss4

# Установка зависимостей для фронтенда
npm install

# Установка зависимостей для бэкенда
cd backend
npm install
cd ..
```

## Шаг 3: Настройка переменных окружения

### Frontend (.env в корне проекта)

Создайте файл `.env` в корневой папке проекта:

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)

Создайте файл `backend/.env`:

**Для локального MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-fix
NODE_ENV=development
```

**Для MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-fix?retryWrites=true&w=majority
NODE_ENV=development
```
*(Замените на вашу строку подключения)*

## Шаг 4: Проверка MongoDB

### Windows (локальный MongoDB)
```bash
# Проверьте, запущен ли MongoDB
mongod --version

# Если не запущен, запустите:
net start MongoDB
```

### Mac/Linux
```bash
# Проверка статуса
brew services list  # Mac
sudo systemctl status mongodb  # Linux

# Если не запущен:
brew services start mongodb-community  # Mac
sudo systemctl start mongodb  # Linux
```

### MongoDB Atlas
- Просто убедитесь, что у вас есть интернет
- Проверьте, что в Network Access разрешён ваш IP (или 0.0.0.0/0 для всех)

## Шаг 5: Запуск приложения

### Вариант 1: Автоматический запуск (рекомендуется)

**Windows:**
```bash
# Двойной клик по файлу или выполните:
start-dev.bat
```

**Mac/Linux:**
```bash
# Сделайте файл исполняемым (один раз):
chmod +x start-dev.sh

# Запустите:
./start-dev.sh
```

### Вариант 2: Ручной запуск

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Должно появиться:
```
✅ MongoDB Connected: ...
🚀 Server is running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Должно появиться:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

## Шаг 6: Проверка работы

1. **Проверьте backend:**
   - Откройте http://localhost:5000/api/health
   - Должны увидеть: `{"success":true,"message":"Campus Fix API is running",...}`

2. **Откройте приложение:**
   - Откройте http://localhost:5173/
   - Должен открыться интерфейс Campus Fix

3. **Создайте тестовый отчёт:**
   - Заполните форму на вкладке "Report Issue"
   - Отправьте отчёт
   - Проверьте на вкладке "My Reports"

## 🐛 Решение типичных проблем

### Проблема: "Cannot connect to MongoDB"

**Решение:**
```bash
# Проверьте, запущен ли MongoDB
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb

# Или используйте MongoDB Atlas
```

### Проблема: "Port 5000 is already in use"

**Решение:**
```bash
# Windows - найти и убить процесс:
netstat -ano | findstr :5000
taskkill /PID [номер_процесса] /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Или измените порт в backend/.env:
PORT=5001
```

### Проблема: "Failed to fetch" в консоли браузера

**Причины:**
1. Backend не запущен
2. Неправильный VITE_API_URL в .env
3. CORS проблемы

**Решение:**
```bash
# 1. Убедитесь, что backend запущен:
curl http://localhost:5000/api/health

# 2. Проверьте .env файл
# 3. Перезапустите frontend после изменения .env
```

### Проблема: "Module not found"

**Решение:**
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Изменения в .env не работают

**Решение:**
```bash
# Полностью остановите сервер (Ctrl+C)
# Перезапустите его заново
# Для frontend может потребоваться очистка кэша
```

## 📝 Полезные команды

```bash
# Просмотр логов MongoDB
# Windows:
C:\Program Files\MongoDB\Server\7.0\log\mongod.log

# Очистка базы данных MongoDB
mongo campus-fix
db.reports.drop()

# Проверка всех отчётов через API
curl http://localhost:5000/api/reports

# Создание тестового отчёта через curl
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Test Location",
    "category": "plumbing",
    "urgency": "medium",
    "description": "This is a test report"
  }'
```

## 🎓 Первый запуск - Чеклист

- [ ] Node.js установлен (node --version работает)
- [ ] MongoDB установлен или настроен Atlas
- [ ] npm install выполнен в корне проекта
- [ ] npm install выполнен в папке backend
- [ ] Файл .env создан в корне проекта
- [ ] Файл backend/.env создан
- [ ] MongoDB запущен (или используется Atlas)
- [ ] Backend запущен (http://localhost:5000/api/health работает)
- [ ] Frontend запущен (http://localhost:5173 открывается)
- [ ] Тестовый отчёт создан успешно

## 🎉 Готово!

Если всё работает:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: См. backend/README.md

Приятной работы! 🚀

