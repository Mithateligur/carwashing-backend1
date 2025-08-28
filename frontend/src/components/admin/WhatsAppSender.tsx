import React, { useState } from 'react';
import { Job } from '../../types';

interface WhatsAppSenderProps {
  job: Job;
  onSend: (jobId: string, message?: string) => Promise<void>;
  onClose: () => void;
}

export function WhatsAppSender({ job, onSend, onClose }: WhatsAppSenderProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultMessages = {
    ready: `Merhaba ${job.customer_name}! 🚗\n\nAracınız ${job.car_plate} plakası ile hazır durumda.\n\n📍 ${job.business_name}\n💰 Ücret: ${job.price}₺\n\nAracınızı teslim alabilirsiniz. Teşekkürler! 🎉`,
    completed: `Merhaba ${job.customer_name}! ✅\n\nAracınız ${job.car_plate} plakası ile başarıyla tamamlandı.\n\n📍 ${job.business_name}\n💰 Ücret: ${job.price}₺\n\nAracınızı teslim alabilirsiniz. İyi günler! 🚗✨`,
    reminder: `Merhaba ${job.customer_name}! ⏰\n\nAracınız ${job.car_plate} plakası ile işlemde.\n\nTahmini süre: ${job.service_type === 'Temel Yıkama' ? '30 dakika' : job.service_type === 'Premium Yıkama' ? '60 dakika' : '120 dakika'}\n\nHazır olduğunda size haber vereceğiz. Teşekkürler! 🚗`
  };

  const handleSend = async (template?: keyof typeof defaultMessages) => {
    setLoading(true);
    try {
      const messageToSend = template ? defaultMessages[template] : message;
      await onSend(job.id, messageToSend);
      onClose();
    } catch (error) {
      console.error('WhatsApp send error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">WhatsApp Mesajı Gönder</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Job Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">İş Detayları</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Müşteri:</span> {job.customer_name}</p>
            <p><span className="font-medium">Telefon:</span> {job.customer_phone}</p>
            <p><span className="font-medium">Plaka:</span> {job.car_plate}</p>
            <p><span className="font-medium">Servis:</span> {job.service_type}</p>
            <p><span className="font-medium">Ücret:</span> {job.price}₺</p>
          </div>
        </div>

        {/* Message Templates */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Hazır Mesajlar</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleSend('ready')}
              disabled={loading}
              className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-green-800">🚗 Araç Hazır</div>
              <div className="text-sm text-green-600">Aracın hazır olduğunu bildir</div>
            </button>
            
            <button
              onClick={() => handleSend('completed')}
              disabled={loading}
              className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-blue-800">✅ İş Tamamlandı</div>
              <div className="text-sm text-blue-600">İşin tamamlandığını bildir</div>
            </button>
            
            <button
              onClick={() => handleSend('reminder')}
              disabled={loading}
              className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-yellow-800">⏰ Hatırlatma</div>
              <div className="text-sm text-yellow-600">İşlem durumu hakkında bilgi ver</div>
            </button>
          </div>
        </div>

        {/* Custom Message */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Özel Mesaj</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Özel mesajınızı yazın..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => handleSend()}
            disabled={loading || !message.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}
