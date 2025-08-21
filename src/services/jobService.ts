import pool from '../config/database';
import { Job, CreateCustomerRequest, UpdateJobStatusRequest } from '../types';
import { CustomerService } from './customerService';

export class JobService {
  static async createJob(tenantId: string, data: CreateCustomerRequest): Promise<Job> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create customer first
      const customer = await CustomerService.createCustomer(tenantId, data);
      
      // Create job
      const jobQuery = `
        INSERT INTO jobs (tenant_id, customer_id, service_type, price, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING *
      `;
      
      const jobValues = [tenantId, customer.id, data.service_type, data.price];
      const jobResult = await client.query(jobQuery, jobValues);
      
      await client.query('COMMIT');
      
      return jobResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getJobsByTenant(tenantId: string): Promise<Job[]> {
    const query = `
      SELECT 
        j.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.plate as car_plate,
        t.business_name,
        t.whatsapp_number
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      JOIN tenants t ON j.tenant_id = t.id
      WHERE j.tenant_id = $1
      ORDER BY j.started_at DESC
    `;
    
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async getJobById(id: string, tenantId: string): Promise<Job | null> {
    const query = `
      SELECT 
        j.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.plate as car_plate,
        t.business_name,
        t.whatsapp_number
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      JOIN tenants t ON j.tenant_id = t.id
      WHERE j.id = $1 AND j.tenant_id = $2
    `;
    
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  static async updateJobStatus(id: string, tenantId: string, data: UpdateJobStatusRequest): Promise<Job | null> {
    const { status } = data;
    
    let query = `
      UPDATE jobs 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    
    const values: any[] = [status];
    
    // If status is completed, set completed_at
    if (status === 'completed') {
      query += `, completed_at = CURRENT_TIMESTAMP`;
    }
    
    query += ` WHERE id = $${values.length + 1} AND tenant_id = $${values.length + 2} RETURNING *`;
    values.push(id, tenantId);
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updateWhatsAppStatus(id: string, tenantId: string, whatsappStatus: string): Promise<Job | null> {
    const query = `
      UPDATE jobs 
      SET whatsapp_sent = true, 
          whatsapp_status = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [whatsappStatus, id, tenantId]);
    return result.rows[0] || null;
  }

  static async getJobStats(tenantId: string): Promise<{
    total: number;
    active: number;
    ready: number;
    completed: number;
    totalRevenue: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as total_revenue
      FROM jobs 
      WHERE tenant_id = $1
    `;
    
    const result = await pool.query(query, [tenantId]);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      ready: parseInt(stats.ready),
      completed: parseInt(stats.completed),
      totalRevenue: parseFloat(stats.total_revenue)
    };
  }
}
