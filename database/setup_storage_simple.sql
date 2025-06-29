-- Simple Supabase Storage Setup
-- Alternative method: Create bucket only via SQL, setup policies via Dashboard

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

-- 2. Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'gallery-photos';

-- Note: After running this SQL, go to Supabase Dashboard > Storage > Policies
-- and create the following policies manually:

-- Policy 1: "Allow public read access"
-- Operation: SELECT
-- Target roles: public
-- USING expression: bucket_id = 'gallery-photos'

-- Policy 2: "Allow authenticated users to upload"  
-- Operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL

-- Policy 3: "Allow users to update their own uploads"
-- Operation: UPDATE  
-- Target roles: authenticated
-- USING expression: bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL

-- Policy 4: "Allow users to delete their own uploads"
-- Operation: DELETE
-- Target roles: authenticated  
-- USING expression: bucket_id = 'gallery-photos' AND auth.uid() IS NOT NULL
