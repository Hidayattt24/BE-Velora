# 🚀 Velora Backend API - Complete Documentation

## 📋 Overview

Velora Backend API adalah RESTful API untuk aplikasi kesehatan maternal yang mendukung:
- 🔐 Autentikasi pengguna dengan JWT
- 👤 Manajemen profil pengguna
- 🏥 Prediksi risiko kesehatan dengan ML
- 📖 Sistem jurnal artikel kesehatan
- 📸 Galeri foto kehamilan
- 📅 Timeline tracking kehamilan

## 🌐 Base URLs

- **Local Development**: `http://localhost:5000`
- **Vercel Production**: `https://your-deployment-url.vercel.app`

## 🔑 Authentication

API menggunakan JWT (JSON Web Tokens). Include token in Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 📊 Response Format

Semua endpoint menggunakan format response yang konsisten:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🚦 HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Access denied)
- `404` - Not Found (Resource not found)
- `422` - Validation Error (Input validation failed)
- `500` - Internal Server Error

---

## 🏥 Health Check

### GET /health

Checks API server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Velora API Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "fullName": "Sarah Johnson",
  "phone": "081234567890",
  "email": "sarah@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `fullName`: 2-100 characters
- `phone`: Valid Indonesian mobile number
- `email`: Valid email format
- `password`: Min 8 chars, must contain lowercase, uppercase, and number

