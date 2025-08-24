#!/bin/bash

# Скрипт для деплоя только ECS сервисов
# Используется когда инфраструктура уже создана

# Параметры
INFRA_STACK_NAME="honey-shop-infra"
SERVICES_STACK_NAME="honey-shop-services"
ENVIRONMENT="production"
REGION="eu-central-1"
DOCDB_USERNAME="honey"
DOCDB_PASSWORD="${DOCDB_PASSWORD:-$(openssl rand -base64 32)}"

# Функция для получения выходных данных стека
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text \
        --region $REGION
}

# Проверка существования инфраструктуры
if ! aws cloudformation describe-stacks --stack-name $INFRA_STACK_NAME --region $REGION &> /dev/null; then
    echo "Ошибка: Стек инфраструктуры $INFRA_STACK_NAME не найден"
    echo "Сначала запустите deploy.sh для создания инфраструктуры"
    exit 1
fi

# Получение выходных данных инфраструктуры
echo "Получение выходных данных инфраструктуры..."
FRONTEND_REPO=$(get_stack_output $INFRA_STACK_NAME "FrontendRepositoryURI")
BACKEND_REPO=$(get_stack_output $INFRA_STACK_NAME "BackendRepositoryURI")
VPC_ID=$(get_stack_output $INFRA_STACK_NAME "VPCId")
CLUSTER_NAME=$(get_stack_output $INFRA_STACK_NAME "ClusterName")
ALB_ARN=$(get_stack_output $INFRA_STACK_NAME "LoadBalancerArn")

# Проверка наличия необходимых выходных данных
if [ -z "$VPC_ID" ] || [ -z "$CLUSTER_NAME" ] || [ -z "$ALB_ARN" ]; then
    echo "Ошибка: Не удалось получить необходимые выходные данные из стека инфраструктуры"
    exit 1
fi

# Получение ID подсетей и групп безопасности
echo "Получение ID подсетей и групп безопасности..."
PRIVATE_SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*private*" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $REGION | tr '\t' ',')

PUBLIC_SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*public*" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $REGION | tr '\t' ',')

ECS_SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=*ecs*" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region $REGION)

ALB_SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=*alb*" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region $REGION)

# Проверка существования ECS сервисов
if aws cloudformation describe-stacks --stack-name $SERVICES_STACK_NAME --region $REGION &> /dev/null; then
    echo "Обновление существующего стека ECS сервисов..."
    aws cloudformation update-stack \
        --stack-name $SERVICES_STACK_NAME \
        --template-body file://ecs-services.yml \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ClusterName,ParameterValue=$CLUSTER_NAME \
            ParameterKey=FrontendImage,ParameterValue=$FRONTEND_REPO:latest \
            ParameterKey=BackendImage,ParameterValue=$BACKEND_REPO:latest \
            ParameterKey=DocDBEndpoint,ParameterValue=$(get_stack_output $INFRA_STACK_NAME "DocDBEndpoint") \
            ParameterKey=DocDBUsername,ParameterValue=$DOCDB_USERNAME \
            ParameterKey=DocDBPassword,ParameterValue=$DOCDB_PASSWORD \
            ParameterKey=VPCId,ParameterValue=$VPC_ID \
            ParameterKey=PublicSubnetIds,ParameterValue="$PUBLIC_SUBNET_IDS" \
            ParameterKey=PrivateSubnetIds,ParameterValue="$PRIVATE_SUBNET_IDS" \
            ParameterKey=ALBSecurityGroupId,ParameterValue=$ALB_SECURITY_GROUP_ID \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SECURITY_GROUP_ID \
            ParameterKey=ALBArn,ParameterValue=$ALB_ARN \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    echo "Ожидание обновления ECS сервисов..."
    aws cloudformation wait stack-update-complete \
        --stack-name $SERVICES_STACK_NAME \
        --region $REGION
else
    echo "Создание нового стека ECS сервисов..."
    aws cloudformation create-stack \
        --stack-name $SERVICES_STACK_NAME \
        --template-body file://ecs-services.yml \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ClusterName,ParameterValue=$CLUSTER_NAME \
            ParameterKey=FrontendImage,ParameterValue=$FRONTEND_REPO:latest \
            ParameterKey=BackendImage,ParameterValue=$BACKEND_REPO:latest \
            ParameterKey=DocDBEndpoint,ParameterValue=$(get_stack_output $INFRA_STACK_NAME "DocDBEndpoint") \
            ParameterKey=DocDBUsername,ParameterValue=$DOCDB_USERNAME \
            ParameterKey=DocDBPassword,ParameterValue=$DOCDB_PASSWORD \
            ParameterKey=VPCId,ParameterValue=$VPC_ID \
            ParameterKey=PublicSubnetIds,ParameterValue="$PUBLIC_SUBNET_IDS" \
            ParameterKey=PrivateSubnetIds,ParameterValue="$PRIVATE_SUBNET_IDS" \
            ParameterKey=ALBSecurityGroupId,ParameterValue=$ALB_SECURITY_GROUP_ID \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SECURITY_GROUP_ID \
            ParameterKey=ALBArn,ParameterValue=$ALB_ARN \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    echo "Ожидание создания ECS сервисов..."
    aws cloudformation wait stack-create-complete \
        --stack-name $SERVICES_STACK_NAME \
        --region $REGION
fi

echo "ECS сервисы успешно развернуты!"
echo "Frontend Service: $(get_stack_output $SERVICES_STACK_NAME "FrontendServiceName")"
echo "Backend Service: $(get_stack_output $SERVICES_STACK_NAME "BackendServiceName")"
