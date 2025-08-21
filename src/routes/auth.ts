import { FastifyInstance } from 'fastify';
import { TenantService } from '../services/tenantService';
import { generateToken } from '../middleware/auth';
import { RegisterRequest, AuthRequest } from '../types';

export async function authRoutes(fastify: FastifyInstance) {
  // Register new tenant
  fastify.post('/register', async (request, reply) => {
    try {
      const data = request.body as RegisterRequest;
      
      // Validate required fields
      if (!data.business_name || !data.owner_name || !data.whatsapp_number || !data.email || !data.password) {
        return reply.status(400).send({ error: 'All fields are required' });
      }
      
      // Check if email already exists
      const existingTenant = await TenantService.findByEmail(data.email);
      if (existingTenant) {
        return reply.status(409).send({ error: 'Email already registered' });
      }
      
      // Create new tenant
      const tenant = await TenantService.createTenant(data);
      
      // Generate JWT token
      const token = generateToken({
        tenant_id: tenant.id,
        email: tenant.email,
        business_name: tenant.business_name
      });
      
      return reply.status(201).send({
        message: 'Tenant registered successfully',
        tenant: {
          id: tenant.id,
          business_name: tenant.business_name,
          owner_name: tenant.owner_name,
          whatsapp_number: tenant.whatsapp_number,
          email: tenant.email
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Login tenant
  fastify.post('/login', async (request, reply) => {
    try {
      const data = request.body as AuthRequest;
      
      // Validate required fields
      if (!data.email || !data.password) {
        return reply.status(400).send({ error: 'Email and password are required' });
      }
      
      // Authenticate tenant
      const tenant = await TenantService.authenticate(data);
      if (!tenant) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = generateToken({
        tenant_id: tenant.id,
        email: tenant.email,
        business_name: tenant.business_name
      });
      
      return reply.send({
        message: 'Login successful',
        tenant: {
          id: tenant.id,
          business_name: tenant.business_name,
          owner_name: tenant.owner_name,
          whatsapp_number: tenant.whatsapp_number,
          email: tenant.email
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get current tenant profile
  fastify.get('/profile', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      
      const tenant = await TenantService.findById(user.tenant_id);
      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant not found' });
      }
      
      return reply.send({
        tenant: {
          id: tenant.id,
          business_name: tenant.business_name,
          owner_name: tenant.owner_name,
          whatsapp_number: tenant.whatsapp_number,
          email: tenant.email,
          created_at: tenant.created_at
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
