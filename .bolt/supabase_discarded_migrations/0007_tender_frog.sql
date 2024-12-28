/*
  # Storage Configuration and Security Update

  1. Changes
    - Update storage bucket settings for 'reports'
    - Configure file size limits and allowed MIME types
    - Reset and recreate storage policies
  
  2. Security
    - Enable Row Level Security (RLS)
    - Set up granular access policies:
      * Authenticated users can upload specific file types
      * Public read access for all files
      * Owner-based update and delete permissions
    - Implement file type validation
*/

-- Update storage bucket configuration
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
WHERE name = 'reports';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner deletes" ON storage.objects;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'reports' AND
    (CASE 
        WHEN RIGHT(LOWER(name), 4) IN ('.jpg', '.png', '.gif', 'jpeg', '.mp4') THEN true
        ELSE false
    END)
);

CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reports');

CREATE POLICY "Allow owner updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow owner deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'reports');