import React, { useState, useEffect } from 'react';
import { usePWA } from './PWAProvider';

// Connection Status Indicator Component
export const ConnectionStatus: React.FC = () => {
  const { isOnline } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show briefly when status changes
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [isOnline]);

  if (!show && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-300 ${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    } ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {isOnline ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <span>Çevrimiçi</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
          </svg>
          <span>Çevrimdışı</span>
        </>
      )}
    </div>
  );
};

// Install Prompt Component
export const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, isIOS, installPWA, dismissInstall } = usePWA();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!showInstallPrompt) return null;

  const handleInstall = () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      installPWA();
    }
  };

  return (
    <>
      {/* Main Install Prompt */}
      <div className={`fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 transition-all duration-300 ${
        showInstallPrompt ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              CarWashing Admin'i Yükle
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Uygulamayı ana ekranınıza ekleyin ve çevrimdışı erişim kazanın!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={dismissInstall}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Daha Sonra
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isIOS ? 'Nasıl Yüklenir?' : 'Yükle'}
              </button>
            </div>
          </div>
          
          <button
            onClick={dismissInstall}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Install Instructions */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">iOS'ta Nasıl Yüklenir?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-gray-700">Safari'de alttaki <strong>Paylaş</strong> butonuna dokunun</p>
                    <div className="mt-2 text-blue-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                    2
                  </div>
                  <p className="text-gray-700">"<strong>Ana Ekrana Ekle</strong>" seçeneğini bulun ve dokunun</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                    3
                  </div>
                  <p className="text-gray-700">Sağ üst köşedeki "<strong>Ekle</strong>" butonuna dokunun</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  dismissInstall();
                }}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Update Available Component
export const UpdateAvailable: React.FC = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Güncelleme Mevcut</h4>
          <p className="text-blue-100 text-sm">Yeni özellikler ve iyileştirmeler hazır!</p>
        </div>
        <button
          onClick={updateApp}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Güncelle
        </button>
      </div>
    </div>
  );
};

// Enhanced WhatsApp Button with offline support
interface WhatsAppButtonProps {
  customer: {
    name: string;
    phone: string;
    plateNumber: string;
  };
  jobType?: string;
  amount?: number;
  onMessageSent?: () => void;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  customer,
  jobType = 'Araç Yıkama',
  amount = 0,
  onMessageSent,
  className = ''
}) => {
  const { queueWhatsAppMessage, isOnline } = usePWA();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    setIsSending(true);
    
    try {
      const message = `Merhaba ${customer.name}! 🚗

Aracınız ${customer.plateNumber} plakası ile hazır durumda.

📋 Hizmet: ${jobType}
💰 Ücret: ${amount}₺

Aracınızı teslim alabilirsiniz. Teşekkürler! 🎉`;

      await queueWhatsAppMessage(customer.phone, message, customer.plateNumber);
      onMessageSent?.();
    } catch (error) {
      console.error('WhatsApp message failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSendMessage}
      disabled={isSending}
      className={`${className} flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
    >
      {isSending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
          </svg>
          <span>{isOnline ? 'Gönderiliyor...' : 'Kuyruğa alınıyor...'}</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>WhatsApp</span>
          {!isOnline && (
            <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
              Offline
            </span>
          )}
        </>
      )}
    </button>
  );
};
