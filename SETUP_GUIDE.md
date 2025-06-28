# 🚀 Velora Backend Setup Guide

## Environment Variables sudah dikonfigurasi ✅

Your `.env` file is properly configured with:
- SUPABASE_URL: https://baisblpccyajqfasyicx.supabase.co ✅
- SUPABASE_ANON_KEY: ✅ 
- SUPABASE_SERVICE_ROLE_KEY: ✅
- JWT_SECRET: ✅

## Next Steps Required:

### 1. Setup Database Schema 🗄️

**CRITICAL**: You need to run the database schema in Supabase:

1. Open **Supabase Dashboard**: https://supabase.com
2. Go to your project: `baisblpccyajqfasyicx`
3. Click **SQL Editor** in the left sidebar
4. Copy the entire content from `database/schema.sql`
5. Paste it in the SQL Editor
6. Click **Run** to execute

**This creates all the necessary tables:**
- users
- health_predictions  
- articles
- article_bookmarks
- gallery_photos
- pregnancy_profiles
- timeline_entries

### 2. Configure Supabase Authentication 🔐

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. **Disable** the following (since we handle auth in our backend):
   - Email confirmation
   - Phone confirmation  
   - Enable email auth (keep enabled)
3. In **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000`

### 3. Setup Row Level Security 🛡️

The schema already includes RLS policies, but verify in **Database** > **Tables**:
- All tables should show "RLS enabled" ✅
- Policies should be visible for each table

### 4. Test the Backend 🧪

After database setup, test the backend:

```bash
# 1. Ensure server is running
npm run dev

# 2. Test endpoints
node test-api.js
```

### 5. Create Sample Data (Optional) 📝

After schema setup, you can insert sample articles:

```sql
-- Run this in Supabase SQL Editor after creating a user
INSERT INTO articles (title, content, excerpt, category, author_id, published, read_time) VALUES
('Tips Mengatasi Mual Morning Sickness', 
 'Morning sickness adalah kondisi yang sangat umum dialami oleh ibu hamil, terutama pada trimester pertama...',
 'Cara alami dan efektif untuk mengurangi rasa mual di trimester pertama kehamilan.',
 'Trimester 1',
 'your-user-id-from-registration',
 true,
 '5 min read');
```

## Common Issues & Solutions 🔧

### Error: "null value in column author_id" 
- **Cause**: Trying to insert articles without a valid user ID
- **Solution**: Register a user first, then use their ID for articles

### Error: "Token tidak valid"
- **Cause**: Authentication issues  
- **Solution**: Ensure JWT_SECRET is set and user is properly registered

### Error: "Gagal membuat akun"
- **Cause**: Database schema not setup
- **Solution**: Run the schema SQL in Supabase first

## Status Checklist ✅

- [x] Environment variables configured
- [x] Server running (port 5000)
- [ ] Database schema executed in Supabase
- [ ] Sample user registered
- [ ] All tests passing

## Next: Frontend Integration 🎨

Once backend is fully setup, update frontend API calls to:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Support 💬

If you encounter issues:
1. Check server logs in terminal
2. Verify Supabase dashboard for table creation
3. Test individual endpoints with curl/Postman
4. Check network tab in browser for API calls
