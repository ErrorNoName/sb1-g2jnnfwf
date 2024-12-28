export type SeverityLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id?: number;
  log_type: string;
  severity_level: SeverityLevel;
  description: string;
  source: string;
  metadata?: Record<string, any>;
  created_at?: string;
  user_id?: string;
  is_acknowledged?: boolean;
}

export interface LogFilter {
  type?: string;
  severity?: SeverityLevel;
  dateRange?: [Date, Date];
  searchTerm?: string;
  acknowledged?: boolean;
}