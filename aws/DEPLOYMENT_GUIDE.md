# Honey Shop Deployment Guide

## Overview
This guide explains how to deploy the Honey Shop application using CloudFormation and ECS.

## Architecture
The application is deployed using two separate CloudFormation stacks:
1. **Infrastructure Stack** (`honey-shop-infra`) - Contains VPC, ECS Cluster, ECR repositories, DocumentDB, and ALB
2. **Services Stack** (`honey-shop-services`) - Contains ECS services, task definitions, and ALB configuration

## Prerequisites
- AWS CLI installed and configured
- Docker installed
- Appropriate AWS permissions for CloudFormation, ECS, ECR, EC2, and DocumentDB

## Deployment Options

### Option 1: Full Deployment (Infrastructure + Services)
Use this for initial deployment or when you need to recreate everything:

```bash
./deploy.sh
```

This script will:
1. Create/update the infrastructure stack
2. Create/update the services stack
3. Build and push Docker images
4. Update ECS services with new images

### Option 2: Services Only Deployment
Use this for CI/CD pipelines or when only updating application code:

```bash
./deploy-services-only.sh
```

This script will:
1. Check that infrastructure exists
2. Create/update only the services stack
3. Use existing Docker images

## Fixing the "ServiceNotFoundException" Error

The `ServiceNotFoundException` error occurs when:
1. The ECS services haven't been created yet
2. The services stack is missing or failed
3. The deployment pipeline tries to update services before they exist

### Solution Steps:

1. **Check if services exist:**
   ```bash
   aws ecs list-services --cluster honey-cluster --region eu-central-1
   ```

2. **If no services exist, deploy the services stack:**
   ```bash
   ./deploy-services-only.sh
   ```

3. **Verify services are running:**
   ```bash
   ./status.sh
   ```

4. **Check CloudFormation stack status:**
   ```bash
   aws cloudformation describe-stacks --stack-name honey-shop-services --region eu-central-1
   ```

## Troubleshooting

### Common Issues:

1. **Services not found:**
   - Ensure the services stack was created successfully
   - Check that the infrastructure stack outputs are available
   - Verify VPC, subnets, and security groups exist

2. **Task definition errors:**
   - Check IAM roles have proper permissions
   - Verify ECR repository access
   - Ensure container images exist and are accessible

3. **Network configuration errors:**
   - Verify VPC and subnet IDs are correct
   - Check security group rules
   - Ensure ALB is properly configured

### Debugging Commands:

```bash
# Check ECS cluster status
aws ecs describe-clusters --clusters honey-cluster --region eu-central-1

# Check service status
aws ecs describe-services --cluster honey-cluster --services honey-frontend --region eu-central-1

# Check task status
aws ecs list-tasks --cluster honey-cluster --region eu-central-1

# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name honey-shop-services --region eu-central-1
```

## CI/CD Integration

For CI/CD pipelines, use the `deploy-services-only.sh` script:

```yaml
# Example GitHub Actions step
- name: Deploy to ECS
  run: |
    cd aws
    ./deploy-services-only.sh
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: eu-central-1
```

## Security Notes

- DocumentDB password is auto-generated and displayed at the end of deployment
- Save this password securely for future use
- Consider using AWS Secrets Manager for production deployments
- Review security group rules and restrict access as needed

## Cost Optimization

- Use Fargate Spot for non-production environments
- Set appropriate auto-scaling policies
- Monitor CloudWatch metrics for resource utilization
- Consider using reserved instances for production workloads