**Response (201):**
```json
{
  "success": true,
  "message": "Akun berhasil dibuat",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "081234567890",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login

Login with existing account.

**Request Body:**
```json
{
  "nama": "sarah@example.com",
  "password": "SecurePass123"
}
```

**Note:** `nama` can be either email or full name.

**Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "081234567890",
      "last_login": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/forgot-password

Request password reset OTP.

**Request Body:**
```json
{
  "email": "sarah@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Kode OTP telah dikirim ke email Anda",
  "data": {
    "email": "sarah@example.com"
  }
}
```

### POST /api/auth/verify-otp

Verify OTP for password reset.

**Request Body:**
```json
{
  "email": "sarah@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP berhasil diverifikasi",
  "data": {
    "verified": true
  }
}
```

### POST /api/auth/reset-password

Reset password after OTP verification.

**Request Body:**
```json
{
  "email": "sarah@example.com",
  "newPassword": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

### GET /api/auth/me
*🔐 Requires Authentication*

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "081234567890",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 👤 User Management Endpoints

### GET /api/users/profile
*🔐 Requires Authentication*

Get detailed user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Sarah Johnson",
      "username": "sarahjohnson",
      "phone": "081234567890",
      "email": "sarah@example.com",
      "profile_picture": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/users/profile
*🔐 Requires Authentication*

Update user profile information.

**Request Body:**
```json
{
  "fullName": "Sarah Johnson Updated",
  "username": "sarahjohnson2024"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Sarah Johnson Updated",
      "username": "sarahjohnson2024",
      "email": "sarah@example.com",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/users/change-password
*🔐 Requires Authentication*

Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

### PUT /api/users/change-email
*🔐 Requires Authentication*

Change user email address.

**Request Body:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "CurrentPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email berhasil diubah",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newemail@example.com",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE /api/users/delete-account
*🔐 Requires Authentication*

Delete user account (soft delete).

**Request Body:**
```json
{
  "password": "CurrentPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Akun berhasil dihapus"
}
```

---

## 🏥 Health Prediction Endpoints

### POST /api/health/predict
*🔐 Requires Authentication*

Predict maternal health risk using ML model.

**Request Body:**
```json
{
  "Age": 25,
  "SystolicBP": 120,
  "DiastolicBP": 80,
  "BS": 7.5,
  "BodyTemp": 98.6,
  "HeartRate": 72
}
```

**Validation Rules:**
- `Age`: 10-80 years
- `SystolicBP`: 70-200 mmHg
- `DiastolicBP`: 40-140 mmHg
- `BS`: 6.0-19.0 mmol/L
- `BodyTemp`: 95.0-104.0°F
- `HeartRate`: 50-120 bpm

**Response (200):**
```json
{
  "success": true,
  "message": "Prediksi berhasil dilakukan",
  "data": {
    "risk_level": "low risk",
    "confidence": 0.85,
    "recommendations": [
      "Lanjutkan pola hidup sehat",
      "Kontrol rutin setiap bulan"
    ],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/health/history
*🔐 Requires Authentication*

Get user's health prediction history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "id": "uuid",
        "age": 25,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "blood_sugar": 7.5,
        "body_temp": 98.6,
        "heart_rate": 72,
        "risk_level": "low risk",
        "prediction_result": {...},
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/health/statistics
*🔐 Requires Authentication*

Get user's health statistics summary.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_predictions": 15,
    "high_risk_count": 2,
    "mid_risk_count": 5,
    "low_risk_count": 8
  }
}
```

### GET /api/health/parameters

Get health parameters reference data for frontend.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "age_ranges": [
      {"label": "10-20 tahun", "value": 15},
      {"label": "21-25 tahun", "value": 23}
    ],
    "blood_pressure_ranges": [
      {"label": "Normal", "systolic": "90-120", "diastolic": "60-80"}
    ],
    "blood_sugar_ranges": [
      {"label": "Normal", "min": 6.0, "max": 7.8}
    ]
  }
}
```

---

## 📖 Journal Endpoints

### GET /api/journal/articles

Get published articles with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title and content

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Tips Mengatasi Mual saat Hamil",
        "content": "Artikel lengkap...",
        "excerpt": "Morning sickness adalah...",
        "category": "Trimester 1",
        "image": "/images/nausea-tips.jpg",
        "tags": ["mual", "trimester1", "tips"],
        "views": 150,
        "read_time": 5,
        "published": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "author": {
          "id": "uuid",
          "full_name": "Dr. Sarah",
          "profile_picture": null
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/journal/articles/:id

Get single article by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "title": "Tips Mengatasi Mual saat Hamil",
      "content": "Artikel lengkap dengan tips...",
      "excerpt": "Morning sickness adalah...",
      "category": "Trimester 1",
      "image": "/images/nausea-tips.jpg",
      "tags": ["mual", "trimester1", "tips"],
      "views": 151,
      "read_time": 5,
      "published": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "full_name": "Dr. Sarah",
        "profile_picture": null
      }
    }
  }
}
```

### GET /api/journal/categories

Get all available article categories.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {"name": "Trimester 1", "count": 15},
      {"name": "Trimester 2", "count": 12},
      {"name": "Trimester 3", "count": 10},
      {"name": "Nutrisi", "count": 8}
    ]
  }
}
```

### POST /api/journal/articles
*🔐 Requires Authentication*

Create new article (for content creators).

