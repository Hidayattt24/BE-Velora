-- Velora Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture TEXT,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health predictions table
CREATE TABLE health_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  systolic_bp INTEGER NOT NULL,
  diastolic_bp INTEGER NOT NULL,
  blood_sugar DECIMAL(4,2) NOT NULL,
  body_temp DECIMAL(4,2) NOT NULL,
  heart_rate INTEGER NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low risk', 'mid risk', 'high risk')),
  prediction_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(50) NOT NULL,
  image TEXT DEFAULT '/main/journal/journal.jpg',
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  read_time VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article bookmarks table
CREATE TABLE article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Gallery photos table
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title VARCHAR(100) DEFAULT 'Foto Kehamilan',
  description TEXT,
  pregnancy_week INTEGER CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
  file_size INTEGER,
  file_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pregnancy profiles table
CREATE TABLE pregnancy_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  last_menstrual_period DATE NOT NULL,
  current_weight DECIMAL(5,2),
  pre_pregnancy_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  current_week INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Timeline entries table
CREATE TABLE timeline_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_week INTEGER NOT NULL CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
  health_services JSONB DEFAULT '{}',
  symptoms JSONB DEFAULT '{}',
  health_services_notes TEXT,
  symptoms_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pregnancy_week)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_health_predictions_user_id ON health_predictions(user_id);
CREATE INDEX idx_health_predictions_created_at ON health_predictions(created_at);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_article_bookmarks_user_id ON article_bookmarks(user_id);
CREATE INDEX idx_gallery_photos_user_id ON gallery_photos(user_id);
CREATE INDEX idx_gallery_photos_pregnancy_week ON gallery_photos(pregnancy_week);
CREATE INDEX idx_pregnancy_profiles_user_id ON pregnancy_profiles(user_id);
CREATE INDEX idx_timeline_entries_user_id ON timeline_entries(user_id);
CREATE INDEX idx_timeline_entries_pregnancy_week ON timeline_entries(pregnancy_week);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Health predictions: Users can only see their own predictions
CREATE POLICY "Users can view own health predictions" ON health_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health predictions" ON health_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Articles: Published articles are public, unpublished only visible to author
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view own articles" ON articles
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert own articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles" ON articles
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own articles" ON articles
  FOR DELETE USING (auth.uid() = author_id);

-- Article bookmarks: Users can only see and modify their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON article_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON article_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON article_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Gallery photos: Users can only see and modify their own photos
CREATE POLICY "Users can view own gallery photos" ON gallery_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gallery photos" ON gallery_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gallery photos" ON gallery_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gallery photos" ON gallery_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Pregnancy profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own pregnancy profile" ON pregnancy_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pregnancy profile" ON pregnancy_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pregnancy profile" ON pregnancy_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pregnancy profile" ON pregnancy_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Timeline entries: Users can only see and modify their own entries
CREATE POLICY "Users can view own timeline entries" ON timeline_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline entries" ON timeline_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline entries" ON timeline_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline entries" ON timeline_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pregnancy_profiles_updated_at BEFORE UPDATE ON pregnancy_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_entries_updated_at BEFORE UPDATE ON timeline_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schema setup complete!
-- Sample data will be inserted through the API when users register and create content.

-- Note: To insert sample articles later (after creating users through registration):
-- You can use queries like this:
-- 
-- INSERT INTO articles (title, content, excerpt, category, author_id, published, read_time) VALUES
-- ('Tips Mengatasi Mual Morning Sickness', 
--  'Morning sickness adalah kondisi yang sangat umum dialami oleh ibu hamil...',
--  'Cara alami dan efektif untuk mengurangi rasa mual di trimester pertama kehamilan.',
--  'Trimester 1',
--  'your-user-id-here',
--  true,
--  '5 min read');
