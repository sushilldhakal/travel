# Frontend Deployment Guide for Digital Ocean (Ubuntu 24)

## Server Requirements
- Ubuntu 24
- Node.js v20.19.6 ✅
- npm v10.8.2 ✅

## Pre-Deployment Steps

### 1. Update Production Environment Variables

Edit `frontend/.env.production` with your actual backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
# OR
NEXT_PUBLIC_BACKEND_URL=http://your-server-ip:8000
```

### 2. Rebuild with Production Environment

```bash
cd frontend
npm run build
```

## Deployment Options

### Option 1: Deploy with PM2 (Recommended)

1. **Upload the entire frontend folder to your server**

```bash
# On your local machine
tar -czf frontend-deploy.tar.gz frontend/
scp frontend-deploy.tar.gz user@your-server-ip:/home/user/
```

2. **On your Digital Ocean server**

```bash
# Extract
cd /home/user
tar -xzf frontend-deploy.tar.gz
cd frontend

# Install dependencies
npm install --production

# Install PM2 globally (if not already installed)
sudo npm install -g pm2

# Start the application
pm2 start npm --name "frontend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

3. **Configure Nginx as reverse proxy**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Static Export (if applicable)

If your app can be statically exported:

1. **Update next.config.ts**

```typescript
const nextConfig = {
  output: 'export',
  // ... other config
};
```

2. **Build and export**

```bash
npm run build
```

3. **Deploy the `out` folder to any static hosting**

### Option 3: Docker Deployment

1. **Create Dockerfile** (already in project if exists)

2. **Build and run**

```bash
docker build -t frontend-app .
docker run -p 3000:3000 frontend-app
```

## Post-Deployment

### 1. Check Application Status

```bash
pm2 status
pm2 logs frontend
```

### 2. Monitor Application

```bash
pm2 monit
```

### 3. Restart Application

```bash
pm2 restart frontend
```

### 4. Stop Application

```bash
pm2 stop frontend
```

## Environment Variables on Server

Create `.env.production` on the server:

```bash
cd /home/user/frontend
nano .env.production
```

Add:
```
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /home/user/frontend
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # If accessing directly
sudo ufw enable
```

## Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash
cd /home/user/frontend
git pull origin main  # if using git
npm install
npm run build
pm2 restart frontend
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Files to Upload

**Minimum required files:**
- `frontend/.next/` (build output)
- `frontend/node_modules/` (or run npm install on server)
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/next.config.ts`
- `frontend/public/` (static assets)
- `frontend/.env.production`

**Or upload entire frontend folder for simplicity**
