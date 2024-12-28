import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

interface LogsHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
}

export default function LogsHeader({
  showFilters,
  onToggleFilters,
  autoScroll,
  onToggleAutoScroll
}: LogsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Logs système</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleFilters}
          className={`p-2 rounded-lg transition-colors ${
            showFilters ? 'bg-indigo-500' : 'hover:bg-gray-800/50'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleAutoScroll}
          className={`p-2 rounded-lg transition-colors ${
            autoScroll ? 'bg-indigo-500' : 'hover:bg-gray-800/50'
          }`}
          title={autoScroll ? 'Désactiver l\'auto-scroll' : 'Activer l\'auto-scroll'}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}