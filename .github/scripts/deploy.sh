#!/bin/bash

# GitHub Actions Deployment Script for Honey Shop
# This script handles deployment to DigitalOcean droplets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${ENVIRONMENT:-staging}"
DROPLET_IP="${DROPLET_IP}"
DROPLET_USER="${DROPLET_USER:-root}"
PROJECT_NAME="honey-shop"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME}"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

check_requirements() {
    log_info "Checking deployment requirements..."
    
    if [ -z "$DROPLET_IP" ]; then
        log_error "DROPLET_IP environment variable is not set."
        exit 1
    fi
    
    if [ -z "$IMAGE_NAME" ]; then
        log_error "IMAGE_NAME environment variable is not set."
        exit 1
    fi
    
    log_info "Requirements check passed!"
}

create_backup() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating backup for production deployment..."
        
        # Create backup directory if it doesn't exist
        ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" "mkdir -p /opt/backups"
        
        # Create database backup
        ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
            cd /opt/$PROJECT_NAME
            if docker-compose ps | grep -q mongodb; then
                docker-compose exec -T mongodb mongodump --archive --gzip > /opt/backups/backup-\$(date +%Y%m%d-%H%M%S).gz
                log_info "Database backup created successfully"
            else
                log_warn "MongoDB container not running, skipping backup"
            fi
EOF
    fi
}

pull_images() {
    log_info "Pulling latest Docker images..."
    
    ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
        # Login to GitHub Container Registry
        echo "$GITHUB_TOKEN" | docker login $REGISTRY -u $GITHUB_ACTOR --password-stdin
        
        # Pull latest images
        docker pull $REGISTRY/$IMAGE_NAME-frontend:latest
        docker pull $REGISTRY/$IMAGE_NAME-backend:latest
        
        # Tag images for local use
        docker tag $REGISTRY/$IMAGE_NAME-frontend:latest honey-shop-frontend:latest
        docker tag $REGISTRY/$IMAGE_NAME-backend:latest honey-shop-backend:latest
        
        log_info "Images pulled and tagged successfully"
EOF
}

deploy_services() {
    log_info "Deploying services to $ENVIRONMENT environment..."
    
    ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
        cd /opt/$PROJECT_NAME
        
        # Stop existing services gracefully
        log_info "Stopping existing services..."
        docker-compose down --timeout 30 || true
        
        # Start services
        log_info "Starting services..."
        docker-compose up -d
        
        # Wait for services to be ready
        log_info "Waiting for services to start..."
        sleep 30
        
        # Check service status
        log_info "Checking service status..."
        docker-compose ps
EOF
}

health_check() {
    log_info "Performing health check..."
    
    local health_url
    if [ "$ENVIRONMENT" = "production" ]; then
        health_url="https://$PRODUCTION_DOMAIN/health"
    else
        health_url="http://$DROPLET_IP/health"
    fi
    
    # Wait for services to be ready and perform health check
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_info "Health check passed!"
            return 0
        else
            log_warn "Health check failed, retrying in 10 seconds..."
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    
    ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
        # Remove dangling images
        docker image prune -f
        
        # Remove old images (keep last 3 versions)
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | \
        grep -E "(honey-shop|$REGISTRY/$IMAGE_NAME)" | \
        tail -n +4 | \
        awk '{print \$3}' | \
        xargs -r docker rmi -f || true
        
        log_info "Cleanup completed"
EOF
}

show_deployment_status() {
    log_info "Deployment Status for $ENVIRONMENT:"
    
    ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
        cd /opt/$PROJECT_NAME
        
        echo "=== Service Status ==="
        docker-compose ps
        
        echo -e "\n=== Recent Logs ==="
        docker-compose logs --tail=10
        
        echo -e "\n=== System Resources ==="
        echo "Disk Usage:"
        df -h | grep -E "(Filesystem|/dev/)"
        
        echo -e "\nMemory Usage:"
        free -h
        
        echo -e "\nDocker System Info:"
        docker system df
EOF
}

rollback() {
    log_error "Deployment failed, attempting rollback..."
    
    ssh -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
        cd /opt/$PROJECT_NAME
        
        # Stop current services
        docker-compose down || true
        
        # Restore from backup if available
        if [ "$ENVIRONMENT" = "production" ] && [ -d "/opt/backups" ]; then
            latest_backup=\$(ls -t /opt/backups/backup-*.gz | head -n1)
            if [ -n "\$latest_backup" ]; then
                log_info "Restoring from backup: \$latest_backup"
                docker-compose up -d mongodb
                sleep 10
                docker-compose exec -T mongodb mongorestore --archive --gzip < "\$latest_backup"
            fi
        fi
        
        # Start services with previous configuration
        docker-compose up -d
        
        log_info "Rollback completed"
EOF
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment..."
    log_info "Target: $DROPLET_USER@$DROPLET_IP"
    
    check_requirements
    
    # Create backup before deployment
    create_backup
    
    # Pull latest images
    pull_images
    
    # Deploy services
    deploy_services
    
    # Perform health check
    if health_check; then
        log_info "Deployment completed successfully!"
        cleanup_old_images
        show_deployment_status
    else
        log_error "Health check failed!"
        rollback
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "status")
        show_deployment_status
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup_old_images
        ;;
    *)
        main
        ;;
esac
