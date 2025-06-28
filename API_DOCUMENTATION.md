# Velora Backend API Documentation

## Overview

Velora Backend API adalah RESTful API untuk aplikasi kesehatan maternal yang mendukung fitur-fitur seperti autentikasi pengguna, jurnal kesehatan, galeri foto, dan timeline kehamilan.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-api-domain.vercel.app`

## Authentication

API menggunakan JWT (JSON Web Tokens) untuk autentikasi. Token harus disertakan dalam header `Authorization` dengan format:

```
Authorization: Bearer <your_jwt_token>
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## API Endpoints

### Health Check

#### GET /health
Mengecek status server API.

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

## Authentication Endpoints

### POST /api/auth/register
Mendaftarkan pengguna baru.

**Request Body:**
```json
{
  "fullName": "Nama Lengkap",
  "phone": "081234567890",
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Nama Lengkap",
      "email": "user@example.com",
      "phone": "081234567890"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
Login pengguna.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Nama Lengkap",
      "email": "user@example.com",
      "phone": "081234567890"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/forgot-password
Meminta reset password.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda"
}
```

### POST /api/auth/reset-password
Reset password dengan token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

---

## User Endpoints

### GET /api/users/profile
Mendapatkan profil pengguna.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Nama Lengkap",
    "email": "user@example.com",
    "phone": "081234567890",
    "profilePicture": "url_to_image",
    "pregnancyStartDate": "2024-01-01",
    "dueDate": "2024-10-01",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/users/profile
Update profil pengguna.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "fullName": "Nama Lengkap Baru",
  "phone": "081234567890",
  "pregnancyStartDate": "2024-01-01",
  "dueDate": "2024-10-01"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "user": {
      // updated user data
    }
  }
}
```

### DELETE /api/users/account
Menghapus akun pengguna (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Akun berhasil dihapus"
}
```

---

## Journal Endpoints

### GET /api/journal/articles
Mendapatkan daftar artikel (public).

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)
- `category` (optional): Filter kategori
- `search` (optional): Pencarian berdasarkan judul/konten

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Judul Artikel",
        "content": "Konten artikel...",
        "category": "Nutrisi",
        "authorName": "Dr. Dokter",
        "imageUrl": "url_to_image",
        "readTime": 5,
        "published": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "limit": 10
    }
  }
}
```

### GET /api/journal/articles/:id
Mendapatkan detail artikel.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Judul Artikel",
    "content": "Konten lengkap artikel...",
    "category": "Nutrisi",
    "authorName": "Dr. Dokter",
    "imageUrl": "url_to_image",
    "readTime": 5,
    "published": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/journal/my-journal
Mendapatkan jurnal pengguna.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "date": "2024-01-01",
        "mood": "happy",
        "symptoms": ["Mual", "Pusing"],
        "notes": "Catatan hari ini...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "limit": 10
    }
  }
}
```

### POST /api/journal/my-journal
Membuat entry jurnal baru.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "mood": "happy",
  "symptoms": ["Mual", "Pusing"],
  "notes": "Catatan hari ini..."
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Entry jurnal berhasil dibuat",
  "data": {
    "id": "uuid",
    "date": "2024-01-01",
    "mood": "happy",
    "symptoms": ["Mual", "Pusing"],
    "notes": "Catatan hari ini...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/journal/my-journal/:id
Update entry jurnal.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mood": "neutral",
  "symptoms": ["Lelah"],
  "notes": "Catatan yang diperbarui..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Entry jurnal berhasil diperbarui",
  "data": {
    // updated entry data
  }
}
```

### DELETE /api/journal/my-journal/:id
Menghapus entry jurnal.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Entry jurnal berhasil dihapus"
}
```

---

## Gallery Endpoints

### GET /api/gallery/photos
Mendapatkan foto pengguna.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 12)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "uuid",
        "title": "Foto USG 20 Minggu",
        "description": "Deskripsi foto",
        "imageUrl": "url_to_image",
        "pregnancyWeek": 20,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 36,
      "limit": 12
    }
  }
}
```

### POST /api/gallery/photos
Upload foto baru.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `image`: File gambar
- `title` (optional): Judul foto
- `description` (optional): Deskripsi
- `pregnancyWeek` (optional): Minggu kehamilan (1-42)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Foto berhasil diupload",
  "data": {
    "id": "uuid",
    "title": "Foto USG 20 Minggu",
    "description": "Deskripsi foto",
    "imageUrl": "url_to_image",
    "pregnancyWeek": 20,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/gallery/photos/:id
Update informasi foto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Judul Baru",
  "description": "Deskripsi baru",
  "pregnancyWeek": 21
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Foto berhasil diperbarui",
  "data": {
    // updated photo data
  }
}
```

### DELETE /api/gallery/photos/:id
Menghapus foto.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Foto berhasil dihapus"
}
```

---

## Timeline Endpoints

### GET /api/timeline/milestones
Mendapatkan milestone timeline pengguna.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "currentWeek": 20,
    "milestones": [
      {
        "id": "uuid",
        "week": 20,
        "title": "Minggu ke-20",
        "description": "Bayi sekarang sebesar...",
        "babySize": "pisang",
        "tips": ["Tip 1", "Tip 2"],
        "completed": true,
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/timeline/milestones/:id/complete
Menandai milestone sebagai selesai.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Milestone berhasil diselesaikan",
  "data": {
    // updated milestone data
  }
}
```

---

## Health Check Endpoints

### GET /api/health/checkup
Mendapatkan riwayat pemeriksaan kesehatan.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2024-01-01",
      "weight": 65.5,
      "bloodPressure": "120/80",
      "symptoms": ["Mual ringan"],
      "notes": "Pemeriksaan rutin",
      "doctorNotes": "Semua normal",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/health/checkup
Menambah record pemeriksaan baru.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "weight": 65.5,
  "bloodPressure": "120/80",
  "symptoms": ["Mual ringan"],
  "notes": "Pemeriksaan rutin"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Data pemeriksaan berhasil disimpan",
  "data": {
    // created checkup data
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Token akses tidak ditemukan"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## File Upload

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Size Limits
- Maximum file size: 10MB
- Images are automatically optimized and resized

### Upload Process
1. Files diterima melalui `multipart/form-data`
2. Validasi format dan ukuran
3. Optimisasi gambar menggunakan Sharp
4. File disimpan dengan nama unik
5. URL file dikembalikan dalam response

---

## Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:
- **Window**: 15 menit
- **Max Requests**: 100 per IP address
- **Headers**: Rate limit info disertakan dalam response headers

---

## CORS Policy

API dikonfigurasi untuk menerima request dari:
- `http://localhost:3000` (development)
- Domain frontend production yang dikonfigurasi

---

## Environment Variables

Berikut adalah environment variables yang diperlukan:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

---

## Deployment

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables di Vercel dashboard

### Environment Setup

1. Copy `.env.example` ke `.env`
2. Isi semua environment variables
3. Setup Supabase database menggunakan file di folder `database/`

---

## Testing

### Manual Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test endpoints using tools like Postman or curl
```

### API Testing Files
- `test-api.js` - Script untuk testing endpoint
- `simple-test.js` - Testing sederhana
- `quick-test.js` - Quick health check

---

## Support

Untuk support atau pertanyaan:
- Email: team@velora.com
- Documentation: Lihat file README.md
- Issues: Submit melalui repository

---

*Dokumentasi ini terus diperbarui seiring dengan pengembangan API.*
