#!/bin/bash

# One-command deployment to Digital Ocean
# Usage: ./deploy-to-server.sh

set -e

SERVER="deploy@170.64.178.75"
DEPLOY_PATH="/home/deploy"

echo "🚀 Deploying to $SERVER..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if frontend-deploy.tar.gz exists
if [ ! -f "frontend-deploy.tar.gz" ]; then
    echo -e "${YELLOW}⚠️  frontend-deploy.tar.gz not found. Creating it...${NC}"
    cd frontend
    tar --exclude='node_modules' --exclude='.next/cache' -czf ../frontend-deploy.tar.gz .
    cd ..
fi

# Upload to server
echo -e "${GREEN}📤 Uploading deployment package...${NC}"
scp frontend-deploy.tar.gz $SERVER:$DEPLOY_PATH/

# Deploy on server
echo -e "${GREEN}🔧 Deploying on server...${NC}"
ssh $SERVER << 'ENDSSH'
cd /home/deploy

# Extract
echo "📦 Extracting files..."
mkdir -p frontend
tar -xzf frontend-deploy.tar.gz -C frontend/

# Deploy
cd frontend
echo "🚀 Running deployment script..."
chmod +x deploy.sh
./deploy.sh

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is running at:"
echo "   - http://170.64.178.75:3000"
echo "   - http://tourbnt.com:3000"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs frontend"
ENDSSH

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "🌐 Access your application:"
echo "   http://170.64.178.75:3000"
echo "   http://tourbnt.com:3000"
