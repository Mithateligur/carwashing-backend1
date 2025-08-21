export interface Tenant {
  id: string;
  business_name: string;
  owner_name: string;
  whatsapp_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  plate: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  tenant_id: string;
  customer_id: string;
  service_type: string;
  price: number;
  status: 'active' | 'ready' | 'completed';
  started_at: string;
  completed_at?: string;
  whatsapp_sent: boolean;
  whatsapp_status: 'pending' | 'sent' | 'failed';
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_phone?: string;
  car_plate?: string;
  business_name?: string;
  whatsapp_number?: string;
}

export interface JobWithCustomer extends Job {
  customer: Customer;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  business_name: string;
  owner_name: string;
  whatsapp_number: string;
  email: string;
  password: string;
}

export interface JWTPayload {
  tenant_id: string;
  email: string;
  business_name: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  plate: string;
  service_type: string;
  price: number;
}

export interface UpdateJobStatusRequest {
  status: 'active' | 'ready' | 'completed';
}

export interface WhatsAppMessageRequest {
  job_id: string;
  message?: string;
}
