/*
  # Update storage configuration and policies

  1. Changes
    - Update storage bucket settings for reports
    - Reset and recreate storage access policies
  
  2. Security
    - Restrict file uploads to specific MIME types
    - Enforce authenticated user policies
    - Maintain public read access
*/

-- Update storage bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
WHERE id = 'reports';

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing of reports" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'reports' AND
    (LOWER(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'mp4']))
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'reports')
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'reports');

CREATE POLICY "Allow public viewing of reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reports');