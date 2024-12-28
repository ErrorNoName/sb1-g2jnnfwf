/*
  # Fix Profile Search

  1. Changes
    - Add text search capabilities to profiles using only username
    - Add indexes for better search performance
    - Add secure RLS policies for profile search

  2. Security
    - Add RLS policies for profile search
    - Restrict profile visibility to authenticated users
*/

-- Add text search capabilities to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_text TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(username, ''))) STORED;

-- Add GIN index for full text search
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING GIN (search_text);

-- Add RLS policies for profile search
CREATE POLICY "Authenticated users can search profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add function to search profiles
CREATE OR REPLACE FUNCTION search_profiles(search_query TEXT, current_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    similarity(p.username, search_query) as similarity
  FROM profiles p
  WHERE 
    p.id != current_user_id
    AND (
      p.username ILIKE '%' || search_query || '%'
      OR p.search_text @@ plainto_tsquery('simple', search_query)
    )
  ORDER BY similarity DESC, username
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;