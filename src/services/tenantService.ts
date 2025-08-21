import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { Tenant, RegisterRequest, AuthRequest } from '../types';

export class TenantService {
  static async createTenant(data: RegisterRequest): Promise<Tenant> {
    const { business_name, owner_name, whatsapp_number, email, password } = data;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO tenants (business_name, owner_name, whatsapp_number, email, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, business_name, owner_name, whatsapp_number, email, created_at, updated_at
    `;
    
    const values = [business_name, owner_name, whatsapp_number, email, password_hash];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<Tenant & { password_hash: string } | null> {
    const query = `
      SELECT id, business_name, owner_name, whatsapp_number, email, password_hash, created_at, updated_at
      FROM tenants WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Tenant | null> {
    const query = `
      SELECT id, business_name, owner_name, whatsapp_number, email, created_at, updated_at
      FROM tenants WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async authenticate(data: AuthRequest): Promise<Tenant | null> {
    const tenant = await this.findByEmail(data.email);
    if (!tenant) return null;
    
    const isValidPassword = await bcrypt.compare(data.password, tenant.password_hash);
    if (!isValidPassword) return null;
    
    // Return tenant without password_hash
    const { password_hash, ...tenantWithoutPassword } = tenant;
    return tenantWithoutPassword;
  }
}
