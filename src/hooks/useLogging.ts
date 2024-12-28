import { useState, useEffect, useCallback } from 'react';
import { LoggingService } from '../services/loggingService';
import type { LogEntry, LogFilter } from '../types/logging';
import { logger } from '../utils/logger';

export function useLogging() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loggingService = LoggingService.getInstance();

  useEffect(() => {
    const unsubscribe = loggingService.subscribe((newLog) => {
      setLogs(prev => {
        if (prev.some(log => log.id === newLog.id)) {
          return prev;
        }
        return [...prev, newLog];
      });
      logger.info('New log received:', { logId: newLog.id });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const searchLogs = useCallback(async (filters: LogFilter) => {
    setLoading(true);
    setError(null);
    try {
      const results = await loggingService.searchLogs(filters);
      setLogs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour rafraîchir les logs
  const refreshLogs = useCallback(async () => {
    try {
      const latestLogs = await loggingService.searchLogs({});
      setLogs(latestLogs);
    } catch (err) {
      logger.error('Failed to refresh logs:', err);
    }
  }, []);

  const createLog = useCallback(async (entry: Omit<LogEntry, 'id' | 'created_at'>) => {
    try {
      return await loggingService.createLog(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create log');
      throw err;
    }
  }, []);

  const acknowledgeLog = useCallback(async (logId: number) => {
    try {
      await loggingService.acknowledgeLog(logId);
      setLogs(prev => 
        prev.map(log => 
          log.id === logId ? { ...log, is_acknowledged: true } : log
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge log');
      throw err;
    }
  }, []);

  return {
    logs,
    loading,
    error,
    searchLogs,
    refreshLogs,
    createLog,
    acknowledgeLog
  };
}