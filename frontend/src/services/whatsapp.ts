import api from './api';

export interface WhatsAppMessage {
  jobId: number;
  message: string;
  phoneNumber: string;
  customerName: string;
}

export const sendWhatsAppMessage = async (data: WhatsAppMessage) => {
  try {
    const response = await api.post('/admin/whatsapp/send', {
      jobId: data.jobId,
      message: data.message,
      phoneNumber: data.phoneNumber,
      customerName: data.customerName
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    throw error;
  }
};

export const getWhatsAppStatus = async () => {
  try {
    const response = await api.get('/admin/whatsapp/status');
    return response.data;
  } catch (error) {
    console.error('WhatsApp status error:', error);
    throw error;
  }
};

export const testWhatsAppConnection = async () => {
  try {
    const response = await api.post('/admin/whatsapp/test');
    return response.data;
  } catch (error) {
    console.error('WhatsApp test error:', error);
    throw error;
  }
};
