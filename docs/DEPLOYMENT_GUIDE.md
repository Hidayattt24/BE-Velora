# Velora Backend - Deployment Guide

## Overview

Panduan lengkap untuk deploy Velora Backend API ke Vercel.

## Prerequisites

1. **Akun Vercel** - [vercel.com](https://vercel.com)
2. **Akun Supabase** - [supabase.com](https://supabase.com)
3. **Node.js** versi 18 atau lebih tinggi
4. **Git** untuk version control

## Pre-Deployment Setup

### 1. Supabase Database Setup

1. Buat project baru di Supabase
2. Jalankan script SQL dari folder `database/`:

   ```sql
   -- Jalankan berurutan:
   -- 1. schema.sql (struktur database)
   -- 2. sample_data.sql (data contoh)
   -- 3. fix-rls-policies.sql (kebijakan keamanan)
   ```

3. Dapatkan credentials Supabase:
   - `SUPABASE_URL`: URL project Supabase
   - `SUPABASE_ANON_KEY`: Anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key

### 2. Environment Variables Setup

Copy dan edit file environment:

```bash
cp .env.example .env
```

Isi dengan nilai yang sesuai:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel**

   ```bash
   vercel login
   ```

3. **Deploy dari root directory**

   ```bash
   cd be-velora
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   # Set each environment variable
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add JWT_SECRET
   vercel env add ALLOWED_ORIGINS
   # ... dan seterusnya
   ```

### Method 2: Vercel Dashboard

1. **Connect Repository**

   - Push code ke GitHub/GitLab
   - Import project di Vercel dashboard
   - Pilih root directory: `be-velora`

2. **Configure Build Settings**

   - Build Command: `npm run build` (atau kosong)
   - Output Directory: `api`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Masuk ke Settings > Environment Variables
   - Tambahkan semua environment variables dari `.env.example`

## Post-Deployment Configuration

### 1. Test API Endpoints

Test endpoint dasar:

```bash
curl https://your-api-domain.vercel.app/health
```

Response yang diharapkan:

```json
{
  "status": "OK",
  "message": "Velora API Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Update Frontend CORS

Update environment variables di frontend untuk mengarah ke API URL yang baru:

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
```

### 3. Test Full Authentication Flow

1. Register user baru melalui `/api/auth/register`
2. Login dengan user tersebut
3. Test endpoint yang memerlukan authentication

## Environment Variables Reference

### Required Variables

| Variable                    | Description               | Example                   |
| --------------------------- | ------------------------- | ------------------------- |
| `SUPABASE_URL`              | Supabase project URL      | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key    | `eyJ...`                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...`                  |
| `JWT_SECRET`                | JWT signing secret        | `your_32_char_secret`     |
| `ALLOWED_ORIGINS`           | CORS allowed origins      | `https://app.vercel.app`  |

### Optional Variables

| Variable                  | Description              | Default          |
| ------------------------- | ------------------------ | ---------------- |
| `JWT_EXPIRES_IN`          | JWT expiration time      | `7d`             |
| `MAX_FILE_SIZE`           | Max upload size in bytes | `10485760`       |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests  | `100`            |
| `SMTP_HOST`               | Email SMTP host          | `smtp.gmail.com` |
| `SMTP_PORT`               | Email SMTP port          | `587`            |

## Troubleshooting

### Common Issues

#### 1. CORS Errors

```bash
# Solution: Update ALLOWED_ORIGINS
vercel env add ALLOWED_ORIGINS https://your-frontend.vercel.app
```

#### 2. Database Connection Errors

- Pastikan Supabase credentials benar
- Check RLS policies di Supabase
- Pastikan database schema sudah di-setup

#### 3. JWT Errors

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. File Upload Issues

- Vercel memiliki limitasi untuk serverless functions
- File uploads mungkin perlu menggunakan external storage (Supabase Storage/Cloudinary)

### Debug Mode

Enable debug mode untuk troubleshooting:

```bash
vercel env add NODE_ENV development
```

### Logs

Check deployment logs:

```bash
vercel logs https://your-api-domain.vercel.app
```

## Performance Optimization

### 1. Database Optimization

- Setup database indexes yang diperlukan
- Gunakan RLS policies yang efisien
- Enable connection pooling di Supabase

### 2. API Optimization

- Implement proper caching headers
- Use compression middleware
- Optimize image processing

### 3. Monitoring

- Setup monitoring dengan Vercel Analytics
- Monitor API performance dan error rates
- Setup alerts untuk downtime

## Security Checklist

- [ ] JWT secret yang kuat (min 32 karakter)
- [ ] CORS dikonfigurasi dengan benar
- [ ] Rate limiting aktif
- [ ] RLS policies di Supabase
- [ ] Environment variables tidak exposed
- [ ] HTTPS enforced
- [ ] Input validation aktif
- [ ] Error handling yang proper

## Maintenance

### Regular Tasks

1. Monitor server logs
2. Update dependencies secara berkala
3. Backup database
4. Review security logs
5. Performance monitoring

### Updates

```bash
# Update dependencies
npm update

# Redeploy
vercel --prod
```

## Support

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [API Documentation](./API_DOCUMENTATION.md)

### Contact

- Technical Issues: Create issue di repository
- Emergency: Contact team lead

---

## Deployment Checklist

Pre-deployment:

- [ ] Database schema setup
- [ ] Environment variables configured
- [ ] CORS origins updated
- [ ] SSL certificates ready

Deployment:

- [ ] Code deployed successfully
- [ ] All environment variables set
- [ ] Health check passes
- [ ] Basic authentication test

Post-deployment:

- [ ] Frontend updated with new API URL
- [ ] Full user flow tested
- [ ] Monitoring setup
- [ ] Documentation updated

---

_Last updated: [Current Date]_
_Version: 1.0.0_
