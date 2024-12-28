/*
  # Fix Avatar Deletion Permissions

  1. Changes
    - Add delete policy for avatar_crash_reports table
    - Add explicit check for reported_by match
  
  2. Security
    - Only allow users to delete their own reports
    - Maintain RLS protection
*/

-- Add delete policy for avatar crash reports
CREATE POLICY "Users can delete their own avatar reports"
    ON avatar_crash_reports FOR DELETE 
    TO authenticated
    USING (auth.uid() = reported_by);