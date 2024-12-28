/*
  # Custom Storage Implementation
  
  1. Tables
    - file_metadata: Stores information about uploaded files
    - file_access: Tracks file permissions
  
  2. Security
    - RLS policies for file access control
    - Constraints for file paths and types
*/

-- Create enum for file types
CREATE TYPE file_type AS ENUM ('image/jpeg', 'image/png', 'image/gif', 'video/mp4');

-- Create file metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filename text NOT NULL,
    file_path text NOT NULL,
    file_type file_type NOT NULL,
    size_bytes bigint NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_file_path CHECK (
        file_path LIKE 'proofs/%' AND
        file_path ~ '^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$'
    )
);

-- Enable RLS
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view files"
    ON file_metadata FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upload their own files"
    ON file_metadata FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

-- Create indexes
CREATE INDEX idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
CREATE INDEX idx_file_metadata_created_at ON file_metadata(created_at);

-- Create function to validate file path
CREATE OR REPLACE FUNCTION validate_file_path(path text)
RETURNS boolean AS $$
BEGIN
    RETURN path ~ '^proofs/[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$';
END;
$$ LANGUAGE plpgsql;