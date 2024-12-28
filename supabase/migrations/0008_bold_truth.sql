/*
  # Messages System Migration
  
  1. Tables
    - `messages` table for internal messaging system
      - UUID primary key with auto-generation
      - Foreign key relationships to auth.users
      - Timestamps for creation, reading, and deletion
      - Subject and content fields for message body
  
  2. Security
    - Row Level Security (RLS) enabled
    - Policies for reading and sending messages
    - Update restrictions via trigger
    
  3. Performance
    - Indexes on frequently queried columns
    - Constraint to prevent self-messaging
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS messages;

-- Create messages table with correct schema and constraints
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own messages"
    ON messages FOR SELECT
    USING (
        auth.uid() IN (sender_id, recipient_id) 
        AND deleted_at IS NULL
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (auth.uid() IN (sender_id, recipient_id));

-- Create function to handle message deletion
CREATE OR REPLACE FUNCTION handle_message_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Prevent updates except for deleted_at and read_at
        NEW.id = OLD.id;
        NEW.sender_id = OLD.sender_id;
        NEW.recipient_id = OLD.recipient_id;
        NEW.subject = OLD.subject;
        NEW.content = OLD.content;
        NEW.created_at = OLD.created_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message updates
CREATE TRIGGER messages_update_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_deletion();