# 📋 Environment Variables untuk Vercel Dashboard

Gunakan list ini untuk copy-paste environment variables di Vercel Dashboard.

## 🔴 REQUIRED VARIABLES (Wajib)

### SUPABASE_URL
```
https://your-project-id.supabase.co
```
*Dapatkan dari: Supabase Dashboard > Settings > API > Project URL*

### SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5MDA5NjAwLCJleHAiOjIwMTQ1ODU2MDB9.your-key-here
```
*Dapatkan dari: Supabase Dashboard > Settings > API > anon public*

### SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTkwMDk2MDAsImV4cCI6MjAxNDU4NTYwMH0.your-service-key-here
```
*Dapatkan dari: Supabase Dashboard > Settings > API > service_role secret*

### JWT_SECRET
```
your_super_secret_jwt_key_minimum_32_characters_long_random_string
```
*Generate dari: https://randomkeygen.com/ atau crypto.randomBytes(32)*

### ALLOWED_ORIGINS
```
https://your-frontend-domain.vercel.app,http://localhost:3000
```
*Ganti dengan URL frontend Anda yang sudah di-deploy*

---

## 🟡 OPTIONAL VARIABLES (Opsional)

### NODE_ENV
```
production
```

### JWT_EXPIRES_IN
```
7d
```

### RATE_LIMIT_WINDOW_MS
```
900000
```

### RATE_LIMIT_MAX_REQUESTS
```
100
```

### MAX_FILE_SIZE
```
10485760
```

### ALLOWED_IMAGE_TYPES
```
image/jpeg,image/png,image/webp
```

---

## 📧 EMAIL CONFIGURATION (Untuk Reset Password)

### SMTP_HOST
```
smtp.gmail.com
```

### SMTP_PORT
```
587
```

### SMTP_USER
```
your-email@gmail.com
```
*Gmail yang sudah enable App Password*

### SMTP_PASS
```
your-16-character-app-password
```
*App Password dari Google Account, bukan password biasa*

### FROM_EMAIL
```
noreply@velora.app
```

---

## 🤖 ML API INTEGRATION (Jika ada)

### ML_API_URL
```
https://your-ml-api.vercel.app
```

---

## 📝 Cara Setting di Vercel Dashboard

1. **Buka Project di Vercel Dashboard**
2. **Klik "Settings"**
3. **Klik "Environment Variables"**
4. **Untuk setiap variable:**
   - **Name**: Copy nama variable (contoh: `SUPABASE_URL`)
   - **Value**: Copy nilai variable (contoh: `https://xyz.supabase.co`)
   - **Environments**: Pilih `Production`, `Preview`, dan `Development`
   - **Klik "Save"**

## 🔄 Setelah Menambah Environment Variables

1. **Kembali ke tab "Deployments"**
2. **Klik "..." pada deployment terakhir**
3. **Pilih "Redeploy"**
4. **Uncheck "Use existing Build Cache"**
5. **Klik "Redeploy"**

## ✅ Verifikasi Environment Variables

Setelah redeploy, test endpoint ini:
```
https://your-deployment-url.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Velora API Server is running",
  "timestamp": "2025-06-29T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🚨 Troubleshooting

### Jika ada error "Environment variable not found":
1. Cek apakah variable sudah ditambahkan
2. Pastikan Environment nya mencakup "Production"
3. Redeploy setelah menambah variable

### Jika CORS error:
1. Pastikan `ALLOWED_ORIGINS` sudah benar
2. Tambahkan domain frontend Anda
3. Format: `https://domain1.com,https://domain2.com`

### Jika database connection error:
1. Cek Supabase credentials
2. Pastikan database sudah setup (jalankan SQL scripts)
3. Test connection dari Supabase dashboard

---

## 🎯 Quick Copy untuk Required Variables

```
Variable: SUPABASE_URL
Value: [YOUR_SUPABASE_URL]

Variable: SUPABASE_ANON_KEY  
Value: [YOUR_ANON_KEY]

Variable: SUPABASE_SERVICE_ROLE_KEY
Value: [YOUR_SERVICE_ROLE_KEY]

Variable: JWT_SECRET
Value: [YOUR_32_CHAR_SECRET]

Variable: ALLOWED_ORIGINS
Value: [YOUR_FRONTEND_URL]
```

Ganti `[YOUR_*]` dengan nilai yang sesuai dari akun Supabase dan frontend Anda.
