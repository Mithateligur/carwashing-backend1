import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Types
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  business_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff';
  created_at: string;
  last_login?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  plate: string;
  created_at: string;
}

interface Job {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  car_plate: string;
  service_name: string;
  service_price: number;
  status: 'in_progress' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  whatsapp_sent?: boolean;
  whatsapp_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  drop_off_time?: string;
  estimated_duration?: number; // dakika
}

interface Statistics {
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

interface Booking {
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

// Toast notification component
function Toast({ message, type, show, onClose }: { 
  message: string; 
  type: 'success' | 'error'; 
  show: boolean; 
  onClose: () => void; 
}) {
  if (!show || !message) return null;

  const getIcon = () => {
    if (type === 'success') {
      return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transform transition-all duration-500 ${
      show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`glass border rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-md ${
        type === 'success' 
          ? 'bg-green-50/90 border-green-200/50' 
          : 'bg-red-50/90 border-red-200/50'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-1 rounded-lg ${
            type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-lg transition-colors duration-200 ${
              type === 'success' 
                ? 'text-green-400 hover:text-green-600 hover:bg-green-100' 
                : 'text-red-400 hover:text-red-600 hover:bg-red-100'
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
            }`}
            aria-label="Bildirimi kapat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Clear any existing toast first
    setToast({ show: false, message: '', type: 'success' });
    
    // Show new toast after small delay
    setTimeout(() => {
      setToast({ show: true, message, type });
    }, 100);
    
    // Auto hide after 3 seconds
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Toast 
          message={toast.message} 
          type={toast.type} 
          show={toast.show} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
        <Header user={user} setUser={setUser} />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage showToast={showToast} />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} showToast={showToast} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage setUser={setUser} showToast={showToast} />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/booking" element={user ? <BookingPage user={user} showToast={showToast} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <AdminPage showToast={showToast} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Header Component
function Header({ user, setUser }: { user: User | null; setUser: (user: User | null) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass bg-white/80 border-b border-slate-200/50 safe-area">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent whitespace-nowrap">
                Araç Yıkama Hizmeti
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/services" 
              className="px-4 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              Hizmetler
            </Link>
            {user && (
              <>
                <Link 
                  to="/booking" 
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 whitespace-nowrap"
                >
                  Rezervasyon Yap
                </Link>
                <Link 
                  to="/admin" 
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.first_name.charAt(0)}
                  </div>
                  <span className="font-medium whitespace-nowrap">Hoş geldin, {user.business_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded-lg"
                >
                  Giriş
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label="Menüyü aç"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass bg-white/95 border-b border-slate-200/50 shadow-xl animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Ana Sayfa
              </Link>
              <Link 
                to="/services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Hizmetler
              </Link>
              {user && (
                <>
                  <Link 
                    to="/booking" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 whitespace-nowrap"
                  >
                    Rezervasyon Yap
                  </Link>
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-slate-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
                  >
                    Admin Panel
                  </Link>
                </>
              )}
              
              <div className="border-t border-slate-200 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.first_name.charAt(0)}
                      </div>
                      <span className="font-medium whitespace-nowrap">Hoş geldin, {user.business_name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    >
                      Çıkış
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 rounded-xl hover:bg-primary-50"
                    >
                      Giriş
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-center shadow-lg"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Home Page Component
function HomePage({ showToast }: { showToast: (message: string, type?: 'success' | 'error') => void }) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        if (response.data && response.data.services) {
          setServices(response.data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback services if API fails
        setServices([
          {
            id: 1,
            name: 'Temel Yıkama',
            description: 'Dış yıkama ve kurutma',
            price: 500,
            duration_minutes: 30
          },
          {
            id: 2,
            name: 'Premium Yıkama',
            description: 'Dış yıkama, iç temizlik, cila',
            price: 700,
            duration_minutes: 60
          },
          {
            id: 3,
            name: 'Komple Detay',
            description: 'Komple araç detay hizmeti',
            price: 1000,
            duration_minutes: 120
          }
        ]);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 600">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Profesyonel
              </span>
              <br />
              <span className="text-white">Araç Yıkama Hizmeti</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Aracınızı pırıl pırıl temiz tutun premium yıkama hizmetlerimizle. 
              Modern teknoloji ve uzman ekibimizle en iyi hizmeti sunuyoruz.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/booking"
                className="group relative px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Rezervasyon Yap</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-xl group-hover:bg-white/10 transition-colors duration-300"></div>
              </Link>
              
              <Link
                to="/services"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 min-w-[200px]"
              >
                Hizmetleri İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Premium Hizmetlerimiz
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Her bütçeye uygun, kaliteli araç yıkama paketlerimizle aracınızın ihtiyacına göre en iyi hizmeti seçin
            </p>
          </div>
          
          {services.length === 0 ? (
            // Loading Skeleton
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-6"></div>
                  <div className="h-8 bg-slate-200 rounded mb-4"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={service.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Neden Bizi Tercih Etmelisiniz?
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">Hızlı Servis</h4>
              <p className="text-slate-600">30-120 dakika arası hızlı ve kaliteli hizmet</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">Kalite Garantisi</h4>
              <p className="text-slate-600">%100 müşteri memnuniyeti garantisi</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">Admin Takip</h4>
              <p className="text-slate-600">Profesyonel müşteri ve hizmet yönetimi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }: { service: Service }) {
  const getServiceIcon = (name: string) => {
    if (name.includes('Temel')) {
      return (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('Premium')) {
      return (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-slate-100 overflow-hidden">
      {/* Gradient Top Bar */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
      
      {/* Card Content */}
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-primary-50 group-hover:to-primary-100 transition-all duration-300">
              {getServiceIcon(service.name)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors duration-300">
                {service.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-slate-500 font-medium">{service.duration_minutes} dakika</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed text-sm">
          {service.description}
        </p>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900 group-hover:text-primary-600 transition-colors duration-300">
              {service.price}₺
            </span>
            <span className="text-slate-500 text-sm font-medium">başlangıç</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">KDV dahil fiyat</p>
        </div>

        {/* CTA Button */}
        <Link
          to="/booking"
          className="group/button relative w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 block text-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 min-h-[48px]"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 group-hover/button:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Rezervasyon Yap</span>
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}

// Login Page Component
function LoginPage({ setUser, showToast }: { setUser: (user: User) => void; showToast: (message: string, type?: 'success' | 'error') => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Get registered users from localStorage
  const getRegisteredUsers = () => {
    const defaultUsers = [
      {
        id: 1,
        email: 'admin@istanbulpremium.com',
        username: 'admin_istanbul',
        password: '123456', // In real app this would be hashed
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        business_name: 'İstanbul Premium Oto Yıkama',
        phone: '+905551234567',
        role: 'admin' as const,
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString()
      },
      {
        id: 2,
        email: 'admin@ankaraelite.com',
        username: 'admin_ankara',
        password: '123456',
        first_name: 'Mehmet',
        last_name: 'Demir',
        business_name: 'Ankara Elite Car Wash',
        phone: '+905552345678',
        role: 'admin' as const,
        created_at: '2024-01-02T00:00:00Z',
        last_login: new Date().toISOString()
      }
    ];
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      return [...defaultUsers, ...storedUsers];
    } catch (error) {
      console.error('Error parsing registered users:', error);
      return defaultUsers;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists and password matches
      const registeredUsers = getRegisteredUsers();
      const user = registeredUsers.find((u: any) => u.username === username);
      
      if (!user) {
        showToast('Kullanıcı adı bulunamadı!', 'error');
        setLoading(false);
        return;
      }
      
      if (user.password !== password) {
        showToast('Şifre yanlış!', 'error');
        setLoading(false);
        return;
      }
      
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;
      
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      showToast('Admin girişi başarılı!', 'success');
    } catch (error) {
      showToast('Giriş başarısız. Lütfen tekrar deneyin.', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Girişi
            </h2>
            <p className="text-gray-600">
              Oto yıkama admin panelinize giriş yapın
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin_istanbul"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Beni hatırla
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Şifremi unuttum
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                'Admin Girişi Yap'
              )}
            </button>

            <div className="text-center">
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Hesabınız yok mu? Admin hesabı oluşturun
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Register Page Component
function RegisterPage({ setUser, showToast }: { setUser: (user: User) => void; showToast: (message: string, type?: 'success' | 'error') => void }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    business_name: '',
    phone: '',
    role: 'admin' as const
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Oto yıkama isimleri listesi
  const businessNames = [
    'İstanbul Premium Oto Yıkama',
    'Ankara Elite Car Wash',
    'İzmir Pro Detailing',
    'Bursa Express Wash',
    'Antalya Luxury Car Care',
    'Adana Star Auto Wash',
    'Konya Premium Detailing',
    'Gaziantep Elite Wash',
    'Kayseri Pro Car Care',
    'Mersin Express Detailing'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Şifreler eşleşmiyor!', 'error');
      return;
    }
    
    if (formData.password.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır!', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock admin registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const usernameExists = existingUsers.some((user: any) => user.username === formData.username);
      
      if (usernameExists) {
        showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
        setLoading(false);
        return;
      }
      
      const newUser = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: formData.email,
        username: formData.username,
        password: formData.password, // In real app this would be hashed
        first_name: formData.first_name,
        last_name: formData.last_name,
        business_name: formData.business_name,
        phone: formData.phone,
        role: formData.role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // Add to registered users
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = newUser;
      
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      showToast('Admin hesabı başarıyla oluşturuldu!', 'success');
    } catch (error) {
      showToast('Kayıt başarısız. Lütfen tekrar deneyin.', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Hesabı Oluştur
            </h2>
            <p className="text-gray-600">
              Oto yıkama işletmeniz için admin hesabı oluşturun
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Business Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Adı *
              </label>
              <select
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">İşletme seçin...</option>
                {businessNames.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+90 555 123 4567"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin_istanbul"
              />
              <p className="text-xs text-gray-500 mt-1">
                Benzersiz kullanıcı adı belirleyin (örn: admin_istanbul)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            {/* Password Reset Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Şifre Sıfırlama</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Şifrenizi unutursanız, kayıtlı e-posta adresinize sıfırlama bağlantısı gönderilecektir.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Hesap oluşturuluyor...</span>
                </div>
              ) : (
                'Admin Hesabı Oluştur'
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Services Page Component
function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        if (response.data && response.data.services) {
          setServices(response.data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback services
        setServices([
          {
            id: 1,
            name: 'Temel Yıkama',
            description: 'Dış yıkama ve kurutma',
            price: 500,
            duration_minutes: 30
          },
          {
            id: 2,
            name: 'Premium Yıkama',
            description: 'Dış yıkama, iç temizlik, cila',
            price: 700,
            duration_minutes: 60
          },
          {
            id: 3,
            name: 'Komple Detay',
            description: 'Komple araç detay hizmeti',
            price: 1000,
            duration_minutes: 120
          }
        ]);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h1>
          <p className="text-xl text-gray-600">Aracınız için mükemmel yıkamayı seçin</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Booking Page Component
function BookingPage({ user, showToast }: { user: User; showToast: (message: string, type?: 'success' | 'error') => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number>(0);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        if (response.data && response.data.services) {
          setServices(response.data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback services
        setServices([
          { id: 1, name: 'Temel Yıkama', description: 'Dış yıkama ve kurutma', price: 500, duration_minutes: 30 },
          { id: 2, name: 'Premium Yıkama', description: 'Dış yıkama, iç temizlik, cila', price: 700, duration_minutes: 60 },
          { id: 3, name: 'Komple Detay', description: 'Komple araç detay hizmeti', price: 1000, duration_minutes: 120 }
        ]);
      }
    };
    
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/bookings`, {
        service_id: selectedService,
        booking_date: bookingDate,
        booking_time: bookingTime,
        car_model: carModel,
        car_plate: carPlate
      });
      showToast('🎉 Rezervasyon başarıyla oluşturuldu!');
      
      // Reset form
      setSelectedService(0);
      setBookingDate('');
      setBookingTime('');
      setCarModel('');
      setCarPlate('');
    } catch (error) {
      showToast('Rezervasyon başarısız. Lütfen tekrar deneyin.', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Hizmet Rezervasyonu</h1>
          <p className="text-gray-600">Araç yıkama randevunuzu planlayın</p>

        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hizmet Seçin
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Bir hizmet seçin...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}₺ ({service.duration_minutes} dk)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saat
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Saat seçin...</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Modeli
                </label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="örn. Toyota Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaka
                </label>
                <input
                  type="text"
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="örn. 34 ABC 123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Rezervasyon yapılıyor...' : 'Randevu Al'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Profile Page Component
function ProfilePage({ user }: { user: User }) {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">{user.first_name.charAt(0)}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profili</h1>
              <p className="text-gray-600">{user.business_name}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">İşletme Bilgileri</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">İşletme Adı</p>
                        <p className="font-semibold text-gray-900">{user.business_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Admin Adı</p>
                        <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">E-posta</p>
                        <p className="font-semibold text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Telefon</p>
                        <p className="font-semibold text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Hesap Bilgileri</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kullanıcı Adı</p>
                        <p className="font-semibold text-gray-900">{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rol</p>
                        <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Son Giriş</p>
                        <p className="font-semibold text-gray-900">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('tr-TR') : 'Henüz giriş yapılmadı'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Hızlı İşlemler</h2>
                  <div className="space-y-3">
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Admin Paneli</span>
                    </Link>
                    <button 
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 w-full text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Profil Düzenle</span>
                    </button>
                    <button 
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-200 hover:bg-orange-50 transition-all duration-200 w-full text-left"
                    >
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Şifre Değiştir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Page Component
function AdminPage({ showToast }: { showToast: (message: string, type?: 'success' | 'error') => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  
  // Add Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    plate: '',
    service: 1
  });

  // Mock data for demonstration
  useEffect(() => {
    const today = new Date();
    const mockJobs: Job[] = [
      {
        id: 1,
        customer_id: 1,
        customer_name: 'Ahmet Yılmaz',
        customer_phone: '+905551234567',
        car_plate: '34 ABC 123',
        service_name: 'Temel Yıkama',
        service_price: 500,
        status: 'in_progress',
        created_at: new Date(today.setHours(9, 15)).toISOString(),
        drop_off_time: new Date(today.setHours(9, 15)).toISOString(),
        estimated_duration: 30,
        whatsapp_sent: false,
        whatsapp_status: 'pending'
      },
      {
        id: 2,
        customer_id: 2,
        customer_name: 'Fatma Demir',
        customer_phone: '+905552345678',
        car_plate: '06 XYZ 789',
        service_name: 'Premium Yıkama',
        service_price: 700,
        status: 'ready',
        created_at: new Date(today.setHours(10, 30)).toISOString(),
        drop_off_time: new Date(today.setHours(10, 30)).toISOString(),
        estimated_duration: 60,
        whatsapp_sent: true,
        whatsapp_status: 'delivered'
      },
      {
        id: 3,
        customer_id: 3,
        customer_name: 'Mehmet Kaya',
        customer_phone: '+905553456789',
        car_plate: '35 DEF 456',
        service_name: 'Komple Detay',
        service_price: 1000,
        status: 'completed',
        created_at: new Date(today.setHours(8, 0)).toISOString(),
        drop_off_time: new Date(today.setHours(8, 0)).toISOString(),
        completed_at: new Date(today.setHours(10, 0)).toISOString(),
        estimated_duration: 120,
        whatsapp_sent: true,
        whatsapp_status: 'delivered'
      },
      {
        id: 4,
        customer_id: 4,
        customer_name: 'Ayşe Özkan',
        customer_phone: '+905554567890',
        car_plate: '07 GHI 321',
        service_name: 'Premium Yıkama',
        service_price: 700,
        status: 'completed',
        created_at: new Date(today.setHours(11, 45)).toISOString(),
        drop_off_time: new Date(today.setHours(11, 45)).toISOString(),
        completed_at: new Date(today.setHours(12, 45)).toISOString(),
        estimated_duration: 60,
        whatsapp_sent: true,
        whatsapp_status: 'delivered'
      },
      {
        id: 5,
        customer_id: 5,
        customer_name: 'Mustafa Çelik',
        customer_phone: '+905555678901',
        car_plate: '16 JKL 654',
        service_name: 'Temel Yıkama',
        service_price: 500,
        status: 'ready',
        created_at: new Date(today.setHours(13, 20)).toISOString(),
        drop_off_time: new Date(today.setHours(13, 20)).toISOString(),
        estimated_duration: 30,
        whatsapp_sent: true,
        whatsapp_status: 'sent'
      }
    ];

    const mockCustomers: Customer[] = [
      { id: 1, name: 'Ahmet Yılmaz', phone: '+905551234567', plate: '34 ABC 123', created_at: new Date(today.setHours(9, 15)).toISOString() },
      { id: 2, name: 'Fatma Demir', phone: '+905552345678', plate: '06 XYZ 789', created_at: new Date(today.setHours(10, 30)).toISOString() },
      { id: 3, name: 'Mehmet Kaya', phone: '+905553456789', plate: '35 DEF 456', created_at: new Date(today.setHours(8, 0)).toISOString() },
      { id: 4, name: 'Ayşe Özkan', phone: '+905554567890', plate: '07 GHI 321', created_at: new Date(today.setHours(11, 45)).toISOString() },
      { id: 5, name: 'Mustafa Çelik', phone: '+905555678901', plate: '16 JKL 654', created_at: new Date(today.setHours(13, 20)).toISOString() }
    ];

    // Mock statistics
    const mockStats: Statistics = {
      daily: {
        revenue: 3400, // completed jobs: 1000 + 700 + 500 = 2200 + ongoing
        completed_jobs: 2,
        active_jobs: 3,
        avg_duration: 70
      },
      weekly: {
        revenue: 15800,
        completed_jobs: 24,
        chart_data: [
          { day: 'Pzt', revenue: 2400, jobs: 4 },
          { day: 'Sal', revenue: 1800, jobs: 3 },
          { day: 'Çar', revenue: 3200, jobs: 5 },
          { day: 'Per', revenue: 2800, jobs: 4 },
          { day: 'Cum', revenue: 3400, jobs: 5 },
          { day: 'Cmt', revenue: 1600, jobs: 2 },
          { day: 'Paz', revenue: 600, jobs: 1 }
        ]
      },
      monthly: {
        revenue: 67500,
        completed_jobs: 98,
        chart_data: [
          { week: 'Hafta 1', revenue: 16200, jobs: 24 },
          { week: 'Hafta 2', revenue: 18500, jobs: 28 },
          { week: 'Hafta 3', revenue: 15800, jobs: 22 },
          { week: 'Hafta 4', revenue: 17000, jobs: 24 }
        ]
      }
    };
    
    setTimeout(() => {
      setJobs(mockJobs);
      setCustomers(mockCustomers);
      setStatistics(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.car_plate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (job.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (job.service_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Calculate real-time statistics
  const calculateStats = () => {
    const completedToday = jobs.filter(job => 
      job.status === 'completed' && 
      new Date(job.completed_at || job.created_at).toDateString() === new Date().toDateString()
    );
    
    const todayRevenue = completedToday.reduce((sum, job) => sum + job.service_price, 0);
    
    return {
      todayRevenue,
      completedToday: completedToday.length,
      activeJobs: jobs.filter(job => job.status === 'in_progress' || job.status === 'ready').length,
      avgDuration: completedToday.length > 0 ? 
        completedToday.reduce((sum, job) => sum + (job.estimated_duration || 0), 0) / completedToday.length : 0
    };
  };

  const realTimeStats = calculateStats();

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.plate) {
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    const customer: Customer = {
      id: customers.length + 1,
      name: newCustomer.name,
      phone: newCustomer.phone,
      plate: newCustomer.plate.toUpperCase(),
      created_at: new Date().toISOString()
    };

    const serviceNames = ['Temel Yıkama', 'Premium Yıkama', 'Komple Detay'];
    const servicePrices = [500, 700, 1000];

    const now = new Date();
    const job: Job = {
      id: jobs.length + 1,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      car_plate: customer.plate,
      service_name: serviceNames[newCustomer.service - 1],
      service_price: servicePrices[newCustomer.service - 1],
      status: 'in_progress',
      created_at: now.toISOString(),
      drop_off_time: now.toISOString(),
      estimated_duration: [30, 60, 120][newCustomer.service - 1],
      whatsapp_sent: false,
      whatsapp_status: 'pending'
    };

    setCustomers(prev => [...prev, customer]);
    setJobs(prev => [...prev, job]);
    setNewCustomer({ name: '', phone: '', plate: '', service: 1 });
    setShowAddCustomer(false);
    showToast(`${customer.name} başarıyla eklendi ve işe başlandı`, 'success');
  };

  const markCarReady = async (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // WhatsApp mesajı gönderme simülasyonu
    showToast('WhatsApp mesajı gönderiliyor...', 'success');
    
    setTimeout(() => {
      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'ready' as const, 
              whatsapp_sent: true, 
              whatsapp_status: 'sent' as const 
            } 
          : j
      ));
      showToast(`${job.customer_name}'a WhatsApp mesajı gönderildi!`, 'success');
      
      // Delivered status simülasyonu
      setTimeout(() => {
        setJobs(prev => prev.map(j => 
          j.id === jobId 
            ? { ...j, whatsapp_status: 'delivered' as const } 
            : j
        ));
      }, 2000);
    }, 1500);
  };

  const completeJob = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, status: 'completed' as const, completed_at: new Date().toISOString() } 
        : j
    ));
    
    // Ciro hesaplama ve bildirim
    showToast(`✅ İş tamamlandı! ${job.service_price}₺ ciroya eklendi`, 'success');
  };

  // Daily log cleanup function (called at end of day)
  const clearDailyLogs = () => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const todayRevenue = completedJobs.reduce((sum, job) => sum + job.service_price, 0);
    
    console.log(`🌙 GÜN SONU: ${completedJobs.length} iş tamamlandı, ${todayRevenue}₺ ciro`);
    
    // Clear completed jobs (keep only active ones)
    setJobs(prev => prev.filter(job => job.status !== 'completed'));
    showToast(`Günlük log temizlendi. ${completedJobs.length} tamamlanan iş arşivlendi`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'İşlemde';
      case 'ready': return 'Hazır';
      case 'completed': return 'Teslim Edildi';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const getWhatsAppStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <span className="text-blue-500">📤</span>;
      case 'delivered':
        return <span className="text-green-500">✅</span>;
      case 'failed':
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-400">⏳</span>;
    }
  };

  return (
    <div className="py-4 animate-fade-in bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                📱 WhatsApp Admin
              </h1>
              <p className="text-sm text-slate-600">
                Araç yıkama işleri ve WhatsApp bildirimleri
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
              >
                📊 İstatistik
              </button>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
              >
                + Müşteri Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && statistics && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-slate-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">📊 Detaylı İstatistikler</h2>
              <button
                onClick={clearDailyLogs}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors duration-200"
              >
                🌙 Gün Sonu Temizle
              </button>
            </div>
            
            {/* Daily Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">📅 Bugünkü Durum</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-3xl font-bold text-blue-600">{realTimeStats.todayRevenue}₺</p>
                  <p className="text-sm text-blue-700">Günlük Ciro</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-600">{realTimeStats.completedToday}</p>
                  <p className="text-sm text-green-700">Tamamlanan</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-3xl font-bold text-orange-600">{realTimeStats.activeJobs}</p>
                  <p className="text-sm text-orange-700">Aktif İş</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-3xl font-bold text-purple-600">{Math.round(realTimeStats.avgDuration)}</p>
                  <p className="text-sm text-purple-700">Ort. Süre (dk)</p>
                </div>
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">📈 Haftalık Trend</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{statistics.weekly.revenue}₺</p>
                    <p className="text-sm text-slate-600">Haftalık Toplam</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{statistics.weekly.completed_jobs}</p>
                    <p className="text-sm text-slate-600">Toplam İş</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {statistics.weekly.chart_data.map((day) => (
                    <div key={day.day} className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs font-medium text-slate-600 mb-1">{day.day}</p>
                      <div className="bg-blue-500 rounded" style={{ height: `${(day.revenue / 3500) * 40 + 10}px` }}></div>
                      <p className="text-xs font-bold text-slate-800 mt-1">{day.revenue}₺</p>
                      <p className="text-xs text-slate-500">{day.jobs} iş</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">📅 Aylık Özet</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{statistics.monthly.revenue}₺</p>
                    <p className="text-sm text-slate-600">Aylık Toplam</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{statistics.monthly.completed_jobs}</p>
                    <p className="text-sm text-slate-600">Toplam İş</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {statistics.monthly.chart_data.map((week) => (
                    <div key={week.week} className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs font-medium text-slate-600 mb-2">{week.week}</p>
                      <p className="text-sm font-bold text-slate-800">{week.revenue}₺</p>
                      <p className="text-xs text-slate-500">{week.jobs} iş</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Yeni Müşteri Ekle</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Müşteri Adı
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+905551234567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Araç Plakası
                  </label>
                  <input
                    type="text"
                    value={newCustomer.plate}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="34 ABC 123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hizmet Türü
                  </label>
                  <select
                    value={newCustomer.service}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, service: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={1}>Temel Yıkama - 500₺</option>
                    <option value={2}>Premium Yıkama - 700₺</option>
                    <option value={3}>Komple Detay - 1000₺</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={addCustomer}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Ekle ve Başlat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{realTimeStats.activeJobs}</p>
              <p className="text-xs text-slate-600">Aktif İş</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'ready').length}</p>
              <p className="text-xs text-slate-600">Hazır</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{realTimeStats.completedToday}</p>
              <p className="text-xs text-slate-600">Teslim</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{realTimeStats.todayRevenue}₺</p>
              <p className="text-xs text-slate-600">Günlük Ciro</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Plaka, isim veya servis ara..."
                />
              </div>
            </div>
            
            <div className="sm:w-40">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-3 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="in_progress">İşlemde</option>
                <option value="ready">Hazır</option>
                <option value="completed">Teslim</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Aktif İşler ({filteredJobs.length})
            </h2>
            {totalPages > 1 && (
              <p className="text-sm text-slate-600">
                Sayfa {currentPage} / {totalPages}
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Yükleniyor...</p>
            </div>
          ) : currentJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-600 text-sm">Sonuç bulunamadı</p>
            </div>
          ) : (
            currentJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{job.customer_name}</h3>
                      {getWhatsAppStatusIcon(job.whatsapp_status)}
                    </div>
                    <p className="text-sm text-slate-600">{job.customer_phone}</p>
                    <p className="text-sm font-medium text-slate-900">{job.car_plate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600">{job.service_name}</p>
                    <p className="font-bold text-lg text-slate-900">{job.service_price}₺</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="bg-slate-100 rounded-lg p-2 mb-1">
                      <p className="font-medium text-slate-700">Bırakılma:</p>
                      <p className="text-slate-600">
                        {job.drop_off_time ? new Date(job.drop_off_time).toLocaleString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Belirsiz'}
                      </p>
                    </div>
                    {job.estimated_duration && (
                      <p className="text-slate-500">~{job.estimated_duration} dk</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => markCarReady(job.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      🚗 ARAÇ HAZIR - WhatsApp Gönder
                    </button>
                  )}
                  
                  {job.status === 'ready' && (
                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">✅</span>
                          <p className="text-sm text-green-800 font-medium">
                            WhatsApp mesajı gönderildi!
                          </p>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Müşteri bilgilendirildi, araç teslim edilmeyi bekliyor
                        </p>
                      </div>
                      <button
                        onClick={() => completeJob(job.id)}
                        className="w-full bg-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-slate-700 transition-colors duration-200"
                      >
                        ✅ Teslim Edildi
                      </button>
                    </div>
                  )}
                  
                  {job.status === 'completed' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">🏁</span>
                        <p className="text-sm text-gray-700 font-medium">
                          İş tamamlandı
                        </p>
                      </div>
                      {job.completed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(job.completed_at).toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Önceki
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
