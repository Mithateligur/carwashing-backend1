export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface User {
  id: string;
  business_name: string;
  owner_name: string;
  whatsapp_number: string;
  email: string;
  created_at: string;
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

export interface Statistics {
  daily: {
    revenue: number;
    completed_jobs: number;
    active_jobs: number;
    avg_duration: number;
  };
  weekly: {
    revenue: number;
    completed_jobs: number;
    chart_data: { day: string; revenue: number; jobs: number }[];
  };
  monthly: {
    revenue: number;
    completed_jobs: number;
    chart_data: { week: string; revenue: number; jobs: number }[];
  };
}

export interface Booking {
  id: number;
  service_id: number;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  car_model?: string;
  car_plate?: string;
  total_price?: number;
  notes?: string;
}
