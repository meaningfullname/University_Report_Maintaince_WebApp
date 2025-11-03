# 🔐 Настройка аутентификации и админ панели

Система аутентификации и управления пользователями для Campus Fix.

## 🎯 Возможности

### Для всех пользователей:
- ✅ Регистрация с выбором роли
- ✅ Вход в систему (JWT токены)
- ✅ Обновление профиля
- ✅ Смена пароля
- ✅ Автоматический выход при истечении токена

### Для студентов (Student):
- ✅ Создание отчётов о проблемах
- ✅ Просмотр своих отчётов
- ✅ Отслеживание статуса
- ✅ AI-помощник

### Для техников (Technician):
- ✅ Просмотр всех отчётов
- ✅ Изменение статуса отчётов
- ✅ Фильтрация и поиск
- ✅ Статистика

### Для администраторов (Admin):
- ✅ Все возможности техника +
- ✅ Управление пользователями
- ✅ Назначение ролей
- ✅ Деактивация пользователей
- ✅ Удаление отчётов
- ✅ Детальная статистика

## 🚀 Первый запуск

### 1. Установите зависимости (если ещё не сделано)

```bash
# Backend
cd backend
npm install

# Frontend (в корне проекта)
cd ..
npm install
```

### 2. Создайте демо-пользователей

```bash
cd backend
npm run create-demo-users
```

Это создаст 3 тестовых аккаунта:
- **Admin**: admin@campus.edu / password
- **Technician**: tech@campus.edu / password
- **Student**: student@campus.edu / password

### 3. Запустите приложение

```bash
# Windows
start-dev.bat

# Mac/Linux
./start-dev.sh
```

### 4. Откройте браузер

Перейдите на http://localhost:5173

## 📱 Использование

### Вход в систему

1. Откройте http://localhost:5173
2. Введите email и пароль
3. Нажмите "Login"

### Регистрация нового пользователя

1. На странице логина нажмите "Register"
2. Заполните форму:
   - **Name** (обязательно)
   - **Email** (обязательно)
   - **Password** (минимум 6 символов)
   - **Student ID** (опционально)
   - **Phone** (опционально)
   - **Dormitory** (опционально)
3. Роль по умолчанию: Student
4. Нажмите "Create Account"

### Администрирование

После входа как **admin** или **technician**, вы увидите Admin Panel:

#### Dashboard (Дашборд)
- Статистика по отчётам
- Статистика по пользователям (только admin)
- Последние отчёты

#### Reports (Управление отчётами)
- Просмотр всех отчётов с фильтрацией
- Изменение статуса (pending → in-progress → completed)
- Удаление отчётов (только admin)
- Поиск по локации, описанию, категории

#### Users (Управление пользователями, только admin)
- Просмотр всех пользователей
- Изменение ролей (student ↔ technician ↔ admin)
- Деактивация пользователей

## 🔑 Роли и разрешения

| Функция | Student | Technician | Admin |
|---------|---------|------------|-------|
| Создание отчётов | ✅ | ✅ | ✅ |
| Просмотр своих отчётов | ✅ | ✅ | ✅ |
| Просмотр всех отчётов | ❌ | ✅ | ✅ |
| Изменение статуса отчётов | ❌ | ✅ | ✅ |
| Удаление отчётов | ❌ | ❌ | ✅ |
| Назначение техников | ❌ | ❌ | ✅ |
| Управление пользователями | ❌ | ❌ | ✅ |
| Изменение ролей | ❌ | ❌ | ✅ |

## 🔐 Безопасность

### JWT Токены
- Токены хранятся в localStorage
- Срок действия: 30 дней (по умолчанию)
- Автоматическая проверка при каждом запросе
- Автоматический выход при истечении

### Пароли
- Минимум 6 символов
- Хешируются с bcrypt (10 rounds)
- Никогда не возвращаются в API ответах

### Защита маршрутов
- Frontend: Проверка перед рендером компонентов
- Backend: JWT middleware на защищённых routes
- Проверка ролей для admin/technician endpoints

## 🛠️ API Endpoints

### Authentication (`/api/auth`)

```
POST   /api/auth/register         - Регистрация
POST   /api/auth/login            - Вход
GET    /api/auth/me               - Получить профиль (защищено)
PUT    /api/auth/update           - Обновить профиль (защищено)
PUT    /api/auth/change-password  - Сменить пароль (защищено)
GET    /api/auth/users            - Все пользователи (admin)
PUT    /api/auth/users/:id/role   - Изменить роль (admin)
DELETE /api/auth/users/:id        - Деактивировать (admin)
```

### Admin (`/api/admin`)

```
GET    /api/admin/reports         - Все отчёты (admin/tech)
PUT    /api/admin/reports/:id/status   - Изменить статус (admin/tech)
PUT    /api/admin/reports/:id/assign   - Назначить технику (admin)
PUT    /api/admin/reports/:id     - Обновить отчёт (admin/tech)
DELETE /api/admin/reports/:id     - Удалить отчёт (admin)
GET    /api/admin/stats           - Статистика (admin)
GET    /api/admin/technicians     - Список техников (admin)
```

## 📝 Примеры использования

### Регистрация (cURL)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@campus.edu",
    "password": "password123",
    "role": "student",
    "studentId": "S789012",
    "dormitory": "Dorm B"
  }'
```

### Вход (cURL)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@campus.edu",
    "password": "password"
  }'
```

Ответ:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@campus.edu",
    "role": "admin"
  }
}
```

### Использование токена

```bash
# Получить профиль
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Получить все отчёты (admin/tech)
curl http://localhost:5000/api/admin/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Изменить статус отчёта
curl -X PUT http://localhost:5000/api/admin/reports/REPORT_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## 🐛 Решение проблем

### "Token expired" при входе
- Токен истёк (30 дней)
- Войдите заново

### "Not authorized" ошибка
- Токен недействителен
- Очистите localStorage и войдите снова

### Не могу создать пользователей
```bash
# Проверьте MongoDB
mongod --version

# Проверьте подключение
cd backend
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Попробуйте снова
npm run create-demo-users
```

### Admin panel не загружается
- Проверьте роль пользователя (должна быть admin или technician)
- Проверьте консоль браузера (F12) на ошибки
- Убедитесь, что backend запущен

## 🔄 Смена пароля

В будущей версии можно добавить в UI. Пока через API:

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'
```

## 📊 База данных

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (student/technician/admin),
  studentId: String,
  phone: String,
  dormitory: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Report Schema (обновлена)

```javascript
{
  user: ObjectId (ref: User),      // Связь с пользователем
  location: String,
  category: String,
  urgency: String,
  description: String,
  contactInfo: String,
  status: String,
  date: Date,
  estimatedCompletion: Date,
  completedDate: Date,
  assignedTo: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎓 Рекомендации

### Для production:
1. Измените JWT_SECRET на сложный случайный ключ
2. Используйте HTTPS
3. Добавьте rate limiting
4. Настройте email подтверждение
5. Добавьте восстановление пароля
6. Используйте более короткий срок действия токенов
7. Добавьте refresh tokens

### Для development:
- Используйте демо-аккаунты для тестирования
- Проверяйте разные роли
- Тестируйте на разных устройствах

## ✅ Готово!

Система аутентификации полностью настроена и готова к использованию!

Демо-аккаунты:
- **Admin**: admin@campus.edu / password
- **Technician**: tech@campus.edu / password
- **Student**: student@campus.edu / password

Приятного использования! 🎉

