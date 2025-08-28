import React, { useState, useEffect, useCallback } from 'react';
import { CustomerForm } from '../components/admin/CustomerForm';
import { ActiveJobs } from '../components/admin/ActiveJobs';
import { Statistics } from '../components/admin/Statistics';
import { jobsAPI } from '../services/api';
import { Job } from '../types';
import { showToast } from '../components/ui/Toast';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showToast('İşler yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStatsModal(false);
        setShowCustomerModal(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddCustomer = async (customerData: any) => {
    try {
      await jobsAPI.create(customerData);
      showToast('Müşteri başarıyla eklendi!', 'success');
      setShowCustomerModal(false); // Close the modal
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error adding customer:', error);
      showToast('Müşteri eklenirken hata oluştu.', 'error');
    }
  };

  const handleMarkAsReady = async (jobId: string) => {
    try {
      await jobsAPI.updateStatus(jobId, 'ready');
      showToast('İş hazır olarak işaretlendi!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error marking job as ready:', error);
      showToast('İş durumu güncellenirken hata oluştu.', 'error');
    }
  };

  const handleMarkAsCompleted = async (jobId: string) => {
    try {
      await jobsAPI.updateStatus(jobId, 'completed');
      showToast('İş tamamlandı olarak işaretlendi!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error marking job as completed:', error);
      showToast('İş durumu güncellenirken hata oluştu.', 'error');
    }
  };

  const handleSendWhatsApp = async (jobId: string, message?: string) => {
    try {
      const response = await jobsAPI.sendWhatsApp(jobId, message);
      const whatsappUrl = response.data.whatsappUrl;
      
      showToast('WhatsApp açılıyor...', 'success');
      
      // Try multiple methods to open WhatsApp
      try {
        // Method 1: window.open
        const newWindow = window.open(whatsappUrl, '_blank');
        
        // Method 2: If window.open fails, try location.href
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          setTimeout(() => {
            window.location.href = whatsappUrl;
          }, 100);
        }
        
        // Method 3: Create a temporary link and click it
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = whatsappUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 200);
        
      } catch (openError) {
        console.error('Error opening WhatsApp:', openError);
        // Final fallback: show URL to user
        showToast(`WhatsApp açılamadı. URL: ${whatsappUrl}`, 'error');
      }
      
      fetchData();
    } catch (error) {
      console.error('WhatsApp send error:', error);
      showToast('WhatsApp mesajı gönderilemedi. Lütfen tekrar deneyin.', 'error');
    }
  };

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Arayüzü</h1>
          <p className="mt-2 text-gray-600">Aktif işlerin yönetimi</p>
        </div>
        
        {/* Action buttons - Responsive */}
        <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
          {/* Add Customer Button - Red */}
          <button
            onClick={() => setShowCustomerModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg flex-1 sm:flex-none whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Yeni Müşteri Ekle</span>
            <span className="sm:hidden">Müşteri Ekle</span>
          </button>
          
          {/* Statistics Button - Blue */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg flex-1 sm:flex-none whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            İstatistikler
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Plaka, isim veya servis ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tümü</option>
            <option value="active">İşlemde</option>
            <option value="ready">Hazır</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>
      </div>

      {/* Active Jobs - Main Focus */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Aktif İşler ({filteredJobs.length})
        </h2>
        <ActiveJobs 
          jobs={filteredJobs} 
          onMarkReady={handleMarkAsReady} 
          onMarkCompleted={handleMarkAsCompleted}
          onSendWhatsApp={handleSendWhatsApp}
        />
      </div>

      {/* Customer Add Modal */}
      {showCustomerModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCustomerModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Müşteri Ekle</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CustomerForm onSubmit={handleAddCustomer} />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowStatsModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">İstatistikler</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Statistics jobs={jobs} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
