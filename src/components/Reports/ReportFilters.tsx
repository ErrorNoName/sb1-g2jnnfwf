import React from 'react';
import { Calendar, SortAsc, SortDesc, Users } from 'lucide-react';

interface ReportFiltersProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  groupByUser: boolean;
  onGroupByUserChange: (value: boolean) => void;
}

export default function ReportFilters({
  dateRange,
  onDateRangeChange,
  sortOrder,
  onSortOrderChange,
  groupByUser,
  onGroupByUserChange,
}: ReportFiltersProps) {
  return (
    <div className="glass p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          value={dateRange[0]?.toISOString().split('T')[0] || ''}
          onChange={(e) => onDateRangeChange([new Date(e.target.value), dateRange[1]])}
          className="bg-gray-800/50 rounded px-2 py-1 text-sm"
        />
        <span className="text-gray-400">à</span>
        <input
          type="date"
          value={dateRange[1]?.toISOString().split('T')[0] || ''}
          onChange={(e) => onDateRangeChange([dateRange[0], new Date(e.target.value)])}
          className="bg-gray-800/50 rounded px-2 py-1 text-sm"
        />
      </div>

      <button
        onClick={() => onGroupByUserChange(!groupByUser)}
        className={`flex items-center gap-2 px-3 py-1 rounded ${
          groupByUser ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-gray-800/50'
        }`}
      >
        <Users size={16} />
        <span className="text-sm">Grouper par utilisateur</span>
      </button>

      <button
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-800/50"
      >
        {sortOrder === 'asc' ? (
          <SortAsc size={16} className="text-gray-400" />
        ) : (
          <SortDesc size={16} className="text-gray-400" />
        )}
        <span className="text-sm">Date</span>
      </button>
    </div>
  );
}