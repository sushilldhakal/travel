# Quick Deployment Guide

## 📦 What's Ready

Your frontend is built and ready to deploy! Here's what you have:

- ✅ **Build completed successfully** (40 pages)
- ✅ **Deployment package created**: `frontend-deploy.tar.gz` (155MB)
- ✅ **PM2 configuration**: `frontend/ecosystem.config.js`
- ✅ **Deployment script**: `frontend/deploy.sh`

## 🚀 Quick Deploy Steps

### Step 1: Update Backend URL

Before deploying, update the backend URL in `frontend/.env.production`:

```bash
# Edit this file
nano frontend/.env.production

# Change to your actual backend URL
NEXT_PUBLIC_BACKEND_URL=http://your-server-ip:8000
# OR
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

### Step 2: Rebuild (if you changed .env.production)

```bash
cd frontend
npm run build
```

### Step 3: Upload to Digital Ocean

**Option A: Using SCP**
```bash
# From your local machine
scp frontend-deploy.tar.gz root@your-server-ip:/root/
```

**Option B: Using Git**
```bash
# Push to GitHub first
git add .
git commit -m "Production build ready"
git push origin main

# Then on your server
git clone your-repo-url
cd your-repo/frontend
```

### Step 4: Deploy on Server

```bash
# SSH into your server
ssh root@your-server-ip

# If using tar.gz
tar -xzf frontend-deploy.tar.gz
cd frontend

# Run deployment script
./deploy.sh
```

That's it! Your app will be running on `http://your-server-ip:3000`

## 🔧 Server Requirements Check

Your server specs are perfect:
- ✅ Ubuntu 24
- ✅ Node.js v20.19.6
- ✅ npm v10.8.2

## 📝 Important Notes

1. **Environment Variables**: Make sure to set `NEXT_PUBLIC_BACKEND_URL` correctly
2. **Firewall**: Open port 3000 or use Nginx reverse proxy
3. **PM2**: The deploy script will install PM2 automatically
4. **Logs**: Check logs with `pm2 logs frontend`

## 🌐 Setup Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/frontend

# Add this configuration:
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

# Enable site
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🆘 Troubleshooting

### App not starting?
```bash
pm2 logs frontend --lines 50
```

### Port already in use?
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Need to restart?
```bash
pm2 restart frontend
```

## 📊 Useful PM2 Commands

```bash
pm2 status              # Check status
pm2 logs frontend       # View logs
pm2 restart frontend    # Restart app
pm2 stop frontend       # Stop app
pm2 delete frontend     # Remove from PM2
pm2 monit              # Monitor resources
```

## 🎯 Next Steps

1. Upload `frontend-deploy.tar.gz` to your server
2. Extract and run `./deploy.sh`
3. Configure Nginx (optional)
4. Setup SSL certificate (optional)
5. Test your application!

Your frontend is production-ready! 🎉
