/*
  # Messaging System Fixes

  1. New Tables
    - Add missing indexes and constraints
    - Add message status tracking
    - Add message thread support

  2. Security
    - Add additional RLS policies
    - Add message rate limiting
    - Add content validation

  3. Changes
    - Add message thread support
    - Add message status tracking
    - Improve performance with indexes
*/

-- Add message thread support
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'deleted')) DEFAULT 'sent';

-- Add rate limiting function
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count INT;
BEGIN
  -- Count messages sent in the last hour
  SELECT COUNT(*)
  INTO message_count
  FROM messages
  WHERE sender_id = NEW.sender_id
  AND created_at > NOW() - INTERVAL '1 hour';

  -- Limit to 100 messages per hour
  IF message_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 100 messages per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create rate limiting trigger
DROP TRIGGER IF EXISTS message_rate_limit_trigger ON messages;
CREATE TRIGGER message_rate_limit_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

-- Add content validation function
CREATE OR REPLACE FUNCTION validate_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check subject length
  IF length(NEW.subject) > 200 THEN
    RAISE EXCEPTION 'Subject too long (maximum 200 characters)';
  END IF;

  -- Check content length
  IF length(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Message too long (maximum 10000 characters)';
  END IF;

  -- Basic content validation
  IF NEW.subject ~ '^[[:space:]]*$' OR NEW.content ~ '^[[:space:]]*$' THEN
    RAISE EXCEPTION 'Subject and content cannot be empty';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create content validation trigger
DROP TRIGGER IF EXISTS message_content_validation_trigger ON messages;
CREATE TRIGGER message_content_validation_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_content();

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);

-- Update RLS policies
CREATE POLICY "Users can view message threads"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.thread_id = messages.id
      AND auth.uid() IN (m.sender_id, m.recipient_id)
    )
  );

-- Add function to handle message status updates
CREATE OR REPLACE FUNCTION update_message_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    NEW.status = 'read';
  ELSIF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    NEW.status = 'deleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create message status trigger
DROP TRIGGER IF EXISTS message_status_trigger ON messages;
CREATE TRIGGER message_status_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_status();