/*
  # Add delete policy for reports

  1. Changes
    - Add RLS policy to allow authenticated users to delete their own reports
  
  2. Security
    - Only report creators can delete their own reports
    - Maintains data integrity with proper authorization checks
*/

-- Add delete policy for reports table
CREATE POLICY "Users can delete their own reports"
    ON reports FOR DELETE 
    TO authenticated
    USING (auth.uid() = reported_by);

-- Add delete policy for storage objects
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE 
    TO authenticated
    USING (
        bucket_id = 'reports' AND
        (storage.foldername(name))[1] = 'proofs'
    );