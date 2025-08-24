# DigitalOcean Deployment Guide for Honey Shop

This guide will help you deploy your Honey Shop application to DigitalOcean using Docker and Docker Compose.

## Prerequisites

- A DigitalOcean account
- A domain name (optional but recommended)
- SSH key pair for secure access
- Docker and Docker Compose installed locally

## Quick Start

### 1. Create a DigitalOcean Droplet

1. Log in to your DigitalOcean account
2. Click "Create" → "Droplets"
3. Choose "Ubuntu 22.04 LTS" as the image
4. Select a plan (Basic plan with 2GB RAM minimum recommended)
5. Choose a datacenter region close to your users
6. Add your SSH key
7. Choose a hostname (e.g., `honey-shop-prod`)
8. Click "Create Droplet"

### 2. Set Up the Droplet

Once your droplet is created, SSH into it and run the setup script:

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/honey-shop/main/digitalocean/droplet-setup.sh | bash

# Reboot the system
reboot
```

After reboot, SSH back in and verify Docker is working:

```bash
docker --version
docker-compose --version
```

### 3. Configure Environment Variables

Create a `.env` file in the `digitalocean` directory:

```bash
# Copy the example file
cp env.example .env

# Edit the file with your actual values
nano .env
```

Update the following variables:
- `MONGO_PASSWORD`: Secure MongoDB password
- `JWT_SECRET`: Secure JWT secret key
- `DOMAIN`: Your domain name
- `API_DOMAIN`: Your API subdomain
- `LETSENCRYPT_EMAIL`: Your email for SSL certificates

### 4. Deploy the Application

From your local machine, run the deployment script:

```bash
# Set environment variables
export DROPLET_IP=YOUR_DROPLET_IP
export SSH_KEY_PATH=~/.ssh/your_key

# Make the script executable
chmod +x digitalocean/deploy.sh

# Deploy
./digitalocean/deploy.sh
```

## Configuration Options

### Using Traefik (Recommended)

The default configuration uses Traefik as a reverse proxy with automatic SSL certificate generation. This is the recommended approach for production deployments.

### Using Nginx

If you prefer Nginx, you can:

1. Comment out the Traefik service in `docker-compose.prod.yml`
2. Uncomment the Nginx service
3. Update the Nginx configuration in `nginx.conf`
4. Set up SSL certificates manually using Let's Encrypt

### Domain Configuration

For production use, configure your domain:

1. Point your domain's A record to your droplet's IP address
2. Create a CNAME record for `api.your-domain.com` pointing to your main domain
3. Update the domain names in your `.env` file
4. Update the Traefik labels in `docker-compose.prod.yml`

## SSL Certificates

### Automatic (Traefik)

Traefik automatically generates and renews SSL certificates using Let's Encrypt. Just ensure your domain is properly configured.

### Manual (Nginx)

If using Nginx, generate certificates manually:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com
```

## Monitoring and Maintenance

### View Logs

```bash
# View all service logs
./digitalocean/deploy.sh logs

# View specific service logs
ssh root@YOUR_DROPLET_IP "cd /opt/honey-shop && docker-compose logs -f service_name"
```

### Check Status

```bash
./digitalocean/deploy.sh status
```

### Restart Services

```bash
./digitalocean/deploy.sh restart
```

### Stop Services

```bash
./digitalocean/deploy.sh stop
```

## Security Considerations

### Firewall

The setup script configures UFW firewall with:
- SSH access (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- Custom backend port (5001)

### Fail2ban

Automatically installed and configured to protect against brute force attacks.

### User Management

A `deploy` user is created with sudo access. Change the default password immediately.

### SSL/TLS

- TLS 1.2 and 1.3 only
- Strong cipher suites
- Security headers (HSTS, X-Frame-Options, etc.)

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec honey_mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)

# Copy backup to local machine
scp -r root@YOUR_DROPLET_IP:/data/backup/ ./backups/
```

### Application Backup

```bash
# Backup configuration
scp -r root@YOUR_DROPLET_IP:/opt/honey-shop/ ./backups/honey-shop-config/
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Check if another service is using the port
2. **SSL certificate issues**: Verify domain configuration and DNS propagation
3. **Database connection errors**: Check MongoDB service status and credentials
4. **Permission denied**: Ensure proper file permissions and user groups

### Debug Commands

```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs service_name

# Check system resources
htop
df -h
free -h

# Check network connectivity
netstat -tlnp
ss -tlnp
```

### Getting Help

1. Check the logs: `./digitalocean/deploy.sh logs`
2. Verify environment variables
3. Check Docker service status
4. Review firewall and security group settings

## Cost Optimization

- Use Basic plan droplets for development/testing
- Consider using DigitalOcean's managed databases for production
- Monitor resource usage and scale accordingly
- Use volume snapshots for backups instead of external storage

## Scaling

### Vertical Scaling

Increase droplet resources (CPU, RAM) as needed.

### Horizontal Scaling

For multiple instances:
1. Use a load balancer
2. Configure shared storage for MongoDB
3. Use environment variables for service discovery
4. Implement health checks and auto-scaling

## Support

For issues specific to this deployment:
1. Check the troubleshooting section
2. Review DigitalOcean's documentation
3. Check Docker and Docker Compose logs
4. Verify network and firewall configuration