**Request Body:**
```json
{
  "title": "Tips Nutrisi Trimester Pertama",
  "content": "Artikel lengkap tentang nutrisi...",
  "category": "Nutrisi",
  "excerpt": "Nutrisi yang tepat sangat penting...",
  "image": "/images/nutrition.jpg",
  "tags": ["nutrisi", "trimester1", "vitamin"],
  "published": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Artikel berhasil dibuat",
  "data": {
    "article": {
      "id": "uuid",
      "title": "Tips Nutrisi Trimester Pertama",
      "category": "Nutrisi",
      "published": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/journal/articles/:id
*🔐 Requires Authentication*

Update existing article (author only).

**Request Body:**
```json
{
  "title": "Tips Nutrisi Trimester Pertama (Updated)",
  "content": "Artikel yang telah diperbarui...",
  "published": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Artikel berhasil diperbarui",
  "data": {
    "article": {
      "id": "uuid",
      "title": "Tips Nutrisi Trimester Pertama (Updated)",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE /api/journal/articles/:id
*🔐 Requires Authentication*

Delete article (author only).

**Response (200):**
```json
{
  "success": true,
  "message": "Artikel berhasil dihapus"
}
```

### POST /api/journal/articles/:id/bookmark
*🔐 Requires Authentication*

Bookmark/unbookmark article.

**Response (200):**
```json
{
  "success": true,
  "message": "Artikel berhasil dibookmark",
  "data": {
    "bookmarked": true
  }
}
```

### GET /api/journal/bookmarks
*🔐 Requires Authentication*

Get user's bookmarked articles.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Tips Mengatasi Mual saat Hamil",
        "excerpt": "Morning sickness adalah...",
        "category": "Trimester 1",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "itemsPerPage": 10
    }
  }
}
```

---

## 📸 Gallery Endpoints

### GET /api/gallery/photos
*🔐 Requires Authentication*

Get user's photos with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `pregnancy_week` (optional): Filter by pregnancy week

**Response (200):**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "uuid",
        "title": "USG 20 Minggu",
        "description": "Hasil USG minggu ke-20",
        "image_url": "/uploads/photo-123.jpg",
        "pregnancy_week": 20,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 30,
      "itemsPerPage": 12
    }
  }
}
```

### GET /api/gallery/photos/:id
*🔐 Requires Authentication*

