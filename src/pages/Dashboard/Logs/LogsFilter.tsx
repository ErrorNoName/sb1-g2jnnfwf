import React, { useState, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { LogFilter, SeverityLevel } from '../../../types/logging';

interface LogsFilterProps {
  filters: LogFilter;
  onChange: (filters: LogFilter) => void;
}

export default function LogsFilter({ filters, onChange }: LogsFilterProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [severity, setSeverity] = useState<SeverityLevel | ''>(filters.severity || '');

  const updateFilters = useCallback(() => {
    const newFilters: LogFilter = {};
    if (searchTerm) newFilters.searchTerm = searchTerm;
    if (severity) newFilters.severity = severity;
    onChange(newFilters);
  }, [searchTerm, severity, onChange]);

  useEffect(() => {
    const timer = setTimeout(updateFilters, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, severity, updateFilters]);

  return (
    <div className="glass p-4 rounded-lg space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-gray-800/50 rounded-lg border-0 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as SeverityLevel | '')}
          className="bg-gray-800/50 rounded-lg border-0 p-2 text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les niveaux</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
  );
}