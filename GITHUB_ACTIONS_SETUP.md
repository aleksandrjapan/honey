# GitHub Actions Setup Guide for DigitalOcean Deployment

This guide will help you set up GitHub Actions for automated CI/CD deployment to DigitalOcean.

## 🚀 Overview

The GitHub Actions setup includes:
- **Automated Testing**: Runs on every PR and push
- **Automated Building**: Builds and pushes Docker images to GitHub Container Registry
- **Automated Deployment**: Deploys to staging and production environments
- **Scheduled Maintenance**: Daily automated maintenance tasks
- **Security Scanning**: Automated security audits and dependency updates

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **DigitalOcean Droplets**: Staging and production environments set up
3. **SSH Keys**: SSH access to your DigitalOcean droplets
4. **Domain Names**: Configured for your environments (optional but recommended)

## 🔐 Setting Up GitHub Secrets

### Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

#### Staging Environment
```
STAGING_DROPLET_IP          # Your staging droplet IP address
STAGING_DROPLET_USER        # SSH username (usually 'root' or 'deploy')
STAGING_SSH_PRIVATE_KEY     # Your SSH private key for staging
```

#### Production Environment
```
PRODUCTION_DROPLET_IP       # Your production droplet IP address
PRODUCTION_DROPLET_USER     # SSH username (usually 'root' or 'deploy')
PRODUCTION_SSH_PRIVATE_KEY  # Your SSH private key for production
PRODUCTION_DOMAIN           # Your production domain (e.g., 'yourdomain.com')
```

### How to Add SSH Private Key

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

2. **Add Public Key to DigitalOcean**:
   - Copy the content of `~/.ssh/id_rsa.pub`
   - Add it to your DigitalOcean droplet's authorized keys

3. **Add Private Key to GitHub**:
   - Copy the content of `~/.ssh/id_rsa` (the private key)
   - Add it as a secret in GitHub

## 🏗️ Workflow Files

### 1. Main Deployment Workflow (`deploy.yml`)

This workflow handles:
- Building Docker images
- Pushing to GitHub Container Registry
- Deploying to staging (automatic on main branch)
- Deploying to production (manual trigger)

### 2. Testing Workflow (`test.yml`)

This workflow runs on every PR and push:
- Code validation
- Security scanning
- Docker image validation
- Integration tests
- Performance testing

### 3. Maintenance Workflow (`maintenance.yml`)

This workflow runs daily and handles:
- Security updates
- Database backups
- System cleanup
- Health checks
- System updates

## 🚀 First Deployment

### 1. Push Your Code

```bash
git add .
git commit -m "Add GitHub Actions workflows"
git push origin main
```

### 2. Monitor the Workflow

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see the workflow running
4. Click on it to monitor progress

### 3. Check Deployment

Once the workflow completes:
- **Staging**: Check `http://YOUR_STAGING_IP`
- **Production**: Check `https://YOUR_DOMAIN`

## 🔄 Workflow Triggers

### Automatic Triggers

- **Push to main/master**: Automatically deploys to staging
- **Pull Request**: Runs tests and validation
- **Daily at 2 AM UTC**: Runs maintenance tasks

### Manual Triggers

- **Manual deployment**: Go to Actions → Deploy to DigitalOcean → Run workflow
- **Select environment**: Choose staging or production
- **Trigger maintenance**: Run specific maintenance tasks

## 📊 Monitoring and Debugging

### View Workflow Logs

1. Go to Actions tab in your repository
2. Click on the workflow run
3. Click on the job to see detailed logs
4. Expand individual steps for more details

### Common Issues and Solutions

#### SSH Connection Failed
```
Error: ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
```

**Solution**:
- Check if the droplet is running
- Verify the IP address is correct
- Ensure SSH is enabled on the droplet
- Check firewall settings

#### Permission Denied
```
Error: Permission denied (publickey)
```

**Solution**:
- Verify the SSH private key is correct
- Check if the public key is added to the droplet
- Ensure the username is correct

#### Docker Build Failed
```
Error: failed to build Docker image
```

**Solution**:
- Check Dockerfile syntax
- Verify all required files are present
- Check for syntax errors in your code

#### Health Check Failed
```
Error: Health check failed
```

**Solution**:
- Verify the application is running
- Check service logs on the droplet
- Ensure the health endpoint is working

## 🔧 Customization

### Environment-Specific Configuration

You can customize the deployment for different environments:

```yaml
# In your workflow
- name: Deploy to Staging
  uses: ./.github/actions/deploy
  with:
    environment: staging
    health_check_url: http://staging.yourdomain.com/health

- name: Deploy to Production
  uses: ./.github/actions/deploy
  with:
    environment: production
    health_check_url: https://yourdomain.com/health
```

### Adding More Environments

To add a development environment:

1. **Add secrets**:
   ```
   DEV_DROPLET_IP
   DEV_DROPLET_USER
   DEV_SSH_PRIVATE_KEY
   ```

2. **Add deployment job**:
   ```yaml
   deploy-dev:
     needs: build
     runs-on: ubuntu-latest
     environment: development
     steps:
       - uses: ./.github/actions/deploy
         with:
           droplet_ip: ${{ secrets.DEV_DROPLET_IP }}
           username: ${{ secrets.DEV_DROPLET_USER }}
           ssh_key: ${{ secrets.DEV_SSH_PRIVATE_KEY }}
           environment: development
   ```

### Custom Health Checks

You can customize health check endpoints:

```yaml
health_check_url: https://yourdomain.com/api/health
```

Or add multiple health checks:

```yaml
- name: Health Check Frontend
  run: curl -f https://yourdomain.com/health

- name: Health Check Backend
  run: curl -f https://api.yourdomain.com/health
```

## 🔒 Security Best Practices

### 1. Use Environment Protection

- Enable "Required reviewers" for production deployments
- Restrict who can approve production deployments
- Use branch protection rules

### 2. Rotate Secrets Regularly

- Change SSH keys periodically
- Update API tokens regularly
- Monitor secret usage

### 3. Limit Access

- Use dedicated deployment users on droplets
- Restrict SSH access to specific IPs
- Use key-based authentication only

### 4. Monitor Deployments

- Review deployment logs regularly
- Set up notifications for failed deployments
- Monitor resource usage

## 📈 Scaling and Optimization

### 1. Parallel Jobs

Run multiple jobs in parallel when possible:

```yaml
jobs:
  test-frontend:
    runs-on: ubuntu-latest
    # ... frontend tests

  test-backend:
    runs-on: ubuntu-latest
    # ... backend tests

  security-scan:
    runs-on: ubuntu-latest
    # ... security scanning
```

### 2. Caching

Use caching to speed up builds:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      */*/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 3. Matrix Builds

Build for multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

## 🆘 Troubleshooting

### Workflow Not Running

1. **Check file location**: Ensure workflows are in `.github/workflows/`
2. **Check syntax**: Validate YAML syntax
3. **Check permissions**: Ensure the repository has Actions enabled
4. **Check branch**: Verify the workflow triggers match your branch

### Deployment Fails

1. **Check secrets**: Verify all required secrets are set
2. **Check connectivity**: Test SSH connection manually
3. **Check permissions**: Ensure the user has necessary permissions
4. **Check logs**: Review droplet logs for errors

### Performance Issues

1. **Optimize Docker images**: Use multi-stage builds
2. **Use caching**: Cache dependencies and build artifacts
3. **Parallel jobs**: Run independent jobs in parallel
4. **Resource limits**: Monitor resource usage on droplets

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [DigitalOcean API Documentation](https://docs.digitalocean.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## 🎯 Next Steps

1. **Set up your secrets** in GitHub
2. **Push your code** to trigger the first workflow
3. **Monitor the deployment** and fix any issues
4. **Customize the workflows** for your specific needs
5. **Set up notifications** for deployment status
6. **Configure branch protection** for production deployments

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in the Actions tab
2. **Review this guide** for common solutions
3. **Check GitHub Actions documentation**
4. **Review DigitalOcean deployment logs**
5. **Open an issue** in your repository

Remember: The first deployment might take longer as it sets up everything. Subsequent deployments will be much faster!
