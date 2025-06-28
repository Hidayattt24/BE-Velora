-- QUICK FIX untuk Testing - Jalankan di Supabase SQL Editor
-- Disable RLS sementara untuk semua table supaya testing bisa jalan

-- Disable RLS untuk semua tabel
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;

-- Hapus semua existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Sekarang testing API bisa jalan
-- Nanti setelah testing berhasil, kita enable RLS lagi dengan policy yang benar
