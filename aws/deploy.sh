#!/bin/bash

# Проверка наличия AWS CLI
if ! command -v aws &> /dev/null; then
    echo "AWS CLI не установлен. Установите его с помощью 'pip install awscli'"
    exit 1
fi

# Проверка авторизации в AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Не удалось подключиться к AWS. Проверьте настройки AWS CLI"
    exit 1
fi

# Параметры
STACK_NAME="honey-shop"
ENVIRONMENT="production"
REGION="eu-central-1"  # Можно изменить на нужный регион
DOCDB_USERNAME="admin"
DOCDB_PASSWORD="$(openssl rand -base64 32)"  # Генерируем случайный пароль

# Создание CloudFormation стека
echo "Создание инфраструктуры..."
aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://cloudformation.yml \
    --parameters \
        ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        ParameterKey=DocDBUsername,ParameterValue=$DOCDB_USERNAME \
        ParameterKey=DocDBPassword,ParameterValue=$DOCDB_PASSWORD \
    --capabilities CAPABILITY_IAM \
    --region $REGION

# Ожидание создания стека
echo "Ожидание создания инфраструктуры..."
aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $REGION

# Получение выходных данных стека
FRONTEND_REPO=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendRepositoryURI`].OutputValue' \
    --output text \
    --region $REGION)

BACKEND_REPO=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendRepositoryURI`].OutputValue' \
    --output text \
    --region $REGION)

# Сборка и отправка Docker образов
echo "Сборка и отправка Docker образов..."

# Авторизация в ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $FRONTEND_REPO

# Frontend
docker build -t $FRONTEND_REPO:latest -f Dockerfile.frontend .
docker push $FRONTEND_REPO:latest

# Backend
docker build -t $BACKEND_REPO:latest -f backend/Dockerfile ./backend
docker push $BACKEND_REPO:latest

echo "Деплой завершен!"
echo "DocumentDB password: $DOCDB_PASSWORD"
echo "Сохраните этот пароль в надежном месте!"

# Получение DNS имени балансировщика нагрузки
ALB_DNS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text \
    --region $REGION)

echo "Приложение будет доступно по адресу: http://$ALB_DNS"
