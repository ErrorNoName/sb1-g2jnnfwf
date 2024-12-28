/*
  # Storage Configuration and Security Update

  1. Changes
    - Configure storage bucket settings
    - Update security policies for file management
    - Set up file type restrictions
  
  2. Security
    - Enable RLS for storage objects
    - Set up access policies for authenticated users
    - Configure public read access
*/

-- Ensure bucket exists with proper configuration
DO $$
BEGIN
    UPDATE storage.buckets
    SET 
        public = true,
        file_size_limit = 10485760, -- 10MB
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    WHERE id = 'reports';
END $$;

-- Reset existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public viewing of reports" ON storage.objects;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive access policies
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