# Render Deployment Guide - www.voxxypresents.com

This guide covers deploying the Voxxy Presents Client to Render and connecting it to your custom domain.

## Overview

The application will be deployed with:
- **Production**: https://www.voxxypresents.com (from `main` branch)
- **Staging**: https://staging-voxxy-presents.onrender.com (from `staging` branch)
- **Development**: https://dev-voxxy-presents.onrender.com (from `develop` branch)

## Prerequisites

1. Render account (https://render.com)
2. Domain ownership of `voxxypresents.com`
3. GitHub repository connected to Render

## Initial Setup

### 1. Connect Repository to Render

1. Log into your Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `courtneygreer-voxxy/voxxy-presents-client`
4. Configure the service:

**Production Service:**
- **Name**: `voxxy-presents-client`
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: Choose based on your needs (Starter is fine for most cases)

### 2. Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.voxxypresents.com
NEXT_PUBLIC_SITE_NAME=Voxxy Presents
NEXT_PUBLIC_SITE_DESCRIPTION=Welcome to Voxxy Presents
```

### 3. Custom Domain Setup

#### In Render Dashboard:
1. Go to your service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Add both:
   - `www.voxxypresents.com`
   - `voxxypresents.com`

#### DNS Configuration:
Update your domain's DNS settings:

**For www.voxxypresents.com:**
```
Type: CNAME
Name: www
Value: [your-render-service].onrender.com
TTL: 300 (or your preference)
```

**For voxxypresents.com (apex domain):**
```
Type: A
Name: @
Value: [Render's IP addresses - check Render docs for current IPs]
TTL: 300
```

**Alternative for apex domain (if your DNS provider supports ALIAS/ANAME):**
```
Type: ALIAS/ANAME
Name: @
Value: [your-render-service].onrender.com
TTL: 300
```

## Multiple Environment Setup

### Staging Environment

1. Create another web service in Render:
   - **Name**: `voxxy-presents-client-staging`
   - **Branch**: `staging`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=staging
     NEXT_PUBLIC_SITE_URL=https://staging-voxxy-presents.onrender.com
     NEXT_PUBLIC_SITE_NAME=Voxxy Presents (Staging)
     NEXT_PUBLIC_SITE_DESCRIPTION=Voxxy Presents Staging Environment
     ```

### Development Environment

1. Create a third web service:
   - **Name**: `voxxy-presents-client-dev`
   - **Branch**: `develop`
   - **Environment Variables**:
     ```
     NODE_ENV=development
     NEXT_PUBLIC_SITE_URL=https://dev-voxxy-presents.onrender.com
     NEXT_PUBLIC_SITE_NAME=Voxxy Presents (Dev)
     NEXT_PUBLIC_SITE_DESCRIPTION=Voxxy Presents Development Environment
     ```

## Using render.yaml (Infrastructure as Code)

The included `render.yaml` file can automate service creation:

1. In Render dashboard, go to **"New +"** → **"Blueprint"**
2. Connect your repository
3. Render will automatically create services based on `render.yaml`

## SSL/TLS

Render automatically provides SSL certificates:
- Let's Encrypt certificates for custom domains
- Automatic renewal
- HTTPS redirect enforced

## Deployment Process

### Automatic Deployments
- **Push to `main`** → Deploys to production
- **Push to `staging`** → Deploys to staging  
- **Push to `develop`** → Deploys to development

### Manual Deployment
1. Go to Render dashboard
2. Select your service
3. Click **"Manual Deploy"**
4. Choose the branch/commit to deploy

## Health Checks

Render automatically performs health checks on your service:
- **Health Check Path**: `/` (configured in render.yaml)
- **Timeout**: 30 seconds
- **Retry**: 3 attempts

If health checks fail, Render will not route traffic to the new deployment.

## Monitoring and Logs

### Viewing Logs
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. View real-time logs from your application

### Metrics
Render provides basic metrics:
- CPU usage
- Memory usage
- Request count
- Response times

## Configuration Files

### render.yaml
Defines your infrastructure as code:
- Service configurations
- Environment variables
- Domain settings
- Auto-deploy settings

### next.config.mjs
Configured for:
- Domain redirects (voxxypresents.com → www.voxxypresents.com)
- Security headers
- Image optimization

## Scaling

### Vertical Scaling
Upgrade your plan in Render dashboard:
- **Starter**: 0.5 CPU, 512 MB RAM
- **Standard**: 1 CPU, 2 GB RAM
- **Pro**: 2 CPU, 4 GB RAM

### Horizontal Scaling
Render Pro plans support:
- Multiple instances
- Load balancing
- Zero-downtime deployments

## Troubleshooting

### Common Issues

#### Build Failures
1. Check build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Ensure build command is correct
4. Check for environment variable issues

#### Domain Not Resolving
1. Verify DNS propagation: `dig www.voxxypresents.com`
2. Check DNS records are correct
3. Wait for DNS propagation (can take up to 48 hours)
4. Verify domain is added in Render dashboard

#### SSL Certificate Issues
1. Ensure domain is properly configured
2. Check DNS is pointing to Render
3. Wait for certificate provisioning (usually takes a few minutes)

#### Deploy Hooks and API Failures
1. Check service logs for detailed error messages
2. Verify all environment variables are set
3. Ensure build and start commands are correct

### Deployment Rollback

To rollback a deployment:
1. Go to Render dashboard → your service
2. Click **"Deploys"** tab
3. Find the previous working deployment
4. Click **"Redeploy"** on that version

## Performance Optimization

### Next.js Configuration
- Static generation enabled
- Image optimization configured
- Automatic code splitting

### Render Features
- Global CDN (on Pro plans)
- Automatic compression
- HTTP/2 support

## Backup Strategy

### Database Backups
If you add databases later:
- Render provides automatic daily backups
- Point-in-time recovery available
- Manual backup triggers

### Code Backups
- GitHub repository serves as code backup
- Render maintains deployment history
- Consider additional backup strategies for production

## Cost Optimization

### Tips for Managing Costs
1. **Use appropriate plans**: Start with Starter, upgrade as needed
2. **Environment management**: Use free tier for development/staging if possible
3. **Monitor usage**: Check metrics regularly
4. **Optimize builds**: Cache dependencies, optimize Docker layers

### Pricing Tiers
- **Free**: Static sites, background workers
- **Starter ($7/month)**: Small web services
- **Standard ($25/month)**: Production applications
- **Pro ($85/month)**: High-traffic applications

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Next.js on Render**: https://render.com/docs/deploy-nextjs-app
- **Custom Domains**: https://render.com/docs/custom-domains
- **Render Community**: https://community.render.com

## Migration from Other Platforms

If migrating from another platform:
1. Export environment variables
2. Update DNS records
3. Test thoroughly in staging
4. Plan for DNS propagation time
5. Monitor after migration

## Security Best Practices

1. **Environment Variables**: Store secrets in Render environment variables
2. **HTTPS**: Always enabled by default
3. **Security Headers**: Configured in Next.js config
4. **Domain Security**: Use HSTS headers in production
5. **Access Control**: Limit Render dashboard access

This guide should get your Voxxy Presents application successfully deployed to Render with your custom domain!