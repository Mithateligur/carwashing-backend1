import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { authenticateToken } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';

dotenv.config();

// HTTPS sertifikalarını yükle
const getHTTPSOptions = () => {
  try {
    const keyPath = path.join(__dirname, 'ssl', 'localhost-key.pem');
    const certPath = path.join(__dirname, 'ssl', 'localhost.pem');
    
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath)
    };
  } catch (error) {
    console.warn('⚠️ SSL sertifikaları bulunamadı, HTTP modunda çalışıyor');
    console.warn('   Sertifika yolu:', path.join(__dirname, 'ssl'));
    return null;
  }
};

const httpsOptions = getHTTPSOptions();

const server = Fastify({ 
  logger: true,
  trustProxy: true,
  https: httpsOptions // HTTPS etkinleştir
});

// CORS ayarları (HTTPS için)
server.register(cors, {
  origin: [
    'http://localhost:3001',
    'https://localhost:3001',
    'https://192.168.216.98:3001',
    /^https:\/\/.*\.local$/,
    /^https:\/\/192\.168\.\d+\.\d+:3001$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
});

// Register authentication middleware
server.decorate('authenticateToken', authenticateToken);

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(jobRoutes, { prefix: '/api/jobs' });

// Health check endpoint
server.get('/health', async () => {
  return { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    https: !!httpsOptions,
    host: process.env.HOST || '0.0.0.0',
    ssl_cert_path: path.join(__dirname, 'ssl')
  };
});

// Root endpoint with API documentation
server.get('/', async () => {
  const protocol = httpsOptions ? 'https' : 'http';
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;
  
  return {
    message: '🚗 Multi-Tenant CarWashing Service API',
    version: '2.0.0',
    https_enabled: !!httpsOptions,
    api_url: `${protocol}://${host}:${port}`,
    network_url: `${protocol}://192.168.216.98:${port}`,
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new tenant',
        'POST /api/auth/login': 'Login tenant',
        'GET /api/auth/profile': 'Get tenant profile (requires auth)'
      },
      jobs: {
        'GET /api/jobs': 'Get all jobs for tenant (requires auth)',
        'POST /api/jobs': 'Create new job (requires auth)',
        'GET /api/jobs/:id': 'Get job by ID (requires auth)',
        'PATCH /api/jobs/:id/status': 'Update job status (requires auth)',
        'POST /api/jobs/:id/whatsapp': 'Send WhatsApp message (requires auth)',
        'GET /api/jobs/stats/overview': 'Get job statistics (requires auth)'
      }
    },
    features: [
      'Multi-tenant architecture',
      'JWT authentication',
      'Tenant isolation',
      'WhatsApp deep link integration',
      'Real-time job management',
      'Statistics and reporting',
      'HTTPS/SSL support',
      'iOS PWA compatibility'
    ]
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    const protocol = httpsOptions ? 'https' : 'http';
    console.log(`🚀 CarWashing API running at ${protocol}://${host}:${port}`);
    console.log(`📱 WhatsApp Integration: READY`);
    console.log(`🔐 JWT Authentication: ENABLED`);
    console.log(`🏢 Multi-Tenant: ACTIVE`);
    console.log(`🔒 HTTPS: ${httpsOptions ? 'ENABLED' : 'DISABLED'}`);
    
    if (httpsOptions) {
      console.log(`📱 PWA Ready - iOS Safari erişimi: https://localhost:${port}`);
      console.log(`🌐 Network erişimi: https://192.168.216.98:${port}`);
      console.log(`🌐 Frontend: https://localhost:3001`);
      console.log(`🌐 Frontend Network: https://192.168.216.98:3001`);
    }
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();