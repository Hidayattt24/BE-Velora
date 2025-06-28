# 🚀 Deploy Velora Backend melalui Vercel Dashboard

## 📋 Prerequisites

1. **Akun GitHub/GitLab** dengan repository yang sudah di-push
2. **Akun Vercel** - [vercel.com](https://vercel.com)
3. **Akun Supabase** dengan database yang sudah setup
4. **Environment variables** yang sudah disiapkan

## 🌐 Step-by-Step Deployment via Vercel Dashboard

### Step 1: Persiapan Repository

1. **Push project ke GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Pastikan struktur project benar:**
   ```
   be-velora/
   ├── api/
   │   └── index.js          # ✅ Entry point untuk Vercel
   ├── src/
   │   └── server.js         # ✅ Main server file
   ├── vercel.json           # ✅ Konfigurasi Vercel
   ├── package.json          # ✅ Dependencies
   └── .env.example          # ✅ Template environment
   ```

### Step 2: Deploy melalui Vercel Dashboard

1. **Buka [vercel.com](https://vercel.com) dan login**

2. **Klik "New Project"**

3. **Import Repository:**
   - Pilih repository `be-velora` dari GitHub
   - Klik "Import"

4. **Configure Project:**
   - **Project Name**: `velora-backend` (atau nama yang Anda inginkan)
   - **Framework Preset**: Other
   - **Root Directory**: `/` (root project)
   - **Build Command**: `npm run build` (atau kosongkan)
   - **Output Directory**: `api`
   - **Install Command**: `npm install`

5. **Klik "Deploy"** (untuk deployment pertama)

### Step 3: Setup Environment Variables

Setelah deployment pertama, Anda perlu menambahkan environment variables:

1. **Masuk ke Project Dashboard**
   - Klik project yang baru di-deploy
   - Pilih tab "Settings"
   - Pilih "Environment Variables"

2. **Tambahkan Environment Variables:**

   **REQUIRED VARIABLES:**
   ```
   Variable Name: SUPABASE_URL
   Value: https://your-project.supabase.co
   Environment: Production, Preview, Development
   
   Variable Name: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environment: Production, Preview, Development
   
   Variable Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environment: Production, Preview, Development
   
   Variable Name: JWT_SECRET
   Value: your_super_secret_jwt_key_minimum_32_characters
   Environment: Production, Preview, Development
   
   Variable Name: ALLOWED_ORIGINS
   Value: https://your-frontend-domain.vercel.app
   Environment: Production, Preview, Development
   ```

   **OPTIONAL VARIABLES:**
   ```
   Variable Name: ML_API_URL
   Value: https://your-ml-api.vercel.app
   Environment: Production, Preview, Development
   
   Variable Name: SMTP_HOST
   Value: smtp.gmail.com
   Environment: Production, Preview, Development
   
   Variable Name: SMTP_PORT
   Value: 587
   Environment: Production, Preview, Development
   
   Variable Name: SMTP_USER
   Value: your-email@gmail.com
   Environment: Production, Preview, Development
   
   Variable Name: SMTP_PASS
   Value: your-app-password
   Environment: Production, Preview, Development
   
   Variable Name: FROM_EMAIL
   Value: noreply@velora.app
   Environment: Production, Preview, Development
   
   Variable Name: RATE_LIMIT_WINDOW_MS
   Value: 900000
   Environment: Production, Preview, Development
   
   Variable Name: RATE_LIMIT_MAX_REQUESTS
   Value: 100
   Environment: Production, Preview, Development
   
   Variable Name: MAX_FILE_SIZE
   Value: 10485760
   Environment: Production, Preview, Development
   
   Variable Name: ALLOWED_IMAGE_TYPES
   Value: image/jpeg,image/png,image/webp
   Environment: Production, Preview, Development
   ```

### Step 4: Redeploy dengan Environment Variables

1. **Kembali ke tab "Deployments"**
2. **Klik "Redeploy" pada deployment terakhir**
3. **Pilih "Use existing Build Cache: No"**
4. **Klik "Redeploy"**

### Step 5: Verifikasi Deployment

1. **Akses URL deployment Anda:**
   ```
   https://your-project-name.vercel.app/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "OK",
     "message": "Velora API Server is running",
     "timestamp": "2025-06-29T00:00:00.000Z",
     "version": "1.0.0"
   }
   ```

## 🔧 Mendapatkan Environment Variables

### Supabase Credentials

1. **Login ke [supabase.com](https://supabase.com)**
2. **Buka project Anda**
3. **Settings > API:**
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role secret key

### JWT Secret

Generate JWT secret yang aman:
```bash
# Method 1: Online generator
# Kunjungi: https://randomkeygen.com/

# Method 2: Node.js (jika ada di local)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 3: Manual
# Buat string random minimal 32 karakter
```

### SMTP Configuration (Optional)

Untuk fitur reset password via email:

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password di Google Account settings
3. Gunakan app password untuk `SMTP_PASS`

## 🧪 Testing Deployment

### Test 1: Health Check
```bash
curl https://your-deployment-url.vercel.app/health
```

### Test 2: Registration
```bash
curl -X POST https://your-deployment-url.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "081234567890",
    "password": "TestPass123"
  }'
```

### Test 3: Public Endpoints
```bash
# Articles
curl https://your-deployment-url.vercel.app/api/journal/articles

# Categories
curl https://your-deployment-url.vercel.app/api/journal/categories

# Health Parameters
curl https://your-deployment-url.vercel.app/api/health/parameters
```

## 🔄 Auto-Deploy Setup

Untuk automatic deployment setiap kali ada push ke repository:

1. **Masuk ke Project Settings**
2. **Tab "Git"**
3. **Production Branch**: `main` (atau branch utama Anda)
4. **Auto-Deploy**: Enable

Sekarang setiap push ke branch main akan otomatis trigger deployment baru.

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Build Failed
- **Check**: Package.json dependencies
- **Solution**: Pastikan semua dependencies tersedia dan versi compatible

#### 2. Function Timeout
- **Check**: Vercel.json configuration
- **Solution**: Sudah dikonfigurasi `maxDuration: 30`

#### 3. Environment Variables Not Found
- **Check**: Variables sudah di-set di dashboard
- **Solution**: Redeploy setelah menambah environment variables

#### 4. CORS Errors
- **Check**: `ALLOWED_ORIGINS` sudah benar
- **Solution**: Tambahkan domain frontend Anda

#### 5. Database Connection Error
- **Check**: Supabase credentials
- **Check**: Database tables sudah dibuat
- **Solution**: Jalankan SQL scripts di Supabase

### Debug Steps

1. **Check Function Logs:**
   - Project Dashboard > Functions tab
   - Klik pada function untuk melihat logs

2. **Check Environment Variables:**
   - Settings > Environment Variables
   - Pastikan semua required variables ada

3. **Check Recent Deployments:**
   - Deployments tab
   - Lihat status dan error messages

## 📊 Monitoring & Maintenance

### Analytics
- **Vercel Analytics**: Otomatis tersedia
- **Function Metrics**: Response time, invocations
- **Error Tracking**: 4xx, 5xx responses

### Performance Tips
1. **Enable Edge Caching** untuk static responses
2. **Monitor function duration** (max 30s)
3. **Database connection pooling** di Supabase

### Updates
1. **Push updates** ke repository
2. **Auto-deployment** akan trigger
3. **Monitor deployment** di dashboard
4. **Test endpoints** setelah deployment

## 🔗 Important URLs

Setelah deployment, simpan URLs penting:

- **API Base URL**: `https://your-project.vercel.app`
- **Health Check**: `https://your-project.vercel.app/health`
- **Documentation**: `https://your-project.vercel.app/api/docs`
- **Vercel Dashboard**: `https://vercel.com/your-username/your-project`

## ✅ Deployment Checklist

**Pre-deployment:**
- [ ] Repository di-push ke GitHub
- [ ] Supabase database setup lengkap
- [ ] Environment variables disiapkan
- [ ] vercel.json konfigurasi benar

**Deployment:**
- [ ] Project imported ke Vercel
- [ ] Environment variables ditambahkan
- [ ] Deployment berhasil (status: Ready)
- [ ] Health check endpoint berfungsi

**Post-deployment:**
- [ ] Semua endpoint ditest
- [ ] Frontend URL updated
- [ ] Auto-deploy setup
- [ ] Monitoring enabled

---

**🎉 Selamat! Backend Velora Anda sudah live di Vercel!**

Simpan URL deployment dan bagikan ke tim frontend untuk integrasi.
