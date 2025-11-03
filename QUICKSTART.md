# ⚡ Быстрый старт Campus Fix

## 🎯 Минимальная инструкция для запуска

### 1️⃣ Установите зависимости (один раз)
```bash
npm install
cd backend && npm install && cd ..
```

### 2️⃣ Создайте .env файлы

**Корень проекта (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

**backend/.env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-fix
NODE_ENV=development
```

### 3️⃣ Убедитесь, что MongoDB запущен
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### 4️⃣ Запустите приложение

**Автоматически (рекомендуется):**
```bash
# Windows
start-dev.bat

# Mac/Linux
chmod +x start-dev.sh
./start-dev.sh
```

**Вручную (2 терминала):**
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
npm run dev
```

### 5️⃣ Откройте в браузере
- **Приложение**: http://localhost:5173
- **API**: http://localhost:5000

---

## 🔧 Основные команды

### Запуск
```bash
npm run dev              # Frontend
cd backend && npm run dev   # Backend
```

### Остановка
```
Ctrl + C в терминале
```

### Перезапуск при проблемах
```bash
# Остановите всё (Ctrl+C)
# Закройте все терминалы
# Запустите заново
```

---

## ✅ Проверка работы

1. **Backend**: Откройте http://localhost:5000/api/health
   - Должны увидеть: `{"success":true,...}`

2. **Frontend**: Откройте http://localhost:5173
   - Должен загрузиться интерфейс

3. **Создайте тестовый отчёт**:
   - Заполните форму
   - Нажмите "Submit Report"
   - Проверьте на вкладке "My Reports"

---

## 🆘 Быстрые решения проблем

### MongoDB не запускается
```bash
# Используйте MongoDB Atlas (бесплатно)
# 1. Зарегистрируйтесь на mongodb.com/cloud/atlas
# 2. Создайте кластер
# 3. Получите Connection String
# 4. Замените MONGODB_URI в backend/.env
```

### Порт 5000 занят
```bash
# Измените в backend/.env:
PORT=5001

# И в .env (корень):
VITE_API_URL=http://localhost:5001/api
```

### "Cannot GET /"
- Backend не запущен. Проверьте Terminal 1

### "Failed to fetch"
- CORS или неправильный URL. Проверьте .env файлы

---

## 📁 Структура (важные файлы)

```
taiwindcss4/
├── .env                    # Frontend config
├── src/
│   ├── App.jsx            # Главный компонент
│   └── services/api.js    # API клиент
├── backend/
│   ├── .env               # Backend config
│   ├── server.js          # Сервер
│   ├── models/Report.js   # Модель данных
│   └── routes/reports.js  # API routes
└── start-dev.bat/.sh      # Скрипт запуска
```

---

## 🚀 Готово к работе!

- 📖 Полная инструкция: `SETUP.md`
- 📡 Примеры API: `backend/API_EXAMPLES.md`
- 📚 Backend документация: `backend/README.md`

