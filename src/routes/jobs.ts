import { FastifyInstance } from 'fastify';
import { JobService } from '../services/jobService';
import { WhatsAppService } from '../services/whatsappService';
import { CreateCustomerRequest, UpdateJobStatusRequest, WhatsAppMessageRequest } from '../types';

export async function jobRoutes(fastify: FastifyInstance) {
  // Get all jobs for current tenant
  fastify.get('/', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const jobs = await JobService.getJobsByTenant(user.tenant_id);
      
      return reply.send({ jobs });
    } catch (error) {
      console.error('Get jobs error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create new job (customer + job)
  fastify.post('/', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const data = request.body as CreateCustomerRequest;
      
      // Validate required fields
      if (!data.name || !data.phone || !data.plate || !data.service_type || !data.price) {
        return reply.status(400).send({ error: 'All fields are required' });
      }
      
      const job = await JobService.createJob(user.tenant_id, data);
      
      return reply.status(201).send({
        message: 'Job created successfully',
        job
      });
    } catch (error) {
      console.error('Create job error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get job by ID
  fastify.get('/:id', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const { id } = request.params as any;
      
      const job = await JobService.getJobById(id, user.tenant_id);
      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }
      
      return reply.send({ job });
    } catch (error) {
      console.error('Get job error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update job status
  fastify.patch('/:id/status', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const { id } = request.params as any;
      const data = request.body as UpdateJobStatusRequest;
      
      const job = await JobService.updateJobStatus(id, user.tenant_id, data);
      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }
      
      return reply.send({
        message: 'Job status updated successfully',
        job
      });
    } catch (error) {
      console.error('Update job status error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Send WhatsApp message
  fastify.post('/:id/whatsapp', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const { id } = request.params as any;
      const { message } = request.body as WhatsAppMessageRequest;
      
      const job = await JobService.getJobById(id, user.tenant_id);
      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }
      
      // Generate WhatsApp link
      const whatsappUrl = WhatsAppService.generateWhatsAppLink(job, message);
      
      // Update WhatsApp status
      await JobService.updateWhatsAppStatus(id, user.tenant_id, 'sent');
      
      return reply.send({
        message: 'WhatsApp link generated successfully',
        whatsappUrl,
        job: await JobService.getJobById(id, user.tenant_id)
      });
    } catch (error) {
      console.error('WhatsApp error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get job statistics
  fastify.get('/stats/overview', {
    preHandler: [fastify.authenticateToken]
  }, async (request, reply) => {
    try {
      const { user } = request as any;
      const stats = await JobService.getJobStats(user.tenant_id);
      
      return reply.send({ stats });
    } catch (error) {
      console.error('Get stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
