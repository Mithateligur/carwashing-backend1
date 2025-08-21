import pool from '../config/database';
import { Customer, CreateCustomerRequest } from '../types';

export class CustomerService {
  static async createCustomer(tenantId: string, data: CreateCustomerRequest): Promise<Customer> {
    const { name, phone, plate } = data;
    
    const query = `
      INSERT INTO customers (tenant_id, name, phone, plate)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [tenantId, name, phone, plate];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getCustomersByTenant(tenantId: string): Promise<Customer[]> {
    const query = `
      SELECT * FROM customers 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async findById(id: string, tenantId: string): Promise<Customer | null> {
    const query = `
      SELECT * FROM customers 
      WHERE id = $1 AND tenant_id = $2
    `;
    
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  static async updateCustomer(id: string, tenantId: string, data: Partial<Customer>): Promise<Customer | null> {
    const { name, phone, plate } = data;
    
    const query = `
      UPDATE customers 
      SET name = COALESCE($1, name), 
          phone = COALESCE($2, phone), 
          plate = COALESCE($3, plate)
      WHERE id = $4 AND tenant_id = $5
      RETURNING *
    `;
    
    const values = [name, phone, plate, id, tenantId];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  static async deleteCustomer(id: string, tenantId: string): Promise<boolean> {
    const query = `
      DELETE FROM customers 
      WHERE id = $1 AND tenant_id = $2
    `;
    
    const result = await pool.query(query, [id, tenantId]);
    return (result.rowCount || 0) > 0;
  }
}
