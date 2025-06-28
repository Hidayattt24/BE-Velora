# 🔧 Troubleshooting Guide - Velora Backend

## Masalah Utama & Solusi

### 1. RLS Policy Error: "new row violates row-level security policy"

**Penyebab**: Supabase Row Level Security (RLS) memblokir operasi karena policy yang terlalu ketat.

**Solusi**:

1. Buka Supabase Dashboard → SQL Editor
2. Jalankan script `database/fix-rls-policies.sql`
3. Atau jalankan query ini untuk fix cepat:

```sql
-- Temporary fix: Disable RLS untuk testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;
```

### 2. JWT Malformed Error

**Penyebab**: Token yang dikirim dari test script tidak valid.

**Solusi**:

1. Pastikan register berhasil dulu
2. Gunakan token dari login response
3. Format header: `Authorization: Bearer <token>`

### 3. Service Role vs Anon Key

**Masalah**: Backend menggunakan service role key, tapi RLS policy expect auth.uid()

**Solusi**: Update konfigurasi database untuk menggunakan service role dengan benar.

## Langkah Testing API

### Step 1: Pastikan Server Berjalan

```bash
npm run dev
```

### Step 2: Test Health Check

```bash
curl http://localhost:5000/health
```

### Step 3: Fix RLS di Supabase

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Go to SQL Editor
4. Run script fix-rls-policies.sql

### Step 4: Test Simple Endpoints

```bash
node simple-test.js
```

### Step 5: Test Full API

```bash
node test-api.js
```

## Environment Check

Pastikan .env file berisi:

- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ JWT_SECRET

## Common Issues

### Issue: "Cannot POST /api/auth/register"

**Solution**: Pastikan route auth.js di-import dengan benar di server.js

### Issue: "CORS policy violation"

**Solution**: Tambahkan frontend URL ke ALLOWED_ORIGINS

### Issue: "Connection refused"

**Solution**: Pastikan Supabase credentials benar dan project aktif

## Testing Commands

```bash
# Test server status
curl -X GET http://localhost:5000/health

# Test registration (replace with valid data)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "081234567890",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "password": "TestPass123"
  }'
```

## Debug Mode

Untuk debug lebih detail, set environment:

```bash
NODE_ENV=development
DEBUG=*
```

Atau tambahkan logging di middleware untuk melihat request detail.
