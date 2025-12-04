# Deploy to Your Digital Ocean Server

## 🎯 Server Details
- **IP**: 170.64.178.75
- **User**: deploy
- **Domain**: tourbnt.com
- **Backend**: http://tourbnt.com:8000 ✅ (Already running)
- **Frontend Port**: 3000

## 🚀 Quick Deployment (3 Commands)

### Step 1: Upload the Build
```bash
scp frontend-deploy.tar.gz deploy@170.64.178.75:/home/deploy/
```

### Step 2: SSH into Server
```bash
ssh deploy@170.64.178.75
```

### Step 3: Deploy
```bash
cd /home/deploy
tar -xzf frontend-deploy.tar.gz
cd frontend
./deploy.sh
```

**Done!** Your frontend will be running on port 3000.

## 🌐 Access Your Application

After deployment:
- **Direct Access**: http://170.64.178.75:3000
- **With Domain**: http://tourbnt.com (after Nginx setup)

## 📋 Detailed Steps

### 1. Upload Deployment Package

From your local machine:
```bash
# Upload the tar.gz file
scp frontend-deploy.tar.gz deploy@170.64.178.75:/home/deploy/

# Or upload via Git (if you prefer)
ssh deploy@170.64.178.75
cd /home/deploy
git clone https://github.com/sushilldhakal/travel.git
cd travel/frontend
```

### 2. Extract and Setup

On the server:
```bash
cd /home/deploy
tar -xzf frontend-deploy.tar.gz
cd frontend

# The deploy.sh script will:
# - Install dependencies
# - Install PM2 (if needed)
# - Start the application
# - Configure auto-restart
./deploy.sh
```

### 3. Verify Deployment

```bash
# Check if app is running
pm2 status

# View logs
pm2 logs frontend

# Test the application
curl http://localhost:3000
```

## 🔧 Configure Nginx (Recommended)

Since your backend is already on tourbnt.com:8000, let's setup the frontend on the main domain:

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/frontend
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name tourbnt.com www.tourbnt.com;

    # Frontend on root
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (keep existing)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Setup SSL (Optional but Recommended)

```bash
# Install Certbot (if not installed)
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d tourbnt.com -d www.tourbnt.com

# Auto-renewal is configured automatically
```

## 🔥 Firewall Configuration

```bash
# Allow necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw status
```

## 📊 Useful Commands

### PM2 Management
```bash
pm2 status              # Check status
pm2 logs frontend       # View logs
pm2 restart frontend    # Restart app
pm2 stop frontend       # Stop app
pm2 delete frontend     # Remove from PM2
pm2 monit              # Monitor resources
```

### Check Services
```bash
# Check if frontend is running
curl http://localhost:3000

# Check if backend is running
curl http://localhost:8000

# Check Nginx status
sudo systemctl status nginx
```

### View Logs
```bash
# Frontend logs
pm2 logs frontend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Update/Redeploy

When you need to update:

```bash
# On your local machine
cd frontend
npm run build
tar --exclude='node_modules' -czf ../frontend-deploy.tar.gz .
scp ../frontend-deploy.tar.gz deploy@170.64.178.75:/home/deploy/

# On server
ssh deploy@170.64.178.75
cd /home/deploy/frontend
tar -xzf ../frontend-deploy.tar.gz
npm install --production
pm2 restart frontend
```

## 🆘 Troubleshooting

### Frontend not accessible?
```bash
# Check if running
pm2 status

# Check logs for errors
pm2 logs frontend --lines 50

# Restart
pm2 restart frontend
```

### Port 3000 already in use?
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart frontend
```

### Backend connection issues?
```bash
# Test backend from server
curl http://localhost:8000

# Check environment variable
cat .env.production
# Should show: NEXT_PUBLIC_BACKEND_URL=http://tourbnt.com:8000
```

### Nginx issues?
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

## ✅ Post-Deployment Checklist

- [ ] Frontend running on port 3000
- [ ] Backend accessible at tourbnt.com:8000
- [ ] PM2 managing the process
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Firewall rules configured
- [ ] Application accessible via domain

## 🎉 Success!

Your application should now be live at:
- **Frontend**: http://tourbnt.com (with Nginx) or http://170.64.178.75:3000
- **Backend**: http://tourbnt.com:8000

## 📞 Quick Reference

```bash
# SSH to server
ssh deploy@170.64.178.75

# Check frontend status
pm2 status frontend

# View frontend logs
pm2 logs frontend

# Restart frontend
pm2 restart frontend

# Check Nginx
sudo systemctl status nginx
```

Happy deploying! 🚀
