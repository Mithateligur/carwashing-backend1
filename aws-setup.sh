#!/bin/bash

# 🚀 CarWashing Service - AWS EC2 Server Setup
# Run this script on your AWS EC2 instance after SSH connection

set -e

echo "🚀 CarWashing Service - AWS EC2 Setup"
echo "======================================"

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo yum install -y git

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
sudo yum install -y postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install PM2 (Process Manager)
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install SSL/TLS certificate tool
echo "🔒 Installing Certbot for SSL..."
sudo yum install -y certbot python3-certbot-nginx

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www
sudo chown -R ec2-user:ec2-user /var/www

# Clone project (you'll need to update this URL)
echo "📥 Cloning project repository..."
cd /var/www
git clone https://github.com/YOUR_USERNAME/carwashing-project.git carwashing
cd carwashing

# Setup PostgreSQL database
echo "🗄️ Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE carwashing_service;
CREATE USER carwashing_user WITH PASSWORD 'secure_password_2024';
GRANT ALL PRIVILEGES ON DATABASE carwashing_service TO carwashing_user;
\q
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Install frontend dependencies and build
echo "🎨 Building frontend..."
cd ../frontend
npm install --production
npm run build

# Copy frontend build to nginx
sudo cp -r build/* /var/www/html/

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > /var/www/carwashing/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'carwashing-backend',
      script: './backend/dist/server.js',
      cwd: '/var/www/carwashing',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'carwashing_service',
        DB_USER: 'carwashing_user',
        DB_PASSWORD: 'secure_password_2024',
        JWT_SECRET: 'super-secure-jwt-secret-production-2024'
      }
    }
  ]
};
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/conf.d/carwashing.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend (React app)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # Backend API
    location /api/ {
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
}
EOF

# Test Nginx configuration
sudo nginx -t

# Start PM2 and save configuration
echo "🚀 Starting application with PM2..."
cd /var/www/carwashing
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Reload Nginx
sudo systemctl reload nginx

# Create firewall rules (if needed)
echo "🔥 Configuring firewall..."
sudo systemctl enable firewalld || true
sudo systemctl start firewalld || true
sudo firewall-cmd --permanent --add-service=http || true
sudo firewall-cmd --permanent --add-service=https || true
sudo firewall-cmd --permanent --add-port=3000/tcp || true
sudo firewall-cmd --reload || true

echo ""
echo "🎉 ========================================="
echo "🎉 AWS EC2 Setup completed successfully!"
echo "🎉 ========================================="
echo ""
echo "📋 Next steps:"
echo "1. Update your domain's A record to point to this server's IP"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Test your application at: http://$(curl -s ifconfig.me)"
echo ""
echo "📊 Useful commands:"
echo "   pm2 status       - Check application status"
echo "   pm2 logs         - View application logs"
echo "   pm2 restart all  - Restart application"
echo "   sudo nginx -t    - Test Nginx configuration"
echo ""
echo "🔒 To enable HTTPS:"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
