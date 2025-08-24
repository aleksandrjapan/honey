#!/bin/bash

# DigitalOcean Droplet Setup Script
# This script sets up a fresh Ubuntu droplet with Docker, Docker Compose, and other requirements

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

# Update system
update_system() {
    log_info "Updating system packages..."
    apt update && apt upgrade -y
    log_info "System updated successfully!"
}

# Install Docker
install_docker() {
    log_info "Installing Docker..."
    
    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc || true
    
    # Install prerequisites
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group
    usermod -aG docker $USER
    
    log_info "Docker installed successfully!"
}

# Install Docker Compose
install_docker_compose() {
    log_info "Installing Docker Compose..."
    
    # Install Docker Compose v2 (included with Docker)
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
    
    # Verify installation
    docker-compose --version
    
    log_info "Docker Compose installed successfully!"
}

# Install additional tools
install_tools() {
    log_info "Installing additional tools..."
    
    apt install -y \
        htop \
        vim \
        curl \
        wget \
        git \
        unzip \
        fail2ban \
        ufw \
        certbot \
        python3-certbot-nginx
    
    log_info "Additional tools installed successfully!"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Allow custom ports if needed
    ufw allow 5001
    
    # Show firewall status
    ufw status
    
    log_info "Firewall configured successfully!"
}

# Configure fail2ban
configure_fail2ban() {
    log_info "Configuring fail2ban..."
    
    # Start and enable fail2ban
    systemctl start fail2ban
    systemctl enable fail2ban
    
    # Create basic configuration
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF
    
    # Restart fail2ban
    systemctl restart fail2ban
    
    log_info "Fail2ban configured successfully!"
}

# Create swap file
create_swap() {
    log_info "Creating swap file..."
    
    # Check if swap already exists
    if swapon --show | grep -q "/swapfile"; then
        log_info "Swap file already exists"
        return
    fi
    
    # Create swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make swap permanent
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    
    log_info "Swap file created successfully!"
}

# Optimize system settings
optimize_system() {
    log_info "Optimizing system settings..."
    
    # Optimize memory settings
    cat >> /etc/sysctl.conf << 'EOF'

# Optimize for web applications
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 400000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
EOF
    
    # Apply settings
    sysctl -p
    
    log_info "System optimization completed!"
}

# Create deployment user
create_deployment_user() {
    log_info "Creating deployment user..."
    
    # Create user if it doesn't exist
    if ! id "deploy" &>/dev/null; then
        useradd -m -s /bin/bash deploy
        usermod -aG docker deploy
        usermod -aG sudo deploy
        
        # Set password (change this!)
        echo "deploy:ChangeMe123!" | chpasswd
        
        log_warn "Created user 'deploy' with password 'ChangeMe123!'"
        log_warn "Please change the password immediately!"
    else
        log_info "User 'deploy' already exists"
    fi
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up basic monitoring..."
    
    # Create logrotate configuration
    cat > /etc/logrotate.d/docker << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
    
    # Create system monitoring script
    cat > /usr/local/bin/system-monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Load: $(cat /proc/loadavg)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h /)"
echo "Docker: $(docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}')"
EOF
    
    chmod +x /usr/local/bin/system-monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/system-monitor.sh >> /var/log/system-monitor.log") | crontab -
    
    log_info "Monitoring setup completed!"
}

# Main execution
main() {
    log_info "Starting DigitalOcean droplet setup..."
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root (use sudo)"
        exit 1
    fi
    
    update_system
    install_docker
    install_docker_compose
    install_tools
    configure_firewall
    configure_fail2ban
    create_swap
    optimize_system
    create_deployment_user
    setup_monitoring
    
    log_info "Droplet setup completed successfully!"
    log_info "Please reboot the system to apply all changes"
    log_info "After reboot, you can deploy your application using the deploy.sh script"
}

# Run main function
main
