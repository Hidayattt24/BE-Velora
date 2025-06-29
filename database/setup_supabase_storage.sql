-- Supabase Storage Setup for Gallery Photos
-- Run these commands in Supabase SQL Editor

-- 1. Create bucket for gallery photos (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Row Level Security (RLS) policies for gallery-photos bucket

-- Policy: Users can insert their own photos
CREATE POLICY "Users can upload gallery photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own photos and all public photos
CREATE POLICY "Users can view gallery photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'gallery-photos'
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their gallery photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their gallery photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
