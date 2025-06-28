-- DROP SCHEMA SCRIPT - HATI-HATI: AKAN MENGHAPUS SEMUA DATA!
-- Jalankan ini di SQL Editor Supabase jika Anda ingin mulai fresh

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own health predictions" ON health_predictions;
DROP POLICY IF EXISTS "Users can insert own health predictions" ON health_predictions;
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Authors can view own articles" ON articles;
DROP POLICY IF EXISTS "System can insert articles" ON articles;
DROP POLICY IF EXISTS "Authors can insert own articles" ON articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
DROP POLICY IF EXISTS "Authors can delete own articles" ON articles;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON article_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON article_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON article_bookmarks;
DROP POLICY IF EXISTS "Users can view own gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Users can insert own gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Users can update own gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Users can delete own gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Users can view own pregnancy profile" ON pregnancy_profiles;
DROP POLICY IF EXISTS "Users can insert own pregnancy profile" ON pregnancy_profiles;
DROP POLICY IF EXISTS "Users can update own pregnancy profile" ON pregnancy_profiles;
DROP POLICY IF EXISTS "Users can delete own pregnancy profile" ON pregnancy_profiles;
DROP POLICY IF EXISTS "Users can view own timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can insert own timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can update own timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can delete own timeline entries" ON timeline_entries;

-- Drop tables in reverse order (child tables first)
DROP TABLE IF EXISTS timeline_entries CASCADE;
DROP TABLE IF EXISTS pregnancy_profiles CASCADE;
DROP TABLE IF EXISTS gallery_photos CASCADE;
DROP TABLE IF EXISTS article_bookmarks CASCADE;
DROP TABLE IF EXISTS health_predictions CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
