-- Drop articles table if exists (since we're removing journal functionality)
-- Run this in Supabase SQL Editor

DROP TABLE IF EXISTS articles CASCADE;

-- Remove any related policies
DROP POLICY IF EXISTS "Allow public read access to published articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to manage their articles" ON articles;

-- Remove any related functions or triggers
DROP FUNCTION IF EXISTS handle_article_updated_at() CASCADE;
DROP TRIGGER IF EXISTS handle_articles_updated_at ON articles;

-- Note: This will permanently delete all article data
-- Make sure to backup if you need the data later
