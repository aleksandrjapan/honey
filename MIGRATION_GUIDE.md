# Migration Guide: AWS to DigitalOcean

This guide will help you migrate your Honey Shop application from AWS to DigitalOcean.

## Why Migrate to DigitalOcean?

- **Cost Savings**: DigitalOcean typically offers more predictable and lower costs
- **Simplicity**: Easier to manage and understand compared to AWS
- **Developer-Friendly**: Better developer experience and documentation
- **Performance**: Often better performance for small to medium applications

## Pre-Migration Checklist

### 1. Backup Your Data

```bash
# Backup MongoDB data
mongodump --uri="mongodb://honey:password123@your-aws-mongodb:27017/honey_shop?authSource=admin" --out=./backups/mongodb-$(date +%Y%m%d)

# Backup environment variables and configuration
cp .env ./backups/env-$(date +%Y%m%d)
cp docker-compose.yml ./backups/docker-compose-$(date +%Y%m%d)
```

### 2. Document Current Configuration

- Note down all environment variables
- Document current AWS resources and their purposes
- List all custom configurations and settings

### 3. Plan Your Migration

- Choose a maintenance window
- Plan for potential downtime
- Prepare rollback procedures

## Migration Steps

### Step 1: Set Up DigitalOcean Infrastructure

1. **Create Droplet**:
   ```bash
   # Follow the DigitalOcean setup guide
   # Use the droplet-setup.sh script
   ```

2. **Configure Domain**:
   - Point your domain to the new DigitalOcean droplet
   - Update DNS records (A record for main domain, CNAME for API)

### Step 2: Prepare Local Environment

1. **Install DigitalOcean CLI** (optional):
   ```bash
   # macOS
   brew install doctl
   
   # Linux
   snap install doctl
   ```

2. **Configure SSH Access**:
   ```bash
   # Add your SSH key to DigitalOcean
   # Test connection
   ssh root@YOUR_DROPLET_IP
   ```

### Step 3: Deploy to DigitalOcean

1. **Set Environment Variables**:
   ```bash
   export DROPLET_IP=YOUR_DROPLET_IP
   export SSH_KEY_PATH=~/.ssh/your_key
   ```

2. **Run Deployment**:
   ```bash
   cd digitalocean
   ./deploy.sh
   ```

### Step 4: Verify Deployment

1. **Check Services**:
   ```bash
   ./deploy.sh status
   ```

2. **Test Application**:
   - Frontend: `http://YOUR_DROPLET_IP`
   - Backend: `http://YOUR_DROPLET_IP:5001`
   - Traefik Dashboard: `http://YOUR_DROPLET_IP:8080`

### Step 5: Update DNS and SSL

1. **Update Domain Records**:
   - Point A record to your droplet IP
   - Create CNAME for API subdomain

2. **Verify SSL Certificates**:
   - Traefik will automatically generate certificates
   - Check certificate status in Traefik dashboard

## Post-Migration Tasks

### 1. Update Configuration Files

- Update API endpoints in your frontend code
- Update any hardcoded AWS URLs
- Update monitoring and logging configurations

### 2. Test All Functionality

- User registration and login
- Product management
- Order processing
- Admin functions
- File uploads (if any)

### 3. Update Monitoring

- Set up DigitalOcean monitoring
- Configure alerts for resource usage
- Set up log aggregation if needed

### 4. Performance Optimization

- Monitor resource usage
- Optimize Docker configurations
- Configure caching strategies

## Rollback Plan

If you need to rollback to AWS:

1. **Stop DigitalOcean Services**:
   ```bash
   ./deploy.sh stop
   ```

2. **Restore AWS Infrastructure**:
   ```bash
   cd aws
   ./deploy.sh
   ```

3. **Restore Data**:
   ```bash
   mongorestore --uri="mongodb://honey:password123@your-aws-mongodb:27017/honey_shop?authSource=admin" ./backups/mongodb-YYYYMMDD/
   ```

## Cost Comparison

### AWS Costs (Typical)
- EC2: $20-40/month (t3.small)
- RDS: $15-30/month
- Load Balancer: $18/month
- Data Transfer: $0.09/GB
- **Total: $53-88/month**

### DigitalOcean Costs (Typical)
- Droplet: $12-24/month (Basic plan)
- Load Balancer: $10/month (optional)
- Data Transfer: $0.01/GB
- **Total: $12-34/month**

**Potential Savings: 50-70%**

## Security Considerations

### DigitalOcean Security Features
- Built-in firewall (UFW)
- Fail2ban for SSH protection
- Automatic security updates
- DDoS protection

### Additional Security Measures
- Regular security updates
- Monitor access logs
- Use strong passwords
- Enable 2FA on DigitalOcean account

## Monitoring and Maintenance

### Daily Tasks
- Check service status
- Monitor resource usage
- Review error logs

### Weekly Tasks
- Update system packages
- Review security logs
- Check backup status

### Monthly Tasks
- Review cost optimization
- Update SSL certificates
- Performance analysis

## Support Resources

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Troubleshooting Common Issues

### Connection Issues
```bash
# Check droplet status
doctl compute droplet list

# Check firewall rules
ufw status

# Test connectivity
ping YOUR_DROPLET_IP
```

### Service Issues
```bash
# Check Docker services
docker ps
docker-compose ps

# Check logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### SSL Issues
```bash
# Check Traefik logs
docker-compose logs traefik

# Verify domain configuration
nslookup your-domain.com
```

## Conclusion

Migrating from AWS to DigitalOcean can significantly reduce costs while maintaining or improving performance. The key is proper planning, testing, and monitoring throughout the process.

Remember to:
- Test thoroughly before going live
- Keep backups of everything
- Monitor performance after migration
- Have a rollback plan ready
- Document all changes made

For additional help, refer to the DigitalOcean deployment guide in the `digitalocean/` directory.
