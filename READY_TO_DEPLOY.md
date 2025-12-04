# 🎯 Ready to Deploy to Your Server!

## ✅ Everything is Configured

- **Server IP**: 170.64.178.75
- **User**: deploy
- **Domain**: tourbnt.com
- **Backend**: http://tourbnt.com:8000 ✅ (Running)
- **Frontend Port**: 3000
- **Build**: ✅ Complete with correct backend URL

## 🚀 Deploy Now (Choose One Method)

### Method 1: One-Command Deploy (Easiest!)

```bash
./deploy-to-server.sh
```

That's it! The script will:
1. Upload the build to your server
2. Extract files
3. Install dependencies
4. Start the application with PM2
5. Configure auto-restart

### Method 2: Manual Deploy (3 Steps)

```bash
# 1. Upload
scp frontend-deploy.tar.gz deploy@170.64.178.75:/home/deploy/

# 2. SSH to server
ssh deploy@170.64.178.75

# 3. Deploy
cd /home/deploy
tar -xzf frontend-deploy.tar.gz
cd frontend
./deploy.sh
```

## 🌐 After Deployment

Your app will be accessible at:
- **Direct**: http://170.64.178.75:3000
- **Domain**: http://tourbnt.com:3000

## 📋 What Happens During Deployment

1. ✅ Uploads 155MB deployment package
2. ✅ Extracts files on server
3. ✅ Installs Node.js dependencies
4. ✅ Installs PM2 (if not present)
5. ✅ Starts frontend application
6. ✅ Configures auto-restart on crash
7. ✅ Saves PM2 configuration

## 🔧 Optional: Setup Nginx

To serve your frontend on the main domain (http://tourbnt.com):

```bash
ssh deploy@170.64.178.75
sudo nano /etc/nginx/sites-available/frontend
```

Copy the configuration from `nginx.conf.example` and:

```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Optional: Add SSL Certificate

```bash
ssh deploy@170.64.178.75
sudo certbot --nginx -d tourbnt.com -d www.tourbnt.com
```

## 📊 Verify Deployment

After deployment, check:

```bash
ssh deploy@170.64.178.75

# Check if running
pm2 status

# View logs
pm2 logs frontend

# Test locally
curl http://localhost:3000
```

## 🎉 You're Ready!

Everything is configured and ready to deploy. Just run:

```bash
./deploy-to-server.sh
```

Or follow the manual steps in `DEPLOY_TO_SERVER.md`

## 📚 Documentation

- **Quick Deploy**: This file
- **Detailed Guide**: `DEPLOY_TO_SERVER.md`
- **Nginx Config**: `nginx.conf.example`
- **Troubleshooting**: See `DEPLOY_TO_SERVER.md`

## 🆘 Need Help?

Check the logs:
```bash
ssh deploy@170.64.178.75
pm2 logs frontend
```

Restart the app:
```bash
ssh deploy@170.64.178.75
pm2 restart frontend
```

Good luck! 🚀
