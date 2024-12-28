/*
  # Initial Database Setup and Optimization

  1. Table Creation
    - Create reports table with proper columns and constraints
    - Create avatar_crash_reports table
    - Enable RLS on all tables

  2. Indexes & Optimizations
    - Add indexes for frequently queried columns
    - Add updated_at trigger
    - Add proper constraints and CASCADE rules
*/

-- Create the reports table
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL,
    proof_url text NOT NULL,
    rules integer[] NOT NULL DEFAULT '{}',
    warnings integer NOT NULL DEFAULT 0,
    kicks integer NOT NULL DEFAULT 0,
    mutes integer NOT NULL DEFAULT 0,
    reported_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_counts CHECK (
        warnings >= 0 AND 
        kicks >= 0 AND 
        mutes >= 0
    ),
    CONSTRAINT reports_reported_by_fkey 
        FOREIGN KEY (reported_by) 
        REFERENCES auth.users(id) 
        ON DELETE SET NULL
);

-- Create the avatar_crash_reports table
CREATE TABLE IF NOT EXISTS avatar_crash_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id text NOT NULL,
    reported_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT avatar_crash_reports_reported_by_fkey 
        FOREIGN KEY (reported_by) 
        REFERENCES auth.users(id) 
        ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_crash_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read all reports"
    ON reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can read all avatar reports"
    ON avatar_crash_reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own avatar reports"
    ON avatar_crash_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_avatar_crash_reports_created_at ON avatar_crash_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_avatar_crash_reports_reported_by ON avatar_crash_reports(reported_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();