# Velora Backend API

Backend API untuk aplikasi Velora - platform kesehatan ibu hamil yang comprehensive.

## 🚀 Features

- **Authentication & Authorization**

  - User registration & login
  - JWT-based authentication
  - Password reset dengan OTP
  - Profile management

- **Health Risk Prediction**

  - Integrasi dengan ML API untuk prediksi risiko kesehatan
  - Riwayat prediksi
  - Statistik kesehatan

- **Journal Articles**

  - CRUD operations untuk artikel
  - Bookmark sistem
  - Kategori dan pencarian
  - Pagination

- **Gallery Management**

  - Upload foto kehamilan
  - Optimasi gambar otomatis
  - Timeline foto berdasarkan minggu kehamilan

- **Pregnancy Tracking**
  - Profil kehamilan
  - Timeline tracking layanan kesehatan
  - Monitoring gejala
  - Data minggu kehamilan

## 🛠️ Tech Stack

- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Sharp
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Email**: Nodemailer
- **Deployment**: Vercel (Serverless)

## 🌐 Deployment

### 🚀 Deploy via Vercel Dashboard (Recommended)

**Quick Setup:**

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables
4. Deploy!

📖 **Complete Guide**: [DEPLOY_VIA_WEB.md](./DEPLOY_VIA_WEB.md)  
📋 **Environment Variables**: [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md)

### Prerequisites

1. **Supabase Setup**

   - Create project and setup database
   - Run SQL scripts in `database/` folder
   - Get API credentials

2. **GitHub Repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Environment Variables Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - 32+ character secret for JWT tokens
- `ALLOWED_ORIGINS` - Frontend domain for CORS

� **Full list**: [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md)

## 📦 Installation

1. **Clone repository**

   ```bash
   cd be-velora
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file dengan konfigurasi Anda:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # External APIs
   ML_API_URL=https://dayattttt2444-maternal-health-risk.hf.space
   ```

4. **Setup database**

   - Buat project baru di [Supabase](https://supabase.com)
   - Jalankan SQL schema di `database/schema.sql` di SQL Editor Supabase
   - Update environment variables dengan credentials Supabase Anda

5. **Start development server**

   ```bash
   npm run dev
   ```

   Server akan berjalan di `http://localhost:5000`

## 🧪 Testing

### Run All Tests

```bash
# Test locally
npm run test:comprehensive

# Test production deployment
npm run test:production
```

### Individual Tests

```bash
# Health check
npm run test:quick

# API endpoints
npm run test:api

# Simple connectivity
npm run test:simple
```

### Manual Testing

Test the API with tools like Postman or curl:

```bash
# Health check
curl https://your-api-domain.vercel.app/health

# Register user
curl -X POST https://your-api-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"081234567890","password":"TestPassword123","confirmPassword":"TestPassword123"}'
```

## 📖 API Documentation

📚 **Complete API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Reference

**Base URL**: `https://your-api-domain.vercel.app`

**Authentication**: Bearer Token in Authorization header

### Main Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/journal/articles` - Get articles
- `GET /api/gallery/photos` - Get user photos
- `GET /api/timeline/milestones` - Get pregnancy milestones

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Sarah Johnson",
  "phone": "081234567890",
  "email": "sarah@example.com",
  "password": "SecurePass123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "nama": "Sarah Johnson",
  "password": "SecurePass123"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "sarah@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "sarah@example.com",
  "newPassword": "NewSecurePass123"
}
```

### User Management Endpoints

#### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Sarah Johnson Updated",
  "username": "sarahjohnson"
}
```

#### Change Password

```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### Health Prediction Endpoints

#### Predict Health Risk

```http
POST /api/health/predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "Age": 25,
  "SystolicBP": 120,
  "DiastolicBP": 80,
  "BS": 7.5,
  "BodyTemp": 98.6,
  "HeartRate": 72
}
```

#### Get Prediction History

```http
GET /api/health/history?page=1&limit=10
Authorization: Bearer <token>
```

### Journal Endpoints

#### Get Articles

```http
GET /api/journal/articles?page=1&limit=10&category=Nutrition&search=mual
```

#### Get Single Article

```http
GET /api/journal/articles/:id
```

#### Create Article (Authenticated)

```http
POST /api/journal/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tips Mengatasi Mual",
  "content": "Artikel lengkap tentang...",
  "category": "Trimester 1",
  "published": true
}
```

#### Bookmark Article

```http
POST /api/journal/articles/:id/bookmark
Authorization: Bearer <token>
```

### Gallery Endpoints

#### Upload Photo

```http
POST /api/gallery/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <file>,
  "title": "Foto USG 20 Minggu",
  "description": "Hasil USG minggu ke-20",
  "pregnancy_week": 20
}
```

#### Get Photos

```http
GET /api/gallery/photos?page=1&limit=12
Authorization: Bearer <token>
```

### Timeline Endpoints

#### Create/Update Pregnancy Profile

```http
POST /api/timeline/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "due_date": "2024-09-15",
  "last_menstrual_period": "2023-12-08",
  "current_weight": 65.5,
  "pre_pregnancy_weight": 58.0,
  "height": 165.0
}
```

#### Save Timeline Entry

```http
POST /api/timeline/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "pregnancy_week": 20,
  "health_services": {
    "bloodPressure": true,
    "ultrasound": true
  },
  "symptoms": {
    "nausea": false,
    "backPain": true
  },
  "health_services_notes": "Semua pemeriksaan normal",
  "symptoms_notes": "Sedikit nyeri punggung"
}
```

## 🔧 Development

### Project Structure

```
be-velora/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   ├── notFound.js          # 404 handler
│   │   └── upload.js            # File upload & processing
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── user.js              # User management routes
│   │   ├── health.js            # Health prediction routes
│   │   ├── journal.js           # Journal article routes
│   │   ├── gallery.js           # Gallery routes
│   │   └── timeline.js          # Pregnancy tracking routes
│   └── server.js                # Main server file
├── database/
│   └── schema.sql               # Database schema
├── uploads/                     # Uploaded files directory
├── package.json
└── README.md
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server

# Testing
npm test             # Run tests

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Environment Variables

| Variable                    | Description                          | Required           |
| --------------------------- | ------------------------------------ | ------------------ |
| `NODE_ENV`                  | Environment (development/production) | Yes                |
| `PORT`                      | Server port                          | No (default: 5000) |
| `SUPABASE_URL`              | Supabase project URL                 | Yes                |
| `SUPABASE_ANON_KEY`         | Supabase anon key                    | Yes                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key            | Yes                |
| `JWT_SECRET`                | JWT signing secret                   | Yes                |
| `JWT_EXPIRES_IN`            | JWT expiration time                  | No (default: 7d)   |
| `ML_API_URL`                | Machine Learning API URL             | Yes                |
| `ALLOWED_ORIGINS`           | CORS allowed origins                 | Yes                |

## 🚀 Deployment

### Supabase Setup

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy project URL dan API keys
3. Jalankan script SQL di `database/schema.sql`
4. Enable Row Level Security di dashboard Supabase

### Production Deployment

1. **Set environment variables**
2. **Install dependencies**
   ```bash
   npm ci --only=production
   ```
3. **Start server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs dengan salt rounds 12
- **Rate Limiting**: Limit requests per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: express-validator
- **File Upload Security**: Type validation, size limits
- **Row Level Security**: Database-level access control

## 🤝 Integration

### Frontend Integration

Backend ini dirancang untuk terintegrasi dengan frontend Next.js Velora. Pastikan environment variable `ALLOWED_ORIGINS` mencakup URL frontend Anda.

### ML API Integration

Backend terintegrasi dengan ML API untuk prediksi risiko kesehatan. Jika ML API tidak tersedia, sistem akan menggunakan fallback rule-based prediction.

## 📝 API Response Format

Semua API menggunakan format response yang konsisten:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (jika ada)
  ]
}
```

## 🐛 Error Handling

Backend menggunakan centralized error handling dengan format yang konsisten dan logging untuk debugging.

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging dengan Morgan
- Error logging ke console

## 🔄 Updates

- Update dependencies secara berkala
- Monitor security advisories
- Review dan update environment variables

## 📞 Support

Untuk support dan pertanyaan, silakan buka issue di repository ini atau hubungi tim development.
