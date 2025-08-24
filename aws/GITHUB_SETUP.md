# Настройка GitHub Actions для деплоя

## 1. Создание IAM пользователя в AWS

1. Перейдите в AWS Console → IAM
2. Создайте нового пользователя:
   ```
   Name: github-actions
   Access type: Programmatic access
   ```
3. Создайте новую политику:
   - Выберите JSON
   - Вставьте содержимое файла `github-actions-policy.json`
   - Назовите политику `GithubActionsDeployPolicy`

4. Прикрепите политику к пользователю
5. Сохраните Access Key ID и Secret Access Key

## 2. Настройка GitHub Secrets

В вашем GitHub репозитории:
1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте следующие секреты:
   ```
   AWS_ACCESS_KEY_ID: <your-access-key>
   AWS_SECRET_ACCESS_KEY: <your-secret-key>
   ```

## 3. Настройка Slack уведомлений (опционально)

1. Создайте Incoming Webhook в Slack
2. Добавьте webhook URL в GitHub Secrets:
   ```
   SLACK_WEBHOOK_URL: <your-webhook-url>
   ```

## 4. Процесс деплоя

После настройки:
1. Каждый пуш в main ветку запустит процесс деплоя
2. Pull requests будут проходить только тесты
3. Процесс деплоя:
   - Запуск тестов
   - Сборка Docker образов
   - Отправка образов в ECR
   - Обновление ECS сервисов
   - Уведомление в Slack

## 5. Мониторинг деплоя

1. Статус деплоя можно отслеживать:
   - В GitHub Actions вкладке репозитория
   - В AWS Console → ECS → Clusters → honey-cluster
   - В Slack (если настроено)

## 6. Откат изменений

В случае проблем:
1. Через GitHub:
   - Сделайте revert проблемного коммита
   - Создайте PR
   - После мержа произойдет автоматический деплой предыдущей версии

2. Через AWS Console:
   - ECS → Clusters → honey-cluster
   - Выберите сервис
   - Update Service → Force new deployment
   - Выберите предыдущую версию Task Definition
