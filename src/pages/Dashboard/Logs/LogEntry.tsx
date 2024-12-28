import React from 'react';
import type { LogEntry as LogEntryType } from '../../../types/logging';

const SEVERITY_COLORS = {
  INFO: 'text-blue-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  CRITICAL: 'text-red-600'
};

interface LogEntryProps {
  log: LogEntryType;
}

export default function LogEntry({ log }: LogEntryProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-800/30">
      <span className={`text-sm ${SEVERITY_COLORS[log.severity_level]}`}>
        {log.severity_level}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm break-all">{log.description}</p>
        <div className="flex gap-4 mt-1 text-xs text-gray-400">
          <span>{formatDate(log.created_at || '')}</span>
          <span>{log.source}</span>
          {log.metadata && (
            <span className="font-mono">
              {JSON.stringify(log.metadata)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}