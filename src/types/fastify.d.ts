import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';

declare module 'fastify' {
  interface FastifyInstance {
    authenticateToken: typeof authenticateToken;
  }
}
