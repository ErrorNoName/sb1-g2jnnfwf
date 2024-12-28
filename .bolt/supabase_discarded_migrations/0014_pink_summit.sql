/*
  # Add logging system
  
  1. New Tables
    - logs: Store system-wide logging information
      - id: Serial primary key
      - log_type: Type of log entry
      - severity_level: Severity of the log
      - description: Log message
      - source: Source of the log
      - metadata: Additional JSON data
      - created_at: Timestamp
      - user_id: Reference to auth.users
      - is_acknowledged: Boolean flag for log status
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    
  3. Performance
    - Add indexes for common queries
*/

-- Create the logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  log_type VARCHAR(50) NOT NULL,
  severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  description TEXT NOT NULL,
  source VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_acknowledged BOOLEAN DEFAULT false
);

-- Create indexes for performance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_created_at') THEN
    CREATE INDEX idx_logs_created_at ON logs(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_severity') THEN
    CREATE INDEX idx_logs_severity ON logs(severity_level);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_type') THEN
    CREATE INDEX idx_logs_type ON logs(log_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_user_id') THEN
    CREATE INDEX idx_logs_user_id ON logs(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logs' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON logs
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logs' 
    AND policyname = 'Enable write access for authenticated users'
  ) THEN
    CREATE POLICY "Enable write access for authenticated users" ON logs
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logs' 
    AND policyname = 'Enable update for acknowledgment'
  ) THEN
    CREATE POLICY "Enable update for acknowledgment" ON logs
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (
        -- Only allow updating is_acknowledged field
        (CASE WHEN is_acknowledged IS NOT NULL 
          THEN true 
          ELSE false 
        END)
      );
  END IF;
END $$;