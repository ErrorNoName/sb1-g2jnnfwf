/*
  # Update profiles and messages schema

  1. Changes
    - Add unique constraint to username in profiles
    - Update messages foreign keys to reference profiles
    - Add indexes for performance
  
  2. Security
    - Update RLS policies for better access control
*/

-- Add unique constraint to username if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Create indexes for profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_username'
    ) THEN
        CREATE INDEX idx_profiles_username ON profiles(username);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_created_at'
    ) THEN
        CREATE INDEX idx_profiles_created_at ON profiles(created_at);
    END IF;
END $$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        new.id,
        new.email,
        -- Extract username from email (before @)
        split_part(new.email, '@', 1)
    )
    ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        email = EXCLUDED.email;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing messages constraints if they exist
DO $$ 
BEGIN
    ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
    DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update messages foreign keys if table exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'messages'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT messages_sender_id_fkey
            FOREIGN KEY (sender_id)
            REFERENCES profiles(id)
            ON DELETE CASCADE,
        ADD CONSTRAINT messages_recipient_id_fkey
            FOREIGN KEY (recipient_id)
            REFERENCES profiles(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- Drop existing policies safely
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
    DROP POLICY IF EXISTS "Messages read access" ON messages;
    DROP POLICY IF EXISTS "Messages send access" ON messages;
    DROP POLICY IF EXISTS "Messages update access" ON messages;
EXCEPTION
    WHEN undefined_table OR undefined_object THEN
        NULL;
END $$;

-- Create new policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Messages read access'
    ) THEN
        CREATE POLICY "Messages read access"
            ON messages FOR SELECT
            USING (
                auth.uid() IN (sender_id, recipient_id)
                AND deleted_at IS NULL
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Messages send access'
    ) THEN
        CREATE POLICY "Messages send access"
            ON messages FOR INSERT
            WITH CHECK (
                auth.uid() = sender_id
                AND EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = recipient_id
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Messages update access'
    ) THEN
        CREATE POLICY "Messages update access"
            ON messages FOR UPDATE
            USING (auth.uid() = recipient_id);
    END IF;
END $$;

-- Create trigger function for message updates
CREATE OR REPLACE FUNCTION handle_message_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow updating read_at and deleted_at
    IF (NEW.read_at IS NOT NULL AND OLD.read_at IS NULL) OR
       (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        RETURN NEW;
    END IF;
    
    -- Keep all other fields unchanged
    NEW.id = OLD.id;
    NEW.sender_id = OLD.sender_id;
    NEW.recipient_id = OLD.recipient_id;
    NEW.subject = OLD.subject;
    NEW.content = OLD.content;
    NEW.created_at = OLD.created_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS message_update_trigger ON messages;
CREATE TRIGGER message_update_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_update();