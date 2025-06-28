    -- Fix RLS Policies for Velora Backend
    -- Run this in Supabase SQL Editor

    -- First, disable RLS temporarily to fix issues
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE health_predictions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE article_bookmarks DISABLE ROW LEVEL SECURITY;
    ALTER TABLE gallery_photos DISABLE ROW LEVEL SECURITY;
    ALTER TABLE pregnancy_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own data" ON users;
    DROP POLICY IF EXISTS "Service role can manage users" ON users;

    -- Create new policies for users table
    -- Allow public registration (insert)
    CREATE POLICY "Allow public registration" ON users
    FOR INSERT WITH CHECK (true);

    -- Allow users to view their own profile
    CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.role() = 'service_role'
    );

    -- Allow users to update their own profile
    CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        auth.uid() = id OR 
        auth.role() = 'service_role'
    );

    -- Allow service role to manage all users (for backend operations)
    CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

    -- Health predictions policies
    DROP POLICY IF EXISTS "Users can view own health predictions" ON health_predictions;
    DROP POLICY IF EXISTS "Users can insert own health predictions" ON health_predictions;

    CREATE POLICY "Health predictions access" ON health_predictions
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

    -- Articles policies (allow public read for published articles)
    DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
    DROP POLICY IF EXISTS "Authors can view own articles" ON articles;
    DROP POLICY IF EXISTS "System can insert articles" ON articles;
    DROP POLICY IF EXISTS "Authors can insert own articles" ON articles;
    DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
    DROP POLICY IF EXISTS "Authors can delete own articles" ON articles;

    CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT USING (published = true OR auth.role() = 'service_role');

    CREATE POLICY "Service role can manage articles" ON articles
    FOR ALL USING (auth.role() = 'service_role');

    -- Bookmarks policies
    DROP POLICY IF EXISTS "Users can view own bookmarks" ON article_bookmarks;
    DROP POLICY IF EXISTS "Users can insert own bookmarks" ON article_bookmarks;
    DROP POLICY IF EXISTS "Users can delete own bookmarks" ON article_bookmarks;

    CREATE POLICY "Users manage own bookmarks" ON article_bookmarks
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

    -- Gallery photos policies
    DROP POLICY IF EXISTS "Users can view own photos" ON gallery_photos;
    DROP POLICY IF EXISTS "Users can insert own photos" ON gallery_photos;
    DROP POLICY IF EXISTS "Users can update own photos" ON gallery_photos;
    DROP POLICY IF EXISTS "Users can delete own photos" ON gallery_photos;

    CREATE POLICY "Users manage own gallery photos" ON gallery_photos
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

    -- Pregnancy profiles policies
    DROP POLICY IF EXISTS "Users can view own pregnancy profile" ON pregnancy_profiles;
    DROP POLICY IF EXISTS "Users can insert own pregnancy profile" ON pregnancy_profiles;
    DROP POLICY IF EXISTS "Users can update own pregnancy profile" ON pregnancy_profiles;

    CREATE POLICY "Users manage own pregnancy profile" ON pregnancy_profiles
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

    -- Timeline entries policies
    DROP POLICY IF EXISTS "Users can view own timeline entries" ON timeline_entries;
    DROP POLICY IF EXISTS "Users can insert own timeline entries" ON timeline_entries;
    DROP POLICY IF EXISTS "Users can update own timeline entries" ON timeline_entries;
    DROP POLICY IF EXISTS "Users can delete own timeline entries" ON timeline_entries;

    CREATE POLICY "Users manage own timeline entries" ON timeline_entries
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

    -- Re-enable RLS with new policies
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

    -- Insert some sample articles for testing (as service role)
    INSERT INTO articles (title, content, excerpt, category, image, published, read_time) VALUES 
    ('Tips Mengatasi Mual Morning Sickness', 'Morning sickness adalah kondisi yang sangat umum dialami oleh ibu hamil...', 'Cara alami dan efektif untuk mengurangi rasa mual di trimester pertama', 'Trimester 1', '/main/journal/journal.jpg', true, '5 min read'),
    ('Nutrisi Penting untuk Ibu Hamil', 'Nutrisi yang tepat sangat penting untuk kesehatan ibu dan perkembangan janin...', 'Panduan lengkap nutrisi yang dibutuhkan selama kehamilan', 'Nutrisi', '/main/journal/journal.jpg', true, '7 min read'),
    ('Persiapan Persalinan Trimester 3', 'Memasuki trimester ketiga, persiapan persalinan menjadi sangat penting...', 'Panduan persiapan fisik dan mental menjelang persalinan', 'Trimester 3', '/main/journal/journal.jpg', true, '6 min read');
