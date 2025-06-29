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

**Opsi A: Menggunakan SQL (Sederhana)**

1. Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Dari file: database/setup_storage_simple.sql
-- Hanya membuat bucket, policies dibuat manual via Dashboard
```

2. Setelah itu, buka **Supabase Dashboard > Storage > Policies** dan buat policies berikut:

**Policy 1: "Allow public read access"**

- Operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'gallery-photos'`

**Policy 2: "Allow authenticated users to upload"**

- Operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL`

**Policy 3: "Allow users to update their own uploads"**

- Operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL`

**Policy 4: "Allow users to delete their own uploads"**

- Operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL`

**Opsi B: Menggunakan SQL Lengkap (Jika tidak ada error permission)**

```sql
-- Dari file: database/setup_supabase_storage.sql
-- Membuat bucket dan policies sekaligus
```

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

## Troubleshooting

### Error: "must be owner of table objects"

Jika Anda mendapat error ini saat menjalankan `setup_supabase_storage.sql`:

1. **Gunakan setup_storage_simple.sql** sebagai gantinya
2. **Buat policies manual** melalui Supabase Dashboard:
   - Buka **Storage > Policies**
   - Klik **New Policy**
   - Buat 4 policies sesuai instruksi di atas

### Error: "bucket already exists"

- Normal, abaikan error ini
- Bucket sudah dibuat sebelumnya

### Error: "policy already exists"

- Normal, abaikan error ini
- Policy sudah dibuat sebelumnya

### Testing Storage Setup

Untuk memverifikasi setup berhasil:

```sql
-- Cek bucket sudah dibuat
SELECT * FROM storage.buckets WHERE id = 'gallery-photos';

-- Cek policies
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
```

### Frontend Error: "Failed to upload to storage"

1. Cek environment variables backend
2. Verify bucket dan policies sudah setup
3. Cek network connectivity
4. Periksa console log untuk detail error

### Error 500 saat Upload Foto

Jika mendapat error 500 dengan pesan "Gagal mengunggah file ke storage", ikuti langkah debug ini:

#### 1. Test Supabase Storage Setup

Jalankan script test di backend:

```bash
cd be-velora
node test-storage.js
```

Script ini akan mengecek:

- ✅ Koneksi Supabase client
- ✅ Keberadaan bucket 'gallery-photos'
- ✅ Permission upload ke bucket
- ✅ Public URL generation

#### 2. Cek Environment Variables

Pastikan backend memiliki semua env vars:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for storage
```

#### 3. Verifikasi Bucket dan Policies

Di Supabase Dashboard:

- **Storage > gallery-photos** harus exist
- **Policies** harus ada 4 policies untuk INSERT, SELECT, UPDATE, DELETE
- Test upload manual via Dashboard

#### 4. Fallback ke Upload Lokal

Jika Supabase Storage bermasalah, gunakan fallback route:

```javascript
// Ganti di gallery.js line 113
require("../middleware/upload-vercel").upload; // atau upload.js
```

#### 5. Check Backend Logs

Di Vercel Dashboard atau console logs untuk melihat error detail:

- Storage upload errors
- Database insert errors
- Middleware errors

## ✅ SOLUTION VERIFIED - Storage Working!

### Test Results (29 Juni 2025):
```
Environment check:
- SUPABASE_URL: ✓ Set  
- SUPABASE_ANON_KEY: ✓ Set
- SUPABASE_SERVICE_ROLE_KEY: ✓ Set

2. Listing storage buckets...
Available buckets: [ 'gallery-photos' ]  
Gallery-photos bucket exists: true

3. Testing gallery-photos bucket access...
Gallery bucket accessible, files count: 0

4. Testing file upload...
Image upload test: SUCCESS ✓
```

### ✅ **Fixes Applied:**
1. **Service Role Key**: Menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk storage operations
2. **Admin Client**: Created separate admin client for storage dengan proper permissions
3. **Environment Loading**: Fixed `test-storage.js` untuk load `.env` dengan benar
4. **Bucket Configuration**: Bucket `gallery-photos` sudah dibuat dan berfungsi

### 🚀 **Next Steps for Deployment:**
1. **Set Environment Variables** di Vercel (lihat `VERCEL_ENV_VARS.md`)
2. **Deploy backend** dengan changes terbaru
3. **Test upload** di frontend production
