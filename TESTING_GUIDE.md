# 🧪 Panduan Lengkap Testing API Velora Backend

## ⚡ Quick Start Testing

### 1. Setup Database (WAJIB DILAKUKAN DULU!)

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih project Anda**: `baisblpccyajqfasyicx`
3. **Go to SQL Editor** (di sidebar kiri)
4. **Copy & paste script ini**:

```sql
-- QUICK FIX untuk Testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;

-- Hapus policies yang bermasalah
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
```

5. **Klik RUN** untuk execute

### 2. Start Backend Server

```bash
cd d:\.Lomba\Webdev\Kode\be-velora
npm run dev
```

Server akan berjalan di: http://localhost:5000

### 3. Test Basic Functionality

```bash
# Test sederhana
node simple-test.js

# Test lengkap (setelah basic test berhasil)
node test-api.js
```

## 🔍 Manual Testing dengan Curl/Postman

### Health Check

```bash
curl http://localhost:5000/health
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User Velora",
    "phone": "081234567890",
    "email": "test@velora.com",
    "password": "TestPass123"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User Velora",
    "password": "TestPass123"
  }'
```

### Get Articles (Public)

```bash
curl http://localhost:5000/api/journal/articles
```

### Get User Profile (Authenticated)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Test Scenarios

### Scenario 1: User Registration & Login Flow

1. Register new user
2. Login with credentials
3. Get user profile
4. Update profile

### Scenario 2: Health Prediction

1. Login as user
2. Submit health data for prediction
3. Get prediction history

### Scenario 3: Journal Articles

1. Get public articles (no auth)
2. Login as user
3. Create new article
4. Bookmark article

### Scenario 4: Gallery & Timeline

1. Upload photo to gallery
2. Create pregnancy profile
3. Add timeline entries

## 📊 Expected Results

### Successful Health Check Response:

```json
{
  "status": "OK",
  "message": "Velora API Server is running",
  "timestamp": "2025-06-28T15:56:37.849Z",
  "version": "1.0.0"
}
```

### Successful Registration Response:

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "uuid-here",
      "full_name": "Test User Velora",
      "email": "test@velora.com"
    },
    "token": "jwt-token-here"
  }
}
```

### Successful Login Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid-here",
      "full_name": "Test User Velora",
      "email": "test@velora.com"
    },
    "token": "jwt-token-here"
  }
}
```

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"

**Solution**: Jalankan script SQL di atas untuk disable RLS

### Error: "jwt malformed"

**Solution**: Pastikan menggunakan token dari login response

### Error: "Cannot POST /api/auth/register"

**Solution**: Pastikan server berjalan di port 5000

### Error: "CORS policy violation"

**Solution**: Frontend harus dari localhost:3000

## 🔄 Re-enable Security (Setelah Testing)

Setelah testing selesai, jalankan script ini untuk enable RLS kembali:

```sql
-- Enable RLS kembali
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
-- dst...

-- Buat policy yang benar
CREATE POLICY "Allow registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

## 📝 Test Results Log

Catat hasil testing Anda:

- [ ] Health Check: ✅/❌
- [ ] User Registration: ✅/❌
- [ ] User Login: ✅/❌
- [ ] Get Profile: ✅/❌
- [ ] Health Prediction: ✅/❌
- [ ] Articles CRUD: ✅/❌
- [ ] Gallery Upload: ✅/❌
- [ ] Timeline Tracking: ✅/❌

## 🎉 Success Criteria

Backend dianggap berhasil jika:

1. Health check response 200 OK
2. User bisa register & login
3. Protected endpoints perlu token
4. Public endpoints bisa diakses tanpa auth
5. Database operations berhasil
6. File upload berfungsi
7. ML API integration working
