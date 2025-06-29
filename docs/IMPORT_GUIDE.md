# Panduan Import Data ke Supabase

## File yang Perlu Diimport

1. **users_data.csv** - Data user/author untuk artikel
2. **articles_clean.csv** - Data artikel journal

## Langkah-Langkah Import di Supabase Dashboard

### 1. Import Users Data Terlebih Dahulu

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Pergi ke **Table Editor**
4. Pilih tabel **users**
5. Klik **Insert** → **Import data from CSV**
6. Upload file `users_data.csv`
7. Pastikan mapping kolom sesuai:
   - id → id
   - full_name → full_name
   - username → username
   - phone → phone
   - email → email
   - password_hash → password_hash
   - profile_picture → profile_picture
   - created_at → created_at
   - updated_at → updated_at
8. Klik **Import**

### 2. Import Articles Data

1. Masih di **Table Editor**
2. Pilih tabel **articles**
3. Klik **Insert** → **Import data from CSV**
4. Upload file `articles_clean.csv`
5. Pastikan mapping kolom sesuai:
   - id → id
   - title → title
   - content → content
   - excerpt → excerpt
   - category → category
   - image → image
   - tags → tags
   - author_id → author_id
   - published → published
   - views → views
   - read_time → read_time
   - created_at → created_at
   - updated_at → updated_at
6. Klik **Import**

## Alternatif: Import via SQL

Jika import CSV tidak berfungsi dengan baik, Anda bisa menggunakan SQL Editor:

### 1. Insert Users Data

```sql
INSERT INTO users (id, full_name, username, phone, email, password_hash, profile_picture, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'Dr. Sarah Johnson', 'dr_sarah', '081234567890', 'dr.sarah@velora.com', '$2a$10$example_hash_here', '/main/journal/photo-profile.jpg', '2024-12-01T08:00:00Z', '2024-12-01T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440101', 'Dr. Michael Chen', 'dr_michael', '081234567891', 'dr.michael@velora.com', '$2a$10$example_hash_here', '/main/journal/photo-profile.jpg', '2024-12-01T08:00:00Z', '2024-12-01T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440102', 'Dr. Emily Brown', 'dr_emily', '081234567892', 'dr.emily@velora.com', '$2a$10$example_hash_here', '/main/journal/photo-profile.jpg', '2024-12-01T08:00:00Z', '2024-12-01T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440103', 'Maria Rodriguez', 'maria_r', '081234567893', 'maria@velora.com', '$2a$10$example_hash_here', '/main/journal/photo-profile.jpg', '2024-12-01T08:00:00Z', '2024-12-01T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440104', 'Tim Velora', 'tim_velora', '081234567894', 'tim@velora.com', '$2a$10$example_hash_here', '/main/journal/photo-profile.jpg', '2024-12-01T08:00:00Z', '2024-12-01T08:00:00Z');
```

### 2. Verifikasi Data

Setelah import, verifikasi data dengan menjalankan query:

```sql
-- Cek users
SELECT * FROM users WHERE username LIKE 'dr_%';

-- Cek articles
SELECT id, title, category, author_id FROM articles;

-- Cek relasi artikel dengan author
SELECT
    a.title,
    a.category,
    u.full_name as author
FROM articles a
LEFT JOIN users u ON a.author_id = u.id;
```

## Testing API Setelah Import

Setelah data berhasil diimport, test API dengan:

```bash
# Test get articles
curl http://localhost:5000/api/journal/articles

# Test get categories
curl http://localhost:5000/api/journal/categories

# Test get single article
curl http://localhost:5000/api/journal/articles/550e8400-e29b-41d4-a716-446655440001
```

## Troubleshooting

### Jika Import Gagal:

1. **Format UUID**: Pastikan format ID menggunakan UUID yang valid
2. **Foreign Key**: Import users dulu baru articles (karena articles memerlukan author_id)
3. **Text dengan Quote**: Jika ada masalah dengan quote dalam content, escape dengan \"
4. **Array Format**: Untuk kolom tags, pastikan format array PostgreSQL: `{"tag1","tag2"}`

### Error: "duplicate key value violates unique constraint"

Jika mendapat error seperti `duplicate key value violates unique constraint "users_phone_key"` atau similar:

#### Solusi 1: Cek Data yang Konflik

Jalankan script `cleanup_before_insert.sql` di SQL Editor untuk melihat data yang konflik:

```sql
-- Cek users dengan phone/email yang sama
SELECT id, full_name, username, phone, email
FROM users
WHERE phone LIKE '081234567%' OR email LIKE '%@velora.com'
ORDER BY phone;
```

#### Solusi 2: Hapus Data yang Konflik (Jika Safe)

Jika data tersebut adalah data test/dummy yang aman dihapus:

```sql
-- HATI-HATI: Backup data terlebih dahulu!
DELETE FROM users WHERE phone IN ('081234567890', '081234567891', '081234567892', '081234567893', '081234567894');
```

#### Solusi 3: Update CSV dengan Data Unik

File `users_data.csv` sudah diupdate dengan:

- Phone numbers: 082145678901, 082245678902, dst
- Emails: dr.sarah.journal@velora.com, dst
- Usernames: dr_sarah_journal, dr_michael_journal, dst

#### Solusi 4: Insert Manual via SQL

Gunakan file `insert_sample_data.sql` yang sudah include checking:

```sql
-- Insert with conflict handling
INSERT INTO users (id, full_name, username, phone, email, password_hash, profile_picture, created_at, updated_at)
VALUES (...)
ON CONFLICT (phone) DO NOTHING;
```

### Error: "violates foreign key constraint"

Jika error saat import articles karena author_id tidak ditemukan:

1. Pastikan users data sudah diimport terlebih dahulu
2. Cek apakah semua author_id di articles ada di tabel users:

```sql
SELECT DISTINCT a.author_id, u.full_name
FROM articles a
LEFT JOIN users u ON a.author_id = u.id
WHERE u.id IS NULL;
```

## Notes

- Password hash dalam sample data hanya contoh, dalam production gunakan bcrypt yang proper
- Image path menggunakan path relatif yang sudah ada di frontend
- Tags menggunakan format array PostgreSQL
- Semua artikel di-set published = true agar muncul di frontend
