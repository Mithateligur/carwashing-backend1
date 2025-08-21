<<<<<<< HEAD
# 🚗 WhatsApp Car Wash Admin System

Modern ve profesyonel araç yıkama işletmeleri için WhatsApp tabanlı admin sistemi.

## 🌟 Özellikler

### 🔐 Admin Authentication
- **Güvenli Giriş:** Kullanıcı adı ve şifre ile giriş
- **Kayıt Sistemi:** İşletme bazlı admin hesabı oluşturma
- **Şifre Güvenliği:** Şifre doğrulama ve benzersiz kullanıcı adı
- **Session Yönetimi:** Otomatik oturum korunması

### 📱 WhatsApp Admin Panel
- **Müşteri Yönetimi:** Plaka, isim, telefon ile müşteri ekleme
- **İş Takibi:** Araç bırakma saati, tahmini süre, durum takibi
- **WhatsApp Entegrasyonu:** Otomatik "Araç Hazır" mesajı
- **Pagination:** 10 kayıt/sayfa ile performanslı liste

### 📊 Detaylı İstatistikler
- **Günlük İstatistikler:** Ciro, tamamlanan iş, aktif iş, ortalama süre
- **Haftalık Trend:** 7 günlük grafik ve toplam veriler
- **Aylık Özet:** 4 haftalık karşılaştırma
- **Gerçek Zamanlı:** Anlık güncelleme ve ciro hesaplama

### 🎯 İş Akışı
1. **Müşteri Ekle:** Plaka + telefon + hizmet seçimi
2. **İş Başlat:** Drop-off time kaydedilir
3. **Araç Hazır:** WhatsApp mesajı gönderilir
4. **Teslim Et:** Ciro hesaplanır ve iş tamamlanır
5. **Gün Sonu:** Log temizleme ve arşivleme

## 🛠️ Teknoloji Stack

### Backend
- **Fastify:** Hızlı ve modern web framework
- **PostgreSQL:** Güvenilir veritabanı
- **JWT:** Güvenli authentication
- **TypeScript:** Tip güvenliği
- **Zod:** Veri validasyonu

### Frontend
- **React 18:** Modern UI framework
- **TypeScript:** Tip güvenliği
- **Tailwind CSS:** Modern styling
- **Axios:** HTTP client
- **React Router:** Sayfa yönlendirme

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

## 📋 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carwashing_db
DB_USER=your_username
DB_PASSWORD=your_password
```

## 🔑 Test Hesapları

### Hazır Admin Hesapları
```
Kullanıcı Adı: admin_istanbul
Şifre: 123456
İşletme: İstanbul Premium Oto Yıkama

Kullanıcı Adı: admin_ankara
Şifre: 123456
İşletme: Ankara Elite Car Wash
```

## 📱 Kullanım

### Admin Girişi
1. `/login` sayfasına gidin
2. Kullanıcı adı ve şifre girin
3. Admin paneline erişin

### Müşteri Ekleme
1. "+ Müşteri Ekle" butonuna tıklayın
2. Müşteri bilgilerini doldurun
3. "Ekle ve Başlat" ile işi başlatın

### İş Tamamlama
1. "🚗 ARAÇ HAZIR" butonu ile WhatsApp mesajı gönderin
2. "✅ Teslim Edildi" ile işi tamamlayın
3. Ciro otomatik hesaplanır

### İstatistikler
1. "📊 İstatistik" butonu ile detaylı verileri görün
2. Günlük, haftalık, aylık trendleri inceleyin
3. "🌙 Gün Sonu Temizle" ile logları arşivleyin

## 🏗️ Proje Yapısı

```
carwashing-project/
├── backend/                 # Fastify API
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React App
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔒 Güvenlik

- **JWT Authentication:** Güvenli token tabanlı giriş
- **Password Validation:** Şifre doğrulama ve güvenlik
- **Input Validation:** Zod ile veri doğrulama
- **CORS Protection:** Cross-origin güvenlik
- **SQL Injection Protection:** Parametrized queries

## 📈 Performans

- **Pagination:** 10 kayıt/sayfa ile hızlı yükleme
- **Lazy Loading:** Gerektiğinde veri yükleme
- **Caching:** LocalStorage ile session cache
- **Optimized Queries:** Veritabanı optimizasyonu

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [@mithateligur](https://github.com/mithateligur)

Proje Linki: [https://github.com/mithateligur/carwashing-project](https://github.com/mithateligur/carwashing-project)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
=======
# CarWashing Service Backend

🚗 Production-grade backend API

## Quick Start
```bash
npm install
npm run dev
### **7. Klasör yapısı oluştur**
```bash
mkdir -p src
mkdir -p src/config
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p src/services
cat > src/server.ts << 'EOF'
import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/health', async () => {
  return { 
    status: 'ok', 
    service: 'CarWashing Backend',
    timestamp: new Date().toISOString() 
  };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running at http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
>>>>>>> afa92a3fe6fa227c04b076adc33c5f7c569b2fbc
