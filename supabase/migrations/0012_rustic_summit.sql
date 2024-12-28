/*
  # Fix Messaging System Policies

  1. Changes
    - Fix infinite recursion in RLS policies
    - Add message status handling
    - Optimize performance with better indexes

  2. Security
    - Improve RLS policies clarity
    - Add better access controls
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view message threads" ON messages;
DROP POLICY IF EXISTS "Messages read access" ON messages;
DROP POLICY IF EXISTS "Messages send access" ON messages;
DROP POLICY IF EXISTS "Messages update access" ON messages;

-- Create cleaner, more efficient policies
CREATE POLICY "Messages read access"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (sender_id, recipient_id)
    AND deleted_at IS NULL
  );

CREATE POLICY "Messages send access"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = recipient_id
      AND id != sender_id
    )
  );

CREATE POLICY "Messages update access"
  ON messages FOR UPDATE
  USING (auth.uid() IN (sender_id, recipient_id));

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_combined 
  ON messages(sender_id, recipient_id, deleted_at);

-- Create trigger function for message updates
CREATE OR REPLACE FUNCTION handle_message_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating read_at and deleted_at
  IF TG_OP = 'UPDATE' THEN
    -- Update status based on changes
    IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
      NEW.status = 'read';
    ELSIF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      NEW.status = 'deleted';
    END IF;
    
    -- Keep other fields unchanged
    NEW.id = OLD.id;
    NEW.sender_id = OLD.sender_id;
    NEW.recipient_id = OLD.recipient_id;
    NEW.subject = OLD.subject;
    NEW.content = OLD.content;
    NEW.created_at = OLD.created_at;
    NEW.thread_id = OLD.thread_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS message_update_trigger ON messages;
CREATE TRIGGER message_update_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_update();