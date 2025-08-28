import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// PWA Context Types
interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  showInstallPrompt: boolean;
  pendingMessages: WhatsAppMessage[];
  updateAvailable: boolean;
  installPWA: () => Promise<void>;
  dismissInstall: () => void;
  updateApp: () => void;
  queueWhatsAppMessage: (phone: string, message: string, plateNumber: string) => Promise<WhatsAppMessage>;
}

interface WhatsAppMessage {
  id: number;
  phone: string;
  message: string;
  plateNumber: string;
  timestamp: string;
  status: 'sending' | 'queued' | 'sent' | 'failed';
}

interface PWAProviderProps {
  children: ReactNode;
}

// PWA Context
const PWAContext = createContext<PWAContextType | null>(null);

// Main PWA Provider Component
export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<WhatsAppMessage[]>([]);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Connection status listeners
    const handleOnline = () => {
      setIsOnline(true);
      // Process pending messages when back online
      processPendingMessages();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Auto-show after delay if not dismissed recently
      const dismissed = localStorage.getItem('pwaInstallDismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => {
          if (!isInstalled) {
            setShowInstallPrompt(true);
          }
        }, 30000); // Show after 30 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed listener
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      console.log('PWA installed successfully');
    });

    // Service Worker registration and update check
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
          
          // Auto-check for updates every hour
          setInterval(() => {
            registration.update();
          }, 3600000);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        console.log('PWA installed successfully');
        
        // Track installation (if analytics available)
        if ((window as any).gtag) {
          (window as any).gtag('event', 'pwa_install', {
            'event_category': 'engagement',
            'event_label': 'accepted'
          });
        }
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    }
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    }
  };

  const queueWhatsAppMessage = async (phone: string, message: string, plateNumber: string): Promise<WhatsAppMessage> => {
    const messageData: WhatsAppMessage = {
      id: Date.now(),
      phone,
      message,
      plateNumber,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'sending' : 'queued'
    };

    if (isOnline) {
      // Send immediately
      try {
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        messageData.status = 'sent';
      } catch (error) {
        messageData.status = 'failed';
        console.error('Failed to open WhatsApp:', error);
      }
    } else {
      // Queue for later
      setPendingMessages(prev => [...prev, messageData]);
      
      // Store in Service Worker for persistence
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'queueWhatsApp',
          message: messageData
        });
      }
    }

    return messageData;
  };

  const processPendingMessages = useCallback(async () => {
    if (pendingMessages.length > 0 && isOnline) {
      for (const message of pendingMessages) {
        try {
          const whatsappUrl = `https://wa.me/${message.phone}?text=${encodeURIComponent(message.message)}`;
          window.open(whatsappUrl, '_blank');
          
          // Remove from pending
          setPendingMessages(prev => prev.filter(m => m.id !== message.id));
        } catch (error) {
          console.error('Failed to send pending message:', error);
        }
      }
    }
  }, [pendingMessages, isOnline]);

  const value: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    isIOS,
    showInstallPrompt,
    pendingMessages,
    updateAvailable,
    installPWA,
    dismissInstall,
    updateApp,
    queueWhatsAppMessage
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

// Custom hook to use PWA context
export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};
