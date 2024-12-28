/*
  # Add profiles and recipient validation

  1. Changes
    - Create profiles table if not exists
    - Add functions for recipient validation and lookup
    - Add indexes for performance

  2. Security
    - Enable RLS on profiles table
    - Add policies for profile access
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create RLS policies with IF NOT EXISTS
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
            ON profiles FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
            ON profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- Create function to validate and lookup recipients
CREATE OR REPLACE FUNCTION validate_recipient(recipient_username TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Lookup user by username
  SELECT id INTO user_id
  FROM profiles
  WHERE username = recipient_username;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Recipient not found: %', recipient_username;
  END IF;

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search recipients
CREATE OR REPLACE FUNCTION search_recipients(search_term TEXT, current_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username
  FROM profiles p
  WHERE 
    p.id != current_user_id
    AND p.username ILIKE search_term || '%'
  ORDER BY 
    p.username
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create trigger function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    split_part(new.email, '@', 1)
  )
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();