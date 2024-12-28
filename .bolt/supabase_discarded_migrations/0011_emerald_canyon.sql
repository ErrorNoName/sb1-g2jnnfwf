/*
  # Time Slots and Available Slots Structure

  1. Tables Created/Modified
    - time_slots: Stores availability and booking information
      - id (uuid, primary key)
      - host_id (uuid, references auth.users)
      - discord_id (text)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - is_booked (boolean)
      - booked_by (uuid, references auth.users)
      - booked_by_discord_id (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Views Created
    - available_slots: Shows all available (unbooked) future time slots

  3. Security
    - RLS enabled on time_slots
    - Policies for CRUD operations based on user roles
*/

-- Drop view first since it depends on time_slots
DROP VIEW IF EXISTS available_slots;

-- Drop existing table if exists
DROP TABLE IF EXISTS time_slots;

-- Create time_slots table
CREATE TABLE time_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id text NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_booked boolean DEFAULT false,
    booked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    booked_by_discord_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read available time slots"
    ON time_slots FOR SELECT
    TO authenticated
    USING (
        is_booked = false OR 
        host_id = auth.uid() OR 
        booked_by = auth.uid()
    );

CREATE POLICY "Users can create their own time slots"
    ON time_slots FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can update their own slots"
    ON time_slots FOR UPDATE
    TO authenticated
    USING (
        host_id = auth.uid() OR 
        (is_booked = false AND booked_by = auth.uid())
    );

CREATE POLICY "Users can delete their own slots"
    ON time_slots FOR DELETE
    TO authenticated
    USING (host_id = auth.uid() AND NOT is_booked);

-- Create indexes
CREATE INDEX idx_time_slots_host_id ON time_slots(host_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_time_slots_is_booked ON time_slots(is_booked);
CREATE INDEX idx_time_slots_booked_by ON time_slots(booked_by);

-- Create trigger for updated_at
CREATE TRIGGER update_time_slots_updated_at
    BEFORE UPDATE ON time_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create available_slots view
CREATE VIEW available_slots AS
SELECT 
    ts.id,
    ts.host_id,
    ts.discord_id,
    ts.start_time,
    ts.end_time,
    ts.created_at,
    p.username as host_username
FROM time_slots ts
LEFT JOIN auth.users u ON ts.host_id = u.id
LEFT JOIN profiles p ON ts.host_id = p.id
WHERE NOT ts.is_booked
    AND ts.start_time > now()
ORDER BY ts.start_time ASC;