#!/bin/bash

# Frontend Deployment Script for Digital Ocean
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production not found!${NC}"
    echo "Creating .env.production from template..."
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.production
    echo -e "${YELLOW}Please update .env.production with your actual backend URL${NC}"
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install --production

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Stop existing process if running
echo -e "${GREEN}🛑 Stopping existing process...${NC}"
pm2 stop frontend 2>/dev/null || true
pm2 delete frontend 2>/dev/null || true

# Start the application
echo -e "${GREEN}▶️  Starting application...${NC}"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Display status
echo -e "${GREEN}✅ Deployment complete!${NC}"
pm2 status

echo ""
echo -e "${GREEN}📊 View logs:${NC}"
echo "  pm2 logs frontend"
echo ""
echo -e "${GREEN}🔄 Restart app:${NC}"
echo "  pm2 restart frontend"
echo ""
echo -e "${GREEN}🌐 Your app should be running on:${NC}"
echo "  http://localhost:3000"
