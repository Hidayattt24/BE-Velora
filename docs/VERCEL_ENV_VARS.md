# Environment Variables untuk Vercel Deployment

Pastikan variabel berikut sudah diset di Vercel Dashboard > Settings > Environment Variables:

## Required Environment Variables:

```env
# Node Environment
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://baisblpccyajqfasyicx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXNibHBjY3lhanFmYXN5aWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTY5NTksImV4cCI6MjA2NjY5Mjk1OX0.7kSzzFSaztQqk2znMiAso5CLFiwhuZlbOAcA0Dysiyo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXNibHBjY3lhanFmYXN5aWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExNjk1OSwiZXhwIjoyMDY2NjkyOTU5fQ.okVtRLR1obsLPYbx7OAYQhADHArKUBbpiP2wNB062h8

# JWT Configuration
JWT_SECRET=RtRPUuO0rDbBuFqjByFKAh8eMaOhOqfX3QM8dBtxWvC8qIBkN51mU54dNUpADfVGh+wmdmphaHtdqQjb75Lp9Q==
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/heic
```

## Langkah-langkah Setup di Vercel:

1. Buka Vercel Dashboard
2. Pilih project `be-velora`
3. Go to Settings > Environment Variables
4. Add semua variables di atas satu per satu
5. Redeploy project

## Verifikasi:

Setelah deploy, test dengan:

- Frontend upload foto
- Check console logs di Vercel Functions
- Verify image URL di database menggunakan Supabase public URL

## Important Notes:

- `SUPABASE_SERVICE_ROLE_KEY` dibutuhkan untuk storage operations
- Tanpa service role key, upload akan gagal dengan permission error
- Pastikan bucket `gallery-photos` sudah dibuat di Supabase Storage
- Policies harus sudah disetup untuk public access
