# 🚀 Staging-Only CI/CD Setup Guide

Perfect! You've chosen to start with staging only. This is a great approach - you can test everything thoroughly before adding production later.

## 📋 **What You Need to Set Up**

### **1. GitHub Secrets (Required)**

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these **3 secrets only**:

```
STAGING_DROPLET_IP          # Your DigitalOcean droplet IP address
STAGING_DROPLET_USER        # SSH username (usually 'root')
STAGING_SSH_PRIVATE_KEY     # Your SSH private key
```

### **2. SSH Key Setup**

#### **Step A: Add Public Key to Your Droplet**
1. SSH into your DigitalOcean droplet:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. Add your public key:
   ```bash
   mkdir -p ~/.ssh
   echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCyPRd8R+c3C5NNmIMFhl4Ng9NWESOzXRFrWr23nD0XE724ieqJf+p+lqAr3xbkQ8lO6rCpADRoVbDOcHAg5LkEmrpw2s4SeQDScoaJiBKnfUbWxIlx2f8kznXyVF5kL9trM3HgSK45bF/t8g5fJKeJvuwAIsaZ7EUkO7UXXZ1HHtA7QWstCxbVgW8X1M57p8sSP/ZKI0bxxQDrHroo8uFJ+CLMa5vRAWZJ4nrHOtFkO8TyuYOvBqM3zan6luGM0uQoqXSvURMfSHwhgGiCm4vgeb0j2gl0oGEkfN6B63VVlMWdD2wyPLThp7cG5d9MiOsXljqE1GovX1vDatiewhE2qMRNJip11eRcqk9DHrp7bAXJZUyIOJzqjFXcaePRGTg/EAi0bxZOI7bXbrVgyKMZPz5AjVJ+Bp3wf1ayQW9l/YqkCT4+wh09E8ufzQBod76D5dp0qCqa4DKaMWjMfFEbFTYlZulME8VJpB7ajGk33V1Ba77oMxAo x53w2+fGxo8= ivanbaranov@Ivans-MacBook-Pro.local" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

#### **Step B: Add Private Key to GitHub**
1. Copy your private key:
   ```bash
   cat ~/.ssh/id_rsa
   ```

2. In GitHub, create a new secret:
   - **Name**: `STAGING_SSH_PRIVATE_KEY`
   - **Value**: Paste the entire private key (including `-----BEGIN` and `-----END` lines)

### **3. DigitalOcean Droplet Setup**

Your droplet should have this structure:
```
/opt/honey-shop/
├── docker-compose.prod.yml
├── .env
└── backups/
```

#### **Create the directory structure:**
```bash
mkdir -p /opt/honey-shop/backups
cd /opt/honey-shop
```

#### **Copy your production docker-compose file:**
```bash
# Copy from your local machine
scp digitalocean/docker-compose.prod.yml root@YOUR_DROPLET_IP:/opt/honey-shop/docker-compose.yml
```

#### **Create environment file:**
```bash
# On your droplet
nano /opt/honey-shop/.env
```

Add this content:
```bash
# MongoDB Configuration
MONGO_PASSWORD=your_secure_mongo_password_here
MONGO_INITDB_ROOT_USERNAME=honey

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=production
```

## 🚀 **How to Deploy**

### **Automatic Deployment**
1. Push code to `main` or `master` branch
2. GitHub Actions automatically deploys to staging
3. Check the Actions tab to monitor progress

### **Manual Deployment**
1. Go to **Actions** tab in GitHub
2. Select **"Deploy to DigitalOcean"** workflow
3. Click **"Run workflow"** button

## 📊 **Monitoring Your Deployment**

### **Check Deployment Status**
- **GitHub Actions**: Go to Actions tab → Click on the workflow run
- **Your App**: Visit `http://YOUR_DROPLET_IP`
- **Health Check**: Visit `http://YOUR_DROPLET_IP/health`

### **View Logs on Droplet**
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/honey-shop
docker-compose logs -f
```

## 🔧 **What the Pipeline Does**

### **Deploy Workflow**
- ✅ Builds Docker images
- ✅ Pushes to GitHub Container Registry
- ✅ Deploys to your staging droplet
- ✅ Runs health checks
- ✅ Shows deployment URL

### **Maintenance Workflow** (Daily at 2 AM UTC)
- ✅ Database backups (keeps 3 days)
- ✅ System cleanup
- ✅ Security updates check
- ✅ Health monitoring

## 🎯 **Benefits of Staging-Only Setup**

✅ **Simple setup** - Only 3 GitHub secrets needed  
✅ **Safe testing** - No production risk  
✅ **Full automation** - Push to deploy  
✅ **Easy monitoring** - Clear status and logs  
✅ **Cost effective** - Single droplet  

## 🚨 **Troubleshooting**

### **SSH Connection Issues**
```bash
# Test SSH connection
ssh root@YOUR_DROPLET_IP

# Check if services are running
docker-compose ps
```

### **Deployment Fails**
1. Check GitHub Actions logs
2. Verify all 3 secrets are set correctly
3. Ensure droplet has Docker installed
4. Check if `/opt/honey-shop` directory exists

### **App Not Accessible**
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs

# Test health endpoint
curl http://localhost/health
```

## 🔄 **Adding Production Later**

When you're ready for production, you can easily add it by:
1. Adding production secrets to GitHub
2. Uncommenting the production deployment job in the workflow
3. Setting up a production droplet

## 🎉 **You're Ready!**

Once you've added the 3 GitHub secrets and set up your droplet, just push your code and watch the magic happen! 

Your staging environment will be automatically deployed every time you push to the main branch. 🚀
