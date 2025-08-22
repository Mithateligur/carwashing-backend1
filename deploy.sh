#!/bin/bash

# 🚀 CarWashing Service - AWS Deployment Script
# Usage: ./deploy.sh "commit message"

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_HOST="YOUR_EC2_IP"  # Replace with your Elastic IP
AWS_USER="ec2-user"
AWS_KEY="~/.ssh/carwashing-aws.pem"
PROJECT_PATH="/var/www/carwashing"

echo -e "${BLUE}🚀 CarWashing Service - AWS Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if commit message provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a commit message${NC}"
    echo -e "${YELLOW}Usage: ./deploy.sh \"your commit message\"${NC}"
    exit 1
fi

COMMIT_MSG="$1"

# Step 1: Local Git Operations
echo -e "\n${YELLOW}📝 Step 1: Committing changes locally...${NC}"
git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git push origin main

echo -e "${GREEN}✅ Local changes pushed to GitHub${NC}"

# Step 2: Deploy to AWS
echo -e "\n${YELLOW}🌐 Step 2: Deploying to AWS EC2...${NC}"

# Check if SSH key exists
if [ ! -f ~/.ssh/carwashing-aws.pem ]; then
    echo -e "${RED}❌ SSH key not found at ~/.ssh/carwashing-aws.pem${NC}"
    echo -e "${YELLOW}Please download your AWS key pair and place it there${NC}"
    exit 1
fi

# Deploy via SSH
ssh -i "$AWS_KEY" "$AWS_USER@$AWS_HOST" << EOF
set -e

echo "🔄 Pulling latest changes..."
cd $PROJECT_PATH
git pull origin main

echo "📦 Installing backend dependencies..."
cd backend
npm install --production
npm run build

echo "🎨 Building frontend..."
cd ../frontend  
npm install --production
npm run build

# Copy built frontend to nginx
sudo cp -r build/* /var/www/html/

echo "🔄 Restarting services..."
pm2 restart all
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Site is live at: https://$AWS_HOST"
EOF

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is live at: https://$AWS_HOST${NC}"
echo -e "${BLUE}📊 Check status: pm2 status${NC}"
echo -e "${BLUE}📋 View logs: pm2 logs${NC}"
