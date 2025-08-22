module.exports = {
  apps: [
    {
      name: 'carwashing-backend',
      script: './dist/server.js',
      cwd: '/var/www/carwashing/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        
        // Database Configuration
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'carwashing_service',
        DB_USER: 'carwashing_user',
        DB_PASSWORD: 'secure_password_2024',
        
        // JWT Security
        JWT_SECRET: 'super-secure-jwt-secret-production-change-this-2024',
        
        // HTTPS Configuration (Production)
        HTTPS_ENABLED: 'true',
        SSL_CERT_PATH: '/etc/letsencrypt/live/your-domain.com/fullchain.pem',
        SSL_KEY_PATH: '/etc/letsencrypt/live/your-domain.com/privkey.pem'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        JWT_SECRET: 'dev-jwt-secret'
      }
    }
  ],

  deploy: {
    production: {
      user: 'ec2-user',
      host: 'YOUR_EC2_IP',
      ref: 'origin/main',
      repo: 'https://github.com/YOUR_USERNAME/carwashing-project.git',
      path: '/var/www/carwashing',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install --production && npm run build && cd ../frontend && npm install --production && npm run build && sudo cp -r build/* /var/www/html/ && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    }
  }
};
