import { Job } from '../types';

export class WhatsAppService {
  static generateWhatsAppLink(job: Job, customMessage?: string): string {
    const { customer_name, car_plate, business_name, customer_phone, whatsapp_number, service_type, price } = job;
    
    // Default message template
    const defaultMessage = `Merhaba ${customer_name}! 🚗\n\nAracınız ${car_plate} plakası ile hazır durumda.\n\n📍 ${business_name}\n💰 Ücret: ${price}₺\n\nAracınızı teslim alabilirsiniz. Teşekkürler! 🎉`;
    
    // Use custom message if provided, otherwise use default
    const message = customMessage || defaultMessage;
    
    // FIXED: Use customer's phone number for WhatsApp deep link, NOT business number
    let formattedPhone = (customer_phone || '').replace(/[^\d]/g, ''); // Remove all non-digits
    
    // If it doesn't start with 90, add it
    if (!formattedPhone.startsWith('90')) {
      formattedPhone = '90' + formattedPhone;
    }
    
    // Ensure it's exactly 12 digits (90 + 10 digits)
    if (formattedPhone.length !== 12) {
      console.warn(`Invalid customer phone number format: ${customer_phone}, formatted: ${formattedPhone}`);
    }
    
    // Create WhatsApp deep link - try multiple formats for better compatibility
    const encodedMessage = encodeURIComponent(message);
    
    // Format 1: Standard wa.me (most common)
    // const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Format 2: Alternative format (if needed)
    // const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Format 3: Web WhatsApp (fallback) - Better for desktop
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    console.log(`📱 WhatsApp URL generated: Business ${business_name} (${whatsapp_number}) sending message TO customer ${customer_name} (${formattedPhone}): ${whatsappUrl}`);
    
    return whatsappUrl;
  }

  static generateStatusMessage(job: Job, status: 'ready' | 'completed'): string {
    const { customer_name, car_plate, business_name, service_type, price } = job;
    
    switch (status) {
      case 'ready':
        return `Merhaba ${customer_name}! 🚗\n\nAracınız ${car_plate} plakası ile hazır durumda.\n\n📍 ${business_name}\n💰 Ücret: ${price}₺\n\nAracınızı teslim alabilirsiniz. Teşekkürler! 🎉`;
      
      case 'completed':
        return `Merhaba ${customer_name}! ✅\n\nAracınız ${car_plate} plakası ile başarıyla tamamlandı.\n\n📍 ${business_name}\n💰 Ücret: ${price}₺\n\nAracınızı teslim alabilirsiniz. İyi günler! 🚗✨`;
      
      default:
        return `Merhaba ${customer_name}! ⏰\n\nAracınız ${car_plate} plakası ile işlemde.\n\nTahmini süre: ${service_type === 'Temel Yıkama' ? '30 dakika' : service_type === 'Premium Yıkama' ? '60 dakika' : '120 dakika'}\n\nHazır olduğunda size haber vereceğiz. Teşekkürler! 🚗`;
    }
  }

  static openWhatsApp(job: Job, customMessage?: string): void {
    const whatsappUrl = this.generateWhatsAppLink(job, customMessage);
    
    // For server-side, return the URL
    // For client-side, this would open the URL
    console.log(`📱 WhatsApp URL generated: ${whatsappUrl}`);
    
    // In a real implementation, you might want to:
    // 1. Log the WhatsApp attempt
    // 2. Update the job status
    // 3. Return the URL for the frontend to open
  }
}
