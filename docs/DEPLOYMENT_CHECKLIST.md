# 🚀 Velora Backend - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 📁 File Structure

- [x] `api/index.js` - Vercel entry point
- [x] `src/server.js` - Main application
- [x] `vercel.json` - Vercel configuration
- [x] `package.json` - Dependencies
- [x] `docs.html` - API documentation
- [x] `.vercelignore` - Ignore files

### 🔧 Configuration Files

#### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Build Settings di Vercel Dashboard

- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build` (or leave empty)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

## 🌐 Environment Variables

### Required Variables (Add via Vercel Dashboard)

| Variable                    | Value                              | Description                       |
| --------------------------- | ---------------------------------- | --------------------------------- |
| `SUPABASE_URL`              | `https://xxx.supabase.co`          | Supabase project URL              |
| `SUPABASE_ANON_KEY`         | `eyJhbGciOiJIUzI1NiI...`           | Supabase anon key                 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiI...`           | Supabase service role key         |
| `JWT_SECRET`                | `your_super_secret_jwt_key`        | JWT signing secret (min 32 chars) |
| `ALLOWED_ORIGINS`           | `https://your-frontend.vercel.app` | CORS allowed origins              |

### Optional Variables

| Variable                  | Value                       | Description             |
| ------------------------- | --------------------------- | ----------------------- |
| `NODE_ENV`                | `production`                | Environment             |
| `JWT_EXPIRES_IN`          | `7d`                        | JWT expiration          |
| `RATE_LIMIT_WINDOW_MS`    | `900000`                    | Rate limit window       |
| `RATE_LIMIT_MAX_REQUESTS` | `100`                       | Max requests per window |
| `ML_API_URL`              | `https://ml-api.vercel.app` | ML prediction service   |

## 🧪 Testing Steps

### 1. Health Check

```bash
curl https://api-velora.vercel.app/health
```

Expected Response:

```json
{
  "status": "OK",
  "message": "Velora API Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Root Endpoint

```bash
curl https://api-velora.vercel.app/
```

Expected Response:

```json
{
  "success": true,
  "message": "Welcome to Velora API",
  "version": "1.0.0",
  "documentation": "https://api-velora.vercel.app/docs",
  "endpoints": {...}
}
```

### 3. Documentation

Visit: https://api-velora.vercel.app/docs

### 4. Test Registration

```bash
curl -X POST https://api-velora.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "081234567890",
    "password": "TestPass123"
  }'
```

## 🔍 Common Issues & Solutions

### Issue 1: 500 Internal Server Error

**Solution**: Check environment variables are set correctly

```bash
# Check Vercel logs
vercel logs your-project-name
```

### Issue 2: CORS Errors

**Solution**: Add frontend domain to `ALLOWED_ORIGINS`

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### Issue 3: Database Connection Error

**Solution**: Verify Supabase credentials

- Check `SUPABASE_URL`
- Check `SUPABASE_ANON_KEY`
- Check `SUPABASE_SERVICE_ROLE_KEY`

### Issue 4: JWT Token Invalid

**Solution**: Ensure `JWT_SECRET` is set and consistent

```
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
```

## 📋 Deployment Steps

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**

   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: (leave empty or `npm run build`)
   - Output Directory: (leave empty)

4. **Deploy**

   - Click "Deploy"
   - Wait for build to complete

5. **Add Environment Variables**

   - Go to Project Settings → Environment Variables
   - Add all required variables from checklist above

6. **Redeploy**
   - Go to Deployments
   - Click "..." → Redeploy

## ✅ Post-Deployment Verification

- [ ] Health check returns 200 OK
- [ ] Root endpoint returns welcome message
- [ ] Documentation loads at `/docs`
- [ ] Registration endpoint works
- [ ] Login endpoint works
- [ ] CORS allows frontend domain
- [ ] All environment variables set
- [ ] Database connection working

## 🎯 Success Indicators

✅ **Deployment URL**: https://api-velora.vercel.app
✅ **Health Check**: https://api-velora.vercel.app/health
✅ **Documentation**: https://api-velora.vercel.app/docs
✅ **Status**: 🟢 All systems operational

## 📞 Troubleshooting

If deployment fails:

1. Check Vercel build logs
2. Verify all files are present
3. Test locally first: `npm run dev`
4. Check syntax: `node -c src/server.js`
5. Verify environment variables

**🚀 Ready for Production!**
