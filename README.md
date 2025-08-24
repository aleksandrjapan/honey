# Honey Shop - Магазин мёда

Интернет-магазин для продажи мёда с собственной пасеки.

## Требования

- Docker и Docker Compose
- Node.js 16+ и npm

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd honey-shop
```

2. Запустите MongoDB через Docker:
```bash
docker-compose up -d
```

Это запустит:
- MongoDB на порту 27017
- Mongo Express (веб-интерфейс для MongoDB) на порту 8081
  - Доступ: http://localhost:8081
  - Логин: admin
  - Пароль: password123

3. Установите зависимости и запустите бэкенд:
```bash
cd backend
npm install
npm run dev
```

4. В другом терминале установите зависимости и запустите фронтенд:
```bash
cd ..  # вернитесь в корневую директорию
npm install
npm run dev
```

5. Откройте приложение:
- Фронтенд: http://localhost:5173
- API: http://localhost:5001

## Управление Docker

- Запуск контейнеров: `docker-compose up -d`
- Остановка контейнеров: `docker-compose down`
- Просмотр логов: `docker-compose logs`
- Перезапуск контейнеров: `docker-compose restart`

## Работа с базой данных

Mongo Express предоставляет веб-интерфейс для управления базой данных:
- URL: http://localhost:8081
- Создавайте, просматривайте и редактируйте коллекции
- Импортируйте и экспортируйте данные
- Мониторинг состояния базы данных

## Структура проекта

```
honey-shop/
├── backend/           # Бэкенд на Express
│   ├── src/
│   │   ├── models/   # Модели данных
│   │   ├── routes/   # API маршруты
│   │   └── server.js # Основной файл сервера
│   └── package.json
├── src/              # Фронтенд на React
│   ├── components/   # React компоненты
│   ├── pages/        # Страницы приложения
│   └── services/     # Сервисы для работы с API
├── docker-compose.yml # Конфигурация Docker
└── package.json
```