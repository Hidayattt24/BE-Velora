-- Add storage-related columns to gallery_photos table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE gallery_photos 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT;

-- Add comment for documentation
COMMENT ON COLUMN gallery_photos.storage_path IS 'Path to the file in Supabase Storage';
COMMENT ON COLUMN gallery_photos.storage_bucket IS 'Supabase Storage bucket name';

-- Create index for faster queries on storage_path
CREATE INDEX IF NOT EXISTS idx_gallery_photos_storage_path ON gallery_photos(storage_path);

-- Update existing records that might have local paths to null for now
-- (You can manually update these later if needed)
UPDATE gallery_photos 
SET storage_path = NULL, storage_bucket = NULL 
WHERE image_url LIKE '/uploads/%' AND (storage_path IS NULL OR storage_bucket IS NULL);
