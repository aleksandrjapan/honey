#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка ECS сервисов
echo -e "${YELLOW}Проверка ECS сервисов...${NC}"
CLUSTER_NAME="honey-cluster"

services=$(aws ecs list-services --cluster $CLUSTER_NAME --output text --query 'serviceArns[*]')
for service in $services; do
    service_name=$(basename $service)
    status=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $service_name --query 'services[0].status' --output text)
    running_count=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $service_name --query 'services[0].runningCount' --output text)
    desired_count=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $service_name --query 'services[0].desiredCount' --output text)
    
    if [ "$status" == "ACTIVE" ] && [ "$running_count" == "$desired_count" ]; then
        echo -e "${GREEN}✓ $service_name: $running_count/$desired_count задач запущено${NC}"
    else
        echo -e "${RED}✗ $service_name: $running_count/$desired_count задач запущено${NC}"
    fi
done

# Проверка ECR репозиториев
echo -e "\n${YELLOW}Проверка ECR репозиториев...${NC}"
repositories=$(aws ecr describe-repositories --query 'repositories[*].repositoryName' --output text)
for repo in $repositories; do
    images_count=$(aws ecr describe-images --repository-name $repo --query 'length(imageDetails)' --output text)
    latest_image=$(aws ecr describe-images --repository-name $repo --query 'imageDetails[0].imageTags[0]' --output text)
    echo -e "${GREEN}✓ $repo: $images_count образов, последний тег: $latest_image${NC}"
done

# Проверка DocumentDB
echo -e "\n${YELLOW}Проверка DocumentDB...${NC}"
clusters=$(aws docdb describe-db-clusters --query 'DBClusters[*].[DBClusterIdentifier,Status]' --output text)
if [ -n "$clusters" ]; then
    while IFS=$'\t' read -r cluster_id status; do
        if [ "$status" == "available" ]; then
            echo -e "${GREEN}✓ Кластер $cluster_id: $status${NC}"
        else
            echo -e "${RED}✗ Кластер $cluster_id: $status${NC}"
        fi
    done <<< "$clusters"
else
    echo -e "${RED}✗ DocumentDB кластеры не найдены${NC}"
fi

# Проверка CloudWatch логов
echo -e "\n${YELLOW}Проверка последних логов...${NC}"
log_groups="/ecs/honey-frontend /ecs/honey-backend"
for group in $log_groups; do
    echo -e "\n${GREEN}Логи для $group:${NC}"
    aws logs get-log-events \
        --limit 5 \
        --log-group-name $group \
        --log-stream-name $(aws logs describe-log-streams --log-group-name $group --order-by LastEventTime --descending --limit 1 --query 'logStreams[0].logStreamName' --output text) \
        --query 'events[*].[timestamp,message]' \
        --output table
done
