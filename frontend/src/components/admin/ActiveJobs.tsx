import React, { useState } from 'react';
import { Job } from '../../types';
import { WhatsAppSender } from './WhatsAppSender';

interface ActiveJobsProps {
  jobs: Job[];
  onMarkReady: (jobId: string) => void;
  onMarkCompleted: (jobId: string) => void;
  onSendWhatsApp: (jobId: string, message?: string) => Promise<void>;
}

export function ActiveJobs({ jobs, onMarkReady, onMarkCompleted, onSendWhatsApp }: ActiveJobsProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'İşlemde';
      case 'ready': return 'Hazır';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">Henüz iş bulunmuyor</div>
        <p className="text-gray-400 mt-2">Yeni müşteri ekleyerek iş başlatabilirsiniz</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {job.customer_name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {getStatusText(job.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Telefon:</span> {job.customer_phone}
                </div>
                <div>
                  <span className="font-medium">Plaka:</span> {job.car_plate}
                </div>
                <div>
                  <span className="font-medium">Servis:</span> {job.service_type}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                <div>
                  <span className="font-medium">Ücret:</span> {job.price}₺
                </div>
                <div>
                  <span className="font-medium">Başlangıç:</span> {formatDate(job.started_at)}
                </div>
                {job.completed_at && (
                  <div>
                    <span className="font-medium">Tamamlanma:</span> {formatDate(job.completed_at)}
                  </div>
                )}
              </div>

              {/* WhatsApp Status */}
              {job.whatsapp_sent && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <span>✅</span>
                    <span>WhatsApp mesajı gönderildi! Müşteri bilgilendirildi, araç teslim edilmeyi bekliyor</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {job.status === 'active' && (
                <>
                  <button 
                    onClick={() => onMarkReady(job.id)} 
                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Hazır Olarak İşaretle
                  </button>
                  <button 
                    onClick={() => { setSelectedJob(job); setShowWhatsApp(true); }} 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    📱 WhatsApp
                  </button>
                </>
              )}
              
              {job.status === 'ready' && (
                <>
                  <button 
                    onClick={() => onMarkCompleted(job.id)} 
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Tamamlandı Olarak İşaretle
                  </button>
                  <button 
                    onClick={() => { setSelectedJob(job); setShowWhatsApp(true); }} 
                    className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    📱 WhatsApp
                  </button>
                </>
              )}
              
              {job.status === 'completed' && (
                <button 
                  onClick={() => { setSelectedJob(job); setShowWhatsApp(true); }} 
                  className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  📱 WhatsApp Gönder
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* WhatsApp Sender Modal */}
      {showWhatsApp && selectedJob && (
        <WhatsAppSender
          job={selectedJob}
          onSend={onSendWhatsApp}
          onClose={() => {
            setShowWhatsApp(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
