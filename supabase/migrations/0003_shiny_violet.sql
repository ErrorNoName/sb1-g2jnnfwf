/*
  # Storage Setup
  
  1. Create storage bucket for file uploads
  2. Set up storage policies
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated users can view files"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'reports');

-- Add path security
CREATE POLICY "Restrict file paths"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'reports' AND
    (storage.foldername(name))[1] = 'proofs'
);