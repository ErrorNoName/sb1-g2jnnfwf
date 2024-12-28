/*
  # Update storage policies and bucket configuration

  1. Changes
    - Update storage bucket settings for file size and public access
    - Recreate storage policies with improved security
    - Add file type validation for uploads
    - Configure proper access control for authenticated users
*/

-- Update storage bucket permissions
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760
WHERE id = 'reports';

-- Recreate storage policies with improved permissions
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