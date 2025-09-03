#!/bin/bash

# DigitalOcean Droplet Setup Script
# Run this script on your DigitalOcean droplet to prepare it for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run this script as root (use sudo)"
    exit 1
fi

log_info "Starting DigitalOcean droplet setup..."

# Update system packages
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log_info "Installing required packages..."
apt install -y curl wget git

# Install Docker
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    log_info "Docker installed successfully"
else
    log_info "Docker is already installed"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install -y docker-compose
    log_info "Docker Compose installed successfully"
else
    log_info "Docker Compose is already installed"
fi

# Start and enable Docker
log_info "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Create project directory structure
log_info "Creating project directory structure..."
mkdir -p /opt/honey-shop
mkdir -p /opt/honey-shop/backups
mkdir -p /opt/honey-shop/logs
mkdir -p /opt/honey-shop/traefik
mkdir -p /opt/honey-shop/certificates

# Set proper permissions
chmod 755 /opt/honey-shop
chmod 755 /opt/honey-shop/backups
chmod 755 /opt/honey-shop/logs

# Create basic environment file if it doesn't exist
if [ ! -f "/opt/honey-shop/.env" ]; then
    log_info "Creating basic environment file..."
    cat > /opt/honey-shop/.env << 'EOF'
# MongoDB Configuration
MONGO_PASSWORD=your_secure_mongo_password_here
MONGO_INITDB_ROOT_USERNAME=honey

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=production
EOF
    log_warn "Please edit /opt/honey-shop/.env with your actual values"
fi

# Test Docker installation
log_info "Testing Docker installation..."
if docker --version && docker-compose --version; then
    log_info "Docker and Docker Compose are working correctly"
else
    log_error "Docker installation test failed"
    exit 1
fi

# Show final status
log_info "Setup completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Edit /opt/honey-shop/.env with your actual values"
echo "2. Copy your docker-compose.prod.yml to /opt/honey-shop/docker-compose.yml"
echo "3. Test your GitHub Actions deployment"
echo ""
log_info "Directory structure created:"
ls -la /opt/honey-shop/
echo ""
log_info "Docker status:"
systemctl status docker --no-pager -l
