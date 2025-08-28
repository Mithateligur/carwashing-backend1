import React from 'react';
import { Job } from '../../types';

interface StatisticsProps {
  jobs: Job[];
}

export function Statistics({ jobs }: StatisticsProps) {
  // Calculate statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const readyJobs = jobs.filter(job => job.status === 'ready').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  
  const totalRevenue = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + job.price, 0);

  const todayJobs = jobs.filter(job => {
    const today = new Date().toDateString();
    const jobDate = new Date(job.started_at).toDateString();
    return today === jobDate;
  }).length;

  const averageCompletionTime = completedJobs > 0 ? 
    jobs
      .filter(job => job.status === 'completed' && job.completed_at)
      .reduce((sum, job) => {
        const start = new Date(job.started_at).getTime();
        const end = new Date(job.completed_at!).getTime();
        return sum + (end - start);
      }, 0) / completedJobs / (1000 * 60) : 0; // in minutes

  const stats = [
    {
      title: 'Toplam İş',
      value: totalJobs,
      change: '+12%',
      changeType: 'positive',
      icon: '📊'
    },
    {
      title: 'Aktif İş',
      value: activeJobs,
      change: '+5%',
      changeType: 'positive',
      icon: '🔄'
    },
    {
      title: 'Hazır',
      value: readyJobs,
      change: '+8%',
      changeType: 'positive',
      icon: '✅'
    },
    {
      title: 'Tamamlanan',
      value: completedJobs,
      change: '+15%',
      changeType: 'positive',
      icon: '🎉'
    },
    {
      title: 'Günlük İş',
      value: todayJobs,
      change: '+3%',
      changeType: 'positive',
      icon: '📅'
    },
    {
      title: 'Toplam Gelir',
      value: `${totalRevenue.toLocaleString()}₺`,
      change: '+18%',
      changeType: 'positive',
      icon: '💰'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">İstatistikler</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">geçen aya göre</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Metrikleri</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ortalama Tamamlanma Süresi</span>
              <span className="font-semibold text-gray-900">
                {Math.round(averageCompletionTime)} dakika
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Başarı Oranı</span>
              <span className="font-semibold text-gray-900">
                {totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Günlük Ortalama İş</span>
              <span className="font-semibold text-gray-900">
                {Math.round(totalJobs / Math.max(1, Math.ceil((Date.now() - new Date(jobs[0]?.started_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Durum Dağılımı</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-600">İşlemde</span>
              </div>
              <span className="font-semibold text-gray-900">{activeJobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Hazır</span>
              </div>
              <span className="font-semibold text-gray-900">{readyJobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Tamamlandı</span>
              </div>
              <span className="font-semibold text-gray-900">{completedJobs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
