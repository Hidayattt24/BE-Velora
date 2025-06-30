<div align="center">
  <img src="../fe-velora/public/landing/logononame.svg" alt="Velora Logo" width="120" height="120">
  
  # 🌸 Velora Backend API
  
  **RESTful API untuk Platform Kesehatan Ibu Hamil - Express.js & Supabase**
  
  [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://api-velora.vercel.app)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  
  [🚀 Live API](https://api-velora.vercel.app) • [📖 API Docs](https://api-velora.vercel.app/docs) • [🔗 Frontend](https://velora-lake.vercel.app)
</div>

---

## 💝 Tentang Velora Backend

**Velora Backend** adalah RESTful API yang menjadi backbone dari platform kesehatan ibu hamil Velora. Dibangun dengan Express.js dan Supabase, API ini menyediakan layanan autentikasi, manajemen data pengguna, prediksi kesehatan AI, dan berbagai fitur pendukung lainnya.

### 🎯 Teknologi & Arsitektur

- **Runtime**: Node.js dengan Express.js framework
- **Database**: Supabase (PostgreSQL) dengan Row Level Security
- **Authentication**: JWT dengan refresh token mechanism
- **File Storage**: Supabase Storage untuk foto/video
- **AI Integration**: Machine Learning API untuk prediksi kesehatan
- **Deployment**: Vercel Serverless Functions
- **Security**: Rate limiting, CORS, input validation

## ✨ Fitur API Utama

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**

- JWT-based authentication dengan refresh tokens
- Password hashing dengan bcrypt
- Rate limiting untuk mencegah abuse
- CORS configuration untuk keamanan
- Input validation & sanitization

### 👤 **User Management**

- Registrasi & login pengguna
- Profil management dengan foto upload
- Data kehamilan & medical records
- Privacy settings & data export

### 🏥 **Health Prediction AI**

- Prediksi risiko kesehatan (84.21% akurasi)
- Integrasi dengan ML model di HuggingFace
- Riwayat prediksi & tracking
- Export laporan dalam format PDF

</td>
<td width="50%">

### 📸 **Gallery Management**

- Upload foto/video ke Supabase Storage
- Resize & optimize gambar otomatis
- Organisasi berdasarkan tanggal & kategori
- Bulk operations & metadata extraction

### 📅 **Timeline Tracking**

- Milestone kehamilan per minggu
- Progress tracking & reminder
- Custom events & appointments
- Data visualization ready

### 🔄 **Real-time Features**

- WebSocket support untuk notifikasi
- Live data synchronization
- Push notifications (planning)
- Offline data caching support

</td>
</tr>
</table>

## 🏗️ Arsitektur & Struktur

### **Project Structure**

```
be-velora/
├── 📂 api/                     # Vercel serverless functions
│   └── index.js               # Main serverless entry point
├── 📂 src/                     # Source code utama
│   ├── 📂 config/             # Database & environment config
│   │   ├── database.js        # Supabase client setup
│   │   └── corsConfig.js      # CORS configuration
│   ├── 📂 middleware/         # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── rateLimiter.js    # Rate limiting
│   │   ├── upload.js         # File upload handling
│   │   └── validation.js     # Request validation
│   ├── 📂 routes/            # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User management
│   │   ├── health.js        # Health prediction
│   │   ├── gallery.js       # Photo/video management
│   │   ├── timeline.js      # Pregnancy timeline
│   │   └── diagnosa.js      # Diagnosis & recommendations
│   ├── 📂 utils/            # Utility functions
│   │   ├── imageProcessor.js # Image optimization
│   │   ├── validators.js    # Data validation
│   │   ├── emailService.js  # Email sending
│   │   └── mlIntegration.js # ML API integration
│   └── server.js            # Express app setup
├── 📂 database/              # Database schemas & migrations
│   ├── schema.sql           # Complete database schema
│   ├── migrations/          # Database migration files
│   └── seeds/              # Sample data for testing
├── 📂 docs/                 # API documentation
│   ├── README.md           # Comprehensive documentation
│   ├── API_ENDPOINTS.md    # Detailed API reference
│   └── DEPLOYMENT.md       # Deployment guide
├── 📂 tests/                # Testing suite
│   ├── api-tests/          # API endpoint tests
│   ├── integration/        # Integration tests
│   └── performance/        # Load testing
├── 📂 scripts/              # Automation scripts
│   ├── deploy.ps1          # PowerShell deployment
│   └── setup-db.js        # Database setup
└── 📄 vercel.json          # Vercel configuration
```

### **Database Schema Overview**

```sql
Users              → Authentication & profile data
UserProfiles       → Detailed pregnancy information
HealthPredictions  → AI prediction history
Gallery            → Photo/video metadata
Timeline           → Pregnancy milestones
UserSessions       → JWT session management
```

## � Quick Start

### **Prerequisites**

```bash
Node.js 18.0.0+
npm 9.0.0+
Git
Supabase Account (untuk database)
```

### **Local Development Setup**

1. **Clone Repository**

   ```bash
   git clone https://github.com/Hidayattt24/be-velora.git
   cd be-velora
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi yang sesuai
   ```

4. **Database Setup**

   ```bash
   # Import schema ke Supabase
   npm run db:setup

   # Atau manual import file database/schema.sql
   ```

5. **Run Development Server**

   ```bash
   npm run dev
   # Server berjalan di http://localhost:5000
   ```

6. **Test API Endpoints**

   ```bash
   # Test basic endpoints
   npm run test:api

   # Comprehensive testing
   npm run test:comprehensive
   ```

### **Production Deployment**

#### **Deploy ke Vercel (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

#### **Environment Variables di Vercel**

Set environment variables berikut di Vercel Dashboard:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `ML_API_URL`
- Dan semua variabel lainnya dari `.env.example`

## 📋 NPM Scripts

```bash
# Development
npm run dev              # Start development server with nodemon
npm run start           # Start production server

# Testing
npm run test           # Run all tests
npm run test:api       # Test API endpoints only
npm run test:comprehensive  # Full integration testing
npm run test:performance   # Load testing

# Database
npm run db:setup       # Setup database schema
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed sample data

# Deployment
npm run deploy         # Deploy to Vercel
npm run build         # Build for production

# Utilities
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run docs:generate # Generate API documentation
```

## 🌐 API Endpoints

### **Base URL**

- **Production**: `https://api-velora.vercel.app`
- **Development**: `http://localhost:5000`

### **Core System**

| Method | Endpoint  | Description                   | Auth Required |
| ------ | --------- | ----------------------------- | ------------- |
| `GET`  | `/`       | Welcome message & API info    | ❌            |
| `GET`  | `/health` | Health check & system status  | ❌            |
| `GET`  | `/docs`   | Interactive API documentation | ❌            |

### **Authentication** 🔐

| Method | Endpoint                    | Description               | Body Required |
| ------ | --------------------------- | ------------------------- | ------------- |
| `POST` | `/api/auth/register`        | Registrasi pengguna baru  | ✅            |
| `POST` | `/api/auth/login`           | Login pengguna            | ✅            |
| `POST` | `/api/auth/refresh`         | Refresh JWT token         | ✅            |
| `POST` | `/api/auth/logout`          | Logout & invalidate token | ✅            |
| `POST` | `/api/auth/forgot-password` | Request reset password    | ✅            |
| `POST` | `/api/auth/reset-password`  | Reset password dengan OTP | ✅            |

### **User Management** 👤

| Method   | Endpoint                   | Description            | Auth Required |
| -------- | -------------------------- | ---------------------- | ------------- |
| `GET`    | `/api/users/profile`       | Get user profile       | ✅            |
| `PUT`    | `/api/users/profile`       | Update user profile    | ✅            |
| `POST`   | `/api/users/upload-avatar` | Upload profile picture | ✅            |
| `DELETE` | `/api/users/account`       | Delete user account    | ✅            |

### **Health Prediction** 🏥

| Method | Endpoint                  | Description               | Auth Required |
| ------ | ------------------------- | ------------------------- | ------------- |
| `POST` | `/api/health/predict`     | Prediksi risiko kesehatan | ✅            |
| `GET`  | `/api/health/history`     | Riwayat prediksi pengguna | ✅            |
| `GET`  | `/api/health/history/:id` | Detail prediksi tertentu  | ✅            |
| `POST` | `/api/health/export-pdf`  | Export laporan PDF        | ✅            |

### **Gallery Management** 📸

| Method   | Endpoint              | Description                | Auth Required |
| -------- | --------------------- | -------------------------- | ------------- |
| `GET`    | `/api/gallery`        | Get all user photos/videos | ✅            |
| `POST`   | `/api/gallery/upload` | Upload new media file      | ✅            |
| `PUT`    | `/api/gallery/:id`    | Update media metadata      | ✅            |
| `DELETE` | `/api/gallery/:id`    | Delete media file          | ✅            |

### **Timeline Tracking** 📅

| Method   | Endpoint                      | Description            | Auth Required |
| -------- | ----------------------------- | ---------------------- | ------------- |
| `GET`    | `/api/timeline`               | Get pregnancy timeline | ✅            |
| `POST`   | `/api/timeline/milestone`     | Add new milestone      | ✅            |
| `PUT`    | `/api/timeline/milestone/:id` | Update milestone       | ✅            |
| `DELETE` | `/api/timeline/milestone/:id` | Delete milestone       | ✅            |

### **Diagnosis & Recommendations** 🔍

| Method | Endpoint                        | Description                | Auth Required |
| ------ | ------------------------------- | -------------------------- | ------------- |
| `POST` | `/api/diagnosa/analyze`         | Analyze symptoms           | ✅            |
| `GET`  | `/api/diagnosa/recommendations` | Get health recommendations | ✅            |
| `GET`  | `/api/diagnosa/history`         | Diagnosis history          | ✅            |

## 🔧 Environment Variables

```env
# Development Environment Variables
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://baisblpccyajqfasyicx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXNibHBjY3lhanFmYXN5aWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTY5NTksImV4cCI6MjA2NjY5Mjk1OX0.7kSzzFSaztQqk2znMiAso5CLFiwhuZlbOAcA0Dysiyo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXNibHBjY3lhanFmYXN5aWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExNjk1OSwiZXhwIjoyMDY2NjkyOTU5fQ.okVtRLR1obsLPYbx7OAYQhADHArKUBbpiP2wNB062h8

# JWT Configuration
JWT_SECRET=RtRPUuO0rDbBuFqjByFKAh8eMaOhOqfX3QM8dBtxWvC8qIBkN51mU54dNUpADfVGh+wmdmphaHtdqQjb75Lp9Q==
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ML API Configuration
ML_API_URL=https://dayattttt2444-maternal-health-risk.hf.space

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# OTP Configuration
OTP_EXPIRES_IN=600000
```

## � Performance & Monitoring

### **Performance Metrics**

- **Response Time**: < 200ms average
- **Uptime**: 99.9% target
- **Throughput**: 1000+ requests/minute
- **Database Connections**: Optimized pooling

### **Monitoring & Logging**

```bash
# Health check endpoint
curl https://api-velora.vercel.app/health

# Response:
{
  "status": "healthy",
  "timestamp": "2025-01-28T10:00:00Z",
  "uptime": "99.9%",
  "database": "connected",
  "version": "1.0.0"
}
```

### **Rate Limiting**

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: `X-RateLimit-*` included in responses

---

## 🧪 Testing Guide

### **API Testing dengan cURL**

#### **Health Check**

```bash
curl -X GET https://api-velora.vercel.app/health
```

#### **User Registration**

```bash
curl -X POST https://api-velora.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123",
    "phone": "+628123456789"
  }'
```

#### **User Login**

```bash
curl -X POST https://api-velora.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securePassword123"
  }'
```

#### **Health Prediction (with auth)**

```bash
curl -X POST https://api-velora.vercel.app/api/health/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "age": 28,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "bs": 6.5,
    "body_temp": 98.6,
    "heart_rate": 76
  }'
```

### **Automated Testing**

```bash
# Install testing dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:auth        # Authentication tests
npm run test:users       # User management tests
npm run test:health      # Health prediction tests
npm run test:performance # Load testing
```

---

## 🔧 Advanced Configuration

### **Custom Middleware Setup**

```javascript
// Rate limiting configuration
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
```

### **Database Connection Optimization**

```javascript
// Supabase client with connection pooling
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

---

## 📝 License & Legal

### **MIT License**

```
MIT License

Copyright (c) 2025 Velora Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### **Data Privacy & Security**

- **GDPR Compliant**: User data dapat dihapus sepenuhnya
- **Encryption**: Data sensitif dienkripsi at-rest dan in-transit
- **Audit Logs**: Semua akses data ter-record
- **Data Retention**: Sesuai dengan kebijakan privacy

---

## 👥 Tim Pengembang & Support

### **Core Development Team**

<table>
<tr>
<td align="center">
<img src="https://github.com/Hidayattt24.png" width="100px;" alt="Hidayat Nur Hakim"/><br />
<sub><b>Hidayat Nur Hakim</b></sub><br />
<a href="https://github.com/Hidayattt24" title="GitHub">@Hidayattt24</a><br />
<small>Backend Developer, DevOps Engineer</small>
</td>
<td align="center">
<img src="https://github.com/tiaraagustinn.png" width="100px;" alt="Tiara Agustin"/><br />
<sub><b>Tiara Agustin</b></sub><br />
<a href="https://github.com/tiaraagustinn" title="GitHub">@tiaraagustinn</a><br />
<small>API Documentation, Testing Strategist</small>
</td>
</tr>
</table>

### **Contribution Guidelines**

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request dengan deskripsi lengkap

### **Support & Contact**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Hidayattt24/be-velora/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Hidayattt24/be-velora/discussions)
- 📧 **Technical Support**: api-support@velora.app
- 📖 **API Documentation**: [Live Docs](https://api-velora.vercel.app/docs)

---

## 🙏 Acknowledgments

### **Technology Stack**

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express.js](https://expressjs.com/) - Web framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Serverless deployment platform
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication

### **Special Thanks**

- **Supabase Team** - untuk platform database yang amazing
- **Vercel Team** - untuk serverless deployment yang seamless
- **HuggingFace** - untuk hosting ML model kami
- **Open Source Community** - untuk semua library yang digunakan

---

<div align="center">
  
  **🚀 Production Ready • 🔒 Secure • ⚡ Fast • 📱 Mobile Optimized**
  
  [⭐ Star Repository](https://github.com/Hidayattt24/be-velora) • [🐛 Report Bug](https://github.com/Hidayattt24/be-velora/issues) • [💡 Request Feature](https://github.com/Hidayattt24/be-velora/discussions)
  
  **Live API**: [api-velora.vercel.app](https://api-velora.vercel.app) | **Frontend**: [velora-lake.vercel.app](https://velora-lake.vercel.app)
  
  © 2025 Velora Team. Dibuat dengan 💝 untuk ibu hamil Indonesia.
  
</div>
