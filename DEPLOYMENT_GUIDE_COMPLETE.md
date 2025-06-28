# 🚀 Velora Backend - Deployment Guide

## 📋 Prerequisites

- Node.js 18+
- Vercel account
- Supabase project setup
- Git repository

## 🎯 Quick Deployment Steps

### 1. Setup Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Run SQL scripts in order:
   ```bash
   # In Supabase SQL Editor:
   # 1. database/schema.sql
   # 2. database/sample_data.sql
   # 3. database/fix-rls-policies.sql
   ```
3. Get your Supabase credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Login to Vercel

```bash
vercel login
```

### 4. Deploy to Vercel

```bash
# Clone and navigate to project
cd be-velora

# Deploy to production
vercel --prod
```

### 5. Set Environment Variables

Use the automated setup script:

```bash
# Windows (PowerShell)
.\deploy.ps1

# Linux/Mac
chmod +x setup-env.sh
./setup-env.sh
```

Or manually set via Vercel dashboard or CLI:

```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add JWT_SECRET production
vercel env add ALLOWED_ORIGINS production
```

## 🔧 Environment Variables

### Required Variables

```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Optional Variables

```env
# ML API Integration
ML_API_URL=https://your-ml-api.vercel.app

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@velora.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

## 🧪 Testing Deployment

### Test Local Development

```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Test locally
npm run test:comprehensive
```

### Test Production Deployment

```bash
# Test deployed API
API_URL=https://your-deployment-url.vercel.app npm run test:deployment
```

### Manual Testing

```bash
# Health check
curl https://your-deployment-url.vercel.app/health

# Test registration
curl -X POST https://your-deployment-url.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "081234567890",
    "password": "TestPass123"
  }'
```

## 📂 Project Structure

```
be-velora/
├── api/
│   └── index.js              # Vercel entry point
├── src/
│   ├── server.js             # Main server file
│   ├── config/
│   │   └── database.js       # Supabase configuration
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── upload-vercel.js  # File upload for Vercel
│   │   └── errorHandler.js   # Error handling
│   └── routes/
│       ├── auth.js           # Authentication endpoints
│       ├── user.js           # User management
│       ├── health.js         # Health predictions
│       ├── journal.js        # Articles & bookmarks
│       ├── gallery.js        # Photo gallery
│       └── timeline.js       # Pregnancy tracking
├── database/
│   ├── schema.sql            # Database schema
│   ├── sample_data.sql       # Sample data
│   └── fix-rls-policies.sql  # Security policies
├── vercel.json               # Vercel configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **500 Internal Server Error**

   - Check environment variables are set correctly
   - Verify Supabase credentials
   - Check Vercel function logs: `vercel logs`

2. **Database Connection Error**

   - Verify Supabase URL and keys
   - Check if RLS policies are configured
   - Ensure database tables exist

3. **CORS Errors**

   - Add your frontend domain to `ALLOWED_ORIGINS`
   - Check vercel.json CORS configuration

4. **JWT Token Errors**
   - Ensure `JWT_SECRET` is set and consistent
   - Check token expiration settings

### Debug Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs your-project-name

# Check environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

## 📊 Monitoring

### Health Checks

- **Endpoint**: `GET /health`
- **Expected Response**: `{"status": "OK", ...}`

### Performance Monitoring

- Use Vercel Analytics dashboard
- Monitor function execution time
- Check error rates

### Logging

- All errors logged to console
- Access via `vercel logs`
- Set up external monitoring if needed

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ JWT secrets strong and unique
- ✅ Database RLS policies active
- ✅ File upload validation enabled
- ✅ HTTPS enforced (Vercel default)

## 🚀 Production Deployment Checklist

- [ ] Supabase database setup complete
- [ ] All environment variables configured
- [ ] Frontend domain added to ALLOWED_ORIGINS
- [ ] SSL certificate active (automatic with Vercel)
- [ ] API tests passing
- [ ] Database migrations applied
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] Error logging configured

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Vercel function logs
3. Verify environment variables
4. Test individual endpoints
5. Contact development team

## 🔄 Updates & Maintenance

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit fix
```

### Database Migrations

- Plan schema changes carefully
- Test in development first
- Backup production data
- Use Supabase migration tools

### Environment Updates

```bash
# Update environment variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Deployment Platform**: Vercel Serverless Functions
