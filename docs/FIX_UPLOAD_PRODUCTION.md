# Fix untuk Upload Gambar di Production (Vercel)

## Masalah
Backend yang dideploy di Vercel mengalami masalah saat upload gambar, dimana `image_url` menjadi `/uploads/undefined`. Hal ini terjadi karena:
1. Vercel serverless environment tidak mendukung penyimpanan file lokal
2. Kode masih menggunakan local filesystem storage (`/uploads/`)
3. Memory storage di Vercel tidak memberikan path file yang valid

## Solusi
Menggunakan **Supabase Storage** untuk menyimpan gambar di cloud storage yang persistent.

## Perubahan yang Dilakukan

### 1. File Baru: `upload-supabase.js`
- Middleware baru yang menggunakan Supabase Storage
- Upload file ke bucket `gallery-photos`
- Menghasilkan public URL yang valid
- Mendukung processing gambar dengan Sharp

### 2. Update `gallery.js`
- Menggunakan middleware upload-supabase
- Menyimpan public URL dari Supabase Storage
- Menambah kolom `storage_path` dan `storage_bucket`
- Update fungsi delete untuk menghapus dari storage

### 3. Database Migration
- File: `add_storage_columns.sql`
- Menambah kolom untuk tracking storage metadata

### 4. Supabase Storage Setup
- File: `setup_supabase_storage.sql`
- Membuat bucket `gallery-photos`
- Setup Row Level Security policies

## Langkah-langkah Deployment

### 1. Setup Supabase Storage
Jalankan SQL ini di Supabase SQL Editor:
\`\`\`sql
-- Dari file: database/setup_supabase_storage.sql
-- Membuat bucket dan policies
\`\`\`

### 2. Database Migration
Jalankan SQL ini di Supabase SQL Editor:
\`\`\`sql
-- Dari file: database/add_storage_columns.sql
-- Menambah kolom storage_path dan storage_bucket
\`\`\`

### 3. Environment Variables
Pastikan backend memiliki akses ke Supabase:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 4. Deploy Backend
- Push changes ke repository
- Vercel akan auto-deploy
- Test upload functionality

## Testing
1. Upload foto baru di frontend
2. Verify `image_url` sekarang menggunakan Supabase public URL
3. Verify foto dapat diakses dan ditampilkan
4. Test delete functionality

## Fallback
Jika ada masalah, kode masih memiliki fallback ke local path:
\`\`\`javascript
const imageUrl = req.file.publicUrl || \`/uploads/\${req.file.filename}\`;
\`\`\`

## Struktur URL Gambar Baru
**Sebelum:** `/uploads/filename.jpg`
**Sesudah:** `https://your-project.supabase.co/storage/v1/object/public/gallery-photos/uploads/filename.jpg`

Ini memastikan gambar dapat diakses dari mana saja dan persistent di cloud storage.
