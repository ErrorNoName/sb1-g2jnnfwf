import { supabase } from '../lib/supabase';
import type { LogEntry, LogFilter, SeverityLevel } from '../types/logging';

class LoggingService {
  private static instance: LoggingService;
  private subscribers: ((log: LogEntry) => void)[] = [];

  private constructor() {
    this.setupRealtimeSubscription();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private setupRealtimeSubscription() {
    supabase
      .channel('logs_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          this.notifySubscribers(payload.new as LogEntry);
        }
      )
      .subscribe();
  }

  async createLog(entry: Omit<LogEntry, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('logs')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchLogs(filters: LogFilter) {
    let query = supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('log_type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity_level', filters.severity);
    }
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange[0].toISOString())
        .lte('created_at', filters.dateRange[1].toISOString());
    }
    if (filters.searchTerm) {
      query = query.ilike('description', `%${filters.searchTerm}%`);
    }
    if (typeof filters.acknowledged === 'boolean') {
      query = query.eq('is_acknowledged', filters.acknowledged);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async acknowledgeLog(logId: number) {
    const { error } = await supabase
      .from('logs')
      .update({ is_acknowledged: true })
      .eq('id', logId);

    if (error) throw error;
  }

  subscribe(callback: (log: LogEntry) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(log: LogEntry) {
    this.subscribers.forEach(callback => callback(log));
  }

  async getLogsByType(type: string) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('log_type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getLogsBySeverity(severity: SeverityLevel) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('severity_level', severity)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}