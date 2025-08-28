import React from 'react';
import { User } from '../types';

export default function ProfilePage({ user }: { user: User }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {getInitials(user.owner_name)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {user.business_name}
            </h1>
            <p className="text-gray-600">İşletme Sahibi</p>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">İşletme Adı</p>
              <p className="text-lg text-gray-800">{user.business_name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">İşletme Sahibi</p>
              <p className="text-lg text-gray-800">{user.owner_name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">E-posta</p>
              <p className="text-lg text-gray-800">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">WhatsApp Numarası</p>
              <p className="text-lg text-gray-800">{user.whatsapp_number}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Kayıt Tarihi</p>
              <p className="text-lg text-gray-800">
                {new Date(user.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Hesap Durumu</p>
              <p className="text-lg text-green-600 font-medium">Aktif</p>
            </div>
          </div>
        </div>

        {/* Business Stats */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">İşletme İstatistikleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600 font-medium">Toplam İş</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600 font-medium">Tamamlanan İş</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">0₺</div>
              <div className="text-sm text-purple-600 font-medium">Toplam Gelir</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Profili Düzenle
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Şifre Değiştir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
