# 🚀 GitHub Actions CI/CD Setup Complete

Your GitHub Actions CI/CD pipeline is now configured for automated deployment to DigitalOcean! Here's what has been set up:

## 📁 Files Created

### Workflow Files
- `.github/workflows/deploy.yml` - Main deployment workflow
- `.github/workflows/maintenance.yml` - Automated maintenance tasks
- `.github/scripts/deploy.sh` - Deployment script for GitHub Actions

### Optimized Docker Files
- `Dockerfile.frontend` - Optimized frontend container with security improvements
- `backend/Dockerfile` - Optimized backend container with multi-stage build
- `nginx.conf` - Enhanced nginx configuration with security headers and health checks

## 🔧 What the Pipeline Does

### 1. **Deploy Workflow** (`.github/workflows/deploy.yml`)
- **Triggers**: 
  - Automatic deployment to staging on push to `main`/`master` branch
  - Manual deployment to staging or production via workflow dispatch
- **Features**:
  - Builds and pushes Docker images to GitHub Container Registry
  - Deploys to staging automatically
  - Manual production deployment with approval
  - Health checks after deployment
  - Rollback capability on failure

### 2. **Maintenance Workflow** (`.github/workflows/maintenance.yml`)
- **Triggers**: 
  - Daily at 2 AM UTC (automatic)
  - Manual trigger for specific tasks
- **Tasks**:
  - Database backups (keeps 7 days)
  - System cleanup (Docker images, logs, temp files)
  - Security updates check
  - Health monitoring
  - Log rotation
  - Dependency updates

## 🔐 Required GitHub Secrets

You need to add these secrets in your GitHub repository:

### Go to: Repository → Settings → Secrets and variables → Actions

#### Staging Environment
```
STAGING_DROPLET_IP          # Your staging droplet IP address
STAGING_DROPLET_USER        # SSH username (usually 'root')
STAGING_SSH_PRIVATE_KEY     # Your SSH private key for staging
```

#### Production Environment
```
PRODUCTION_DROPLET_IP       # Your production droplet IP address
PRODUCTION_DROPLET_USER     # SSH username (usually 'root')
PRODUCTION_SSH_PRIVATE_KEY  # Your SSH private key for production
PRODUCTION_DOMAIN           # Your production domain (e.g., 'yourdomain.com')
```

## 🚀 How to Deploy

### Automatic Deployment (Staging)
1. Push code to `main` or `master` branch
2. GitHub Actions automatically:
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Deploys to staging environment
   - Runs health checks

### Manual Deployment (Production)
1. Go to **Actions** tab in your GitHub repository
2. Select **"Deploy to DigitalOcean"** workflow
3. Click **"Run workflow"**
4. Choose environment: `production`
5. Click **"Run workflow"** button

## 📊 Monitoring

### View Deployment Status
- Go to **Actions** tab in GitHub
- Click on the workflow run
- Monitor real-time logs and status

### Health Checks
- **Frontend**: `http://your-domain/health`
- **Backend**: `http://your-domain/api/health`
- **Staging**: `http://staging-ip/health`

## 🔧 DigitalOcean Setup Requirements

### 1. Droplet Configuration
Your DigitalOcean droplet should have:
- Docker and Docker Compose installed
- SSH access configured
- Project directory: `/opt/honey-shop`

### 2. Directory Structure on Droplet
```
/opt/honey-shop/
├── docker-compose.prod.yml
├── .env
├── traefik/
├── certificates/
└── backups/
```

### 3. Environment File
Create `.env` file on your droplet with:
```bash
# MongoDB Configuration
MONGO_PASSWORD=your_secure_mongo_password_here
MONGO_INITDB_ROOT_USERNAME=honey

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Domain Configuration
DOMAIN=your-domain.com
API_DOMAIN=api.your-domain.com

# Email for Let's Encrypt
LETSENCRYPT_EMAIL=your-email@example.com

# Environment
NODE_ENV=production
```

## 🛠️ Advanced Features

### 1. **Multi-Environment Support**
- Staging: Automatic deployment on main branch
- Production: Manual deployment with approval
- Easy to add more environments

### 2. **Security Improvements**
- Non-root users in containers
- Security headers in nginx
- Health checks for all services
- Automated security updates

### 3. **Performance Optimizations**
- Multi-stage Docker builds
- Layer caching for faster builds
- Gzip compression
- Static asset caching

### 4. **Monitoring & Maintenance**
- Daily automated backups
- System cleanup
- Health monitoring
- Log rotation

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```
Error: ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
```
**Solution**: Check if droplet is running and SSH is enabled

#### 2. Permission Denied
```
Error: Permission denied (publickey)
```
**Solution**: Verify SSH private key is correct in GitHub secrets

#### 3. Health Check Failed
```
Error: Health check failed
```
**Solution**: Check if services are running and health endpoints are accessible

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl -f http://localhost/health
curl -f http://localhost/api/health
```

## 📈 Next Steps

1. **Set up your GitHub secrets** (most important!)
2. **Push your code** to trigger the first deployment
3. **Monitor the Actions tab** for deployment progress
4. **Test your staging environment**
5. **Deploy to production** when ready
6. **Set up monitoring** and notifications

## 🎯 Benefits

✅ **Automated deployments** - No more manual deployment steps  
✅ **Zero-downtime deployments** - Health checks ensure smooth transitions  
✅ **Rollback capability** - Automatic rollback on deployment failure  
✅ **Security hardened** - Non-root containers, security headers, updates  
✅ **Performance optimized** - Caching, compression, multi-stage builds  
✅ **Monitoring included** - Health checks, logs, system monitoring  
✅ **Maintenance automated** - Backups, cleanup, security updates  

## 🆘 Support

If you encounter any issues:
1. Check the **Actions** tab for detailed logs
2. Review this setup guide
3. Check your GitHub secrets configuration
4. Verify your DigitalOcean droplet setup

Your CI/CD pipeline is now ready! 🎉
