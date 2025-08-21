import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';

dotenv.config();

const server = Fastify({ 
  logger: true,
  trustProxy: true
});

// Register CORS
server.register(cors, {
  origin: true,
  credentials: true
});

// Register authentication middleware
server.decorate('authenticateToken', authenticateToken);

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(jobRoutes, { prefix: '/api/jobs' });

// Health check endpoint
server.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Root endpoint with API documentation
server.get('/', async () => {
  return {
    message: '🚗 Multi-Tenant CarWashing Service API',
    version: '2.0.0',
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
      'Statistics and reporting'
    ]
  };
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port: parseInt(port.toString()), host });
    
    console.log(`🚀 Multi-Tenant CarWashing Service running at http://localhost:${port}`);
    console.log(`📱 WhatsApp Integration: READY`);
    console.log(`🔐 JWT Authentication: ENABLED`);
    console.log(`🏢 Multi-Tenant: ACTIVE`);
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
