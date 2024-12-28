import React, { useState, useCallback } from 'react';
import LogsHeader from './LogsHeader';
import LogsFilter from './LogsFilter';
import LogsList from './LogsList';
import type { LogFilter } from '../../../types/logging';

export default function LogsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState<LogFilter>({});

  const handleFilterChange = useCallback((newFilters: LogFilter) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <LogsHeader
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
      />

      {showFilters && (
        <LogsFilter
          filters={filters}
          onChange={handleFilterChange}
        />
      )}

      <LogsList
        filters={filters}
        autoScroll={autoScroll}
      />
    </div>
  );
}