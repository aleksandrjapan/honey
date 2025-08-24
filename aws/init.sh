#!/bin/bash

# Проверка конфигурации AWS CLI
echo "Проверка AWS конфигурации..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Ошибка AWS CLI конфигурации. Запустите 'aws configure'"
    exit 1
fi
echo "✅ AWS CLI настроен корректно"

# Проверка наличия необходимых прав
echo "Проверка прав доступа..."
aws ecr describe-repositories &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Права на ECR в порядке"
else
    echo "❌ Недостаточно прав для ECR"
fi

aws ecs list-clusters &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Права на ECS в порядке"
else
    echo "❌ Недостаточно прав для ECS"
fi

# Создание CloudFormation стека
echo "Создание инфраструктуры..."
STACK_NAME="honey-shop"
aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://cloudformation.yml \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "⏳ Ожидание создания инфраструктуры..."
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
    echo "✅ Инфраструктура создана успешно"

    # Получение важной информации
    echo "📊 Информация о развернутых ресурсах:"
    aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
else
    echo "❌ Ошибка при создании инфраструктуры"
    exit 1
fi

# Настройка локального окружения
echo "Настройка локального окружения..."
ECR_URI=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendRepositoryURI`].OutputValue' \
    --output text)

# Авторизация в ECR
echo "Авторизация в ECR..."
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI

echo "🎉 Инициализация завершена успешно!"
echo "
Следующие шаги:
1. Соберите Docker образы:
   docker-compose build

2. Отправьте образы в ECR:
   docker-compose push

3. Обновите сервисы ECS:
   ./deploy.sh

4. Проверьте статус:
   aws ecs list-services --cluster honey-cluster
"