Get single photo by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "photo": {
      "id": "uuid",
      "title": "USG 20 Minggu",
      "description": "Hasil USG minggu ke-20 kehamilan",
      "image_url": "/uploads/photo-123.jpg",
      "pregnancy_week": 20,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/gallery/upload
*🔐 Requires Authentication*

Upload photo to gallery.

**Request (Multipart Form):**
- `image`: Image file (JPEG, PNG, WebP, max 10MB)
- `title`: Photo title (optional, 1-100 chars)
- `description`: Photo description (optional, max 500 chars)
- `pregnancy_week`: Pregnancy week (optional, 1-42)

**Response (201):**
```json
{
  "success": true,
  "message": "Foto berhasil diupload",
  "data": {
    "photo": {
      "id": "uuid",
      "title": "USG 20 Minggu",
      "image_url": "/uploads/photo-123.jpg",
      "pregnancy_week": 20,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/gallery/photos/:id
*🔐 Requires Authentication*

Update photo information.

**Request Body:**
```json
{
  "title": "USG 20 Minggu - Updated",
  "description": "Hasil USG yang telah diperbarui",
  "pregnancy_week": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Foto berhasil diperbarui",
  "data": {
    "photo": {
      "id": "uuid",
      "title": "USG 20 Minggu - Updated",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE /api/gallery/photos/:id
*🔐 Requires Authentication*

Delete photo from gallery.

**Response (200):**
```json
{
  "success": true,
  "message": "Foto berhasil dihapus"
}
```

---

## 📅 Timeline Endpoints

### GET /api/timeline/profile
*🔐 Requires Authentication*

Get user's pregnancy profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "due_date": "2024-12-15",
      "last_menstrual_period": "2024-03-10",
      "current_weight": 65.5,
      "pre_pregnancy_weight": 58.0,
      "height": 165.0,
      "current_pregnancy_week": 20,
      "days_until_due": 140,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/timeline/profile
*🔐 Requires Authentication*

Create/update pregnancy profile.

**Request Body:**
```json
{
  "due_date": "2024-12-15",
  "last_menstrual_period": "2024-03-10",
  "current_weight": 65.5,
  "pre_pregnancy_weight": 58.0,
  "height": 165.0
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Profil kehamilan berhasil disimpan",
  "data": {
    "profile": {
      "id": "uuid",
      "due_date": "2024-12-15",
      "current_pregnancy_week": 20,
      "days_until_due": 140,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /api/timeline/entries
*🔐 Requires Authentication*

Get user's timeline entries.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "pregnancy_week": 20,
        "health_services": {
          "bloodPressure": true,
          "ultrasound": true,
          "weightMeasurement": true
        },
        "symptoms": {
          "nausea": false,
          "backPain": true,
          "fatigue": false
        },
        "health_services_notes": "Semua pemeriksaan normal",
        "symptoms_notes": "Sedikit nyeri punggung",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/timeline/entries
*🔐 Requires Authentication*

Create timeline entry for specific week.

**Request Body:**
```json
{
  "pregnancy_week": 20,
  "health_services": {
    "bloodPressure": true,
    "ultrasound": true,
    "weightMeasurement": true
  },
  "symptoms": {
    "nausea": false,
    "backPain": true,
    "fatigue": false
  },
  "health_services_notes": "Semua pemeriksaan normal",
  "symptoms_notes": "Sedikit nyeri punggung"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Data timeline berhasil disimpan",
  "data": {
    "entry": {
      "id": "uuid",
      "pregnancy_week": 20,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /api/timeline/entries/:week
*🔐 Requires Authentication*

Get timeline entry for specific pregnancy week.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "uuid",
      "pregnancy_week": 20,
      "health_services": {...},
      "symptoms": {...},
      "health_services_notes": "Semua pemeriksaan normal",
      "symptoms_notes": "Sedikit nyeri punggung",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /api/timeline/milestones

Get pregnancy milestones information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "milestones": [
      {
        "week": 4,
        "title": "Embrio Terbentuk",
        "description": "Jantung mulai berdetak",
        "trimester": 1
      },
      {
        "week": 12,
        "title": "Akhir Trimester Pertama",
        "description": "Risiko keguguran menurun",
        "trimester": 1
      }
    ]
  }
}
```

### GET /api/timeline/health-services

Get available health services data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "healthServices": [
      {
        "id": "bloodPressure",
        "title": "Pengukuran Tekanan Darah",
        "description": "Monitoring tekanan darah secara rutin",
        "recommendedWeeks": [4, 6, 8, 10, 12, 14, 16, 18, 20]
      },
      {
        "id": "ultrasound",
        "title": "USG (Ultrasonografi)",
        "description": "Pemeriksaan perkembangan janin",
        "recommendedWeeks": [8, 12, 20, 32]
      }
    ]
  }
}
```

### GET /api/timeline/symptoms

Get available symptoms data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "symptoms": [
      {
        "id": "nausea",
        "title": "Mual dan Muntah",
        "description": "Morning sickness atau mual sepanjang hari",
        "isDanger": false
      },
      {
        "id": "bleeding",
        "title": "Pendarahan",
        "description": "Pendarahan vagina tidak normal",
        "isDanger": true
      }
    ]
  }
}
```

---

## 🔧 Development & Testing

### Test Deployment

```bash
# Test local development
npm run test:comprehensive

# Test production deployment
API_URL=https://your-deployment-url.vercel.app node test-deployment.js
```

### Environment Variables

Required for deployment:

```env
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

Optional:

```env
ML_API_URL=https://your-ml-api.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🚀 Deployment to Vercel

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Set Environment Variables

```bash
# Use the setup script
chmod +x setup-env.sh
./setup-env.sh

# Or manually
vercel env add SUPABASE_URL production
vercel env add JWT_SECRET production
# ... add other variables
```

### Test Deployment

```bash
# Test all endpoints
API_URL=https://your-deployment-url.vercel.app node test-deployment.js
```

---

## 📊 API Status & Monitoring

- **Health Check**: `GET /health`
- **Uptime Monitoring**: Vercel Analytics
- **Error Logging**: Console logs
- **Performance**: Vercel Functions dashboard

---

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcryptjs)
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Input Validation
- ✅ File Upload Security
- ✅ Helmet Security Headers

---

## 📞 Support

For support and questions:
- 📧 Email: support@velora.app
- 🐛 Issues: GitHub Repository
- 📚 Documentation: This API docs

---

**API Version**: 1.0.0  
**Last Updated**: December 2024  
**Deployment**: Vercel Serverless Functions
