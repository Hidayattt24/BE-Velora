# Velora Backend API

Backend API untuk aplikasi Velora - Aplikasi Kesehatan Ibu Hamil berbasis Express.js dan Supabase.

## 🚀 Fitur Utama

- **Autentikasi & Autorisasi**: Sistem login/register dengan JWT
- **Profil Pengguna**: Manajemen data pengguna dan profil
- **Prediksi Kesehatan**: Integrasi dengan model ML untuk prediksi risiko kesehatan
- **Timeline Kehamilan**: Tracking progress kehamilan
- **Galeri**: Upload dan manajemen foto/video
- **Diagnosa**: Sistem diagnosa dan rekomendasi

## 📁 Struktur Folder

```
be-velora/
├── src/                    # Source code utama
│   ├── config/            # Konfigurasi database dan setup
│   ├── middleware/        # Middleware Express
│   ├── routes/           # Route handlers
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point aplikasi
├── docs/                 # Dokumentasi lengkap
├── scripts/              # Script deployment dan setup
├── tests/                # File testing
├── database/             # SQL schema dan migrations
├── uploads/              # File uploads
└── api/                  # Vercel serverless functions
```

## 🛠️ Setup Development

1. **Clone dan Install Dependencies**

   ```bash
   cd be-velora
   npm install
   ```

2. **Setup Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

- `npm start` - Jalankan production server
- `npm run dev` - Jalankan development server dengan nodemon
- `npm run test:api` - Test API endpoints
- `npm run test:comprehensive` - Test komprehensif semua endpoint
- `npm run deploy` - Deploy ke Vercel

## 🌐 API Endpoints

### Core Endpoints

- `GET /` - Welcome message dan info API
- `GET /health` - Health check
- `GET /docs` - Dokumentasi API

### Authentication

- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/refresh` - Refresh JWT token

### User Management

- `GET /api/users/profile` - Get profil pengguna
- `PUT /api/users/profile` - Update profil pengguna

### Health Prediction

- `POST /api/health/predict` - Prediksi risiko kesehatan
- `GET /api/health/history` - Riwayat prediksi

### Timeline

- `GET /api/timeline` - Get timeline kehamilan
- `POST /api/timeline` - Tambah milestone timeline

### Gallery

- `GET /api/gallery` - Get semua foto/video
- `POST /api/gallery/upload` - Upload foto/video
- `DELETE /api/gallery/:id` - Hapus foto/video

### Diagnosa

- `POST /api/diagnosa/analyze` - Analisis gejala
- `GET /api/diagnosa/recommendations` - Get rekomendasi

## 🔧 Environment Variables

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ML API
ML_API_URL=your_ml_api_url
```

## 📖 Dokumentasi Lengkap

Lihat folder `docs/` untuk dokumentasi lengkap:

- `API_DOCUMENTATION.md` - Dokumentasi API lengkap
- `DEPLOYMENT_GUIDE.md` - Panduan deployment
- `ENV_VARIABLES_CHECKLIST.md` - Checklist environment variables

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

### Manual Deployment

Lihat `docs/DEPLOYMENT_GUIDE.md` untuk panduan deployment manual.

## 🧪 Testing

```bash
# Test semua endpoint
npm run test:comprehensive

# Test API sederhana
npm run test:simple

# Test deployment
npm run test:deployment
```

## 📝 License

MIT License - Lihat file LICENSE untuk detail lengkap.

## 👥 Tim Pengembang

Velora Team - Aplikasi Kesehatan Ibu Hamil

---

**Note**: Fitur journal telah dihapus karena data artikel sekarang dikelola di frontend.
