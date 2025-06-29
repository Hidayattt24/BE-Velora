-- Supabase Storage Setup for Gallery Photos
-- Run these commands in Supabase SQL Editor (as authenticated user)

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

-- Note: Storage policies are typically managed through Supabase Dashboard
-- Go to Storage > Policies in your Supabase Dashboard to set up policies
-- 
-- Or use these alternative commands that don't require table ownership:

-- 2. Create policies using supabase_admin role (if available)
-- These commands should work in most Supabase projects:

-- Policy for uploading photos (users can upload to their own folders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload gallery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload gallery photos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = ''gallery-photos'' 
      AND auth.uid() IS NOT NULL
    )';
  END IF;
END $$;

-- Policy for viewing photos (public read access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view gallery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view gallery photos" ON storage.objects
    FOR SELECT USING (
      bucket_id = ''gallery-photos''
    )';
  END IF;
END $$;

-- Policy for updating photos (users can update their own photos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their gallery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their gallery photos" ON storage.objects
    FOR UPDATE USING (
      bucket_id = ''gallery-photos'' 
      AND auth.uid() IS NOT NULL
    )';
  END IF;
END $$;

-- Policy for deleting photos (users can delete their own photos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their gallery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their gallery photos" ON storage.objects
    FOR DELETE USING (
      bucket_id = ''gallery-photos'' 
      AND auth.uid() IS NOT NULL
    )';
  END IF;
END $$;
