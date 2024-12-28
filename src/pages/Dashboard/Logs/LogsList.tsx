import React, { useRef, useEffect, useCallback } from 'react';
import { useLogging } from '../../../hooks/useLogging';
import LogEntry from './LogEntry';
import type { LogFilter } from '../../../types/logging';

interface LogsListProps {
  filters: LogFilter;
  autoScroll: boolean;
}

export default function LogsList({ filters, autoScroll }: LogsListProps) {
  const { logs, loading, error, searchLogs, refreshLogs } = useLogging();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async () => {
    if (Object.keys(filters).length > 0) {
      await searchLogs(filters);
    }
  }, [filters, searchLogs]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  if (loading) {
    return (
      <div className="glass rounded-lg">
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-lg">
        <div className="p-4 text-red-400">{error}</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="glass rounded-lg">
        <div className="p-4 text-gray-400">Aucun log à afficher</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-2">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}