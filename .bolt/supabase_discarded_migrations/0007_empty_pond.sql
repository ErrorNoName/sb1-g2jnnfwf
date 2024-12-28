/*
  # Storage Configuration Update

  1. Changes
    - Update storage bucket configuration
    - Set file size limit to 5MB
    - Configure allowed file types
  
  2. Security
    - Enable Row Level Security
    - Set up file extension-based upload policies
    - Configure public read access
    - Set up owner-based permissions
*/

-- Configure storage bucket
UPDATE storage.buckets 
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf']
WHERE id = 'reports';

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Owner based permissions" ON storage.objects;

-- Create new policies
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'reports' AND
    (CASE 
      WHEN RIGHT(LOWER(name), 4) IN ('.jpg', '.png', '.pdf') THEN true
      WHEN RIGHT(LOWER(name), 5) = '.jpeg' THEN true
      ELSE false
    END)
  );

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'reports');

CREATE POLICY "Owner based permissions" ON storage.objects
  FOR ALL TO authenticated
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);