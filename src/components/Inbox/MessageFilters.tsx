import React from 'react';
import { Filter, Search, SortAsc, SortDesc } from 'lucide-react';

interface MessageFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  filter: 'all' | 'unread' | 'read';
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
}

export default function MessageFilters({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  filter,
  onFilterChange
}: MessageFiltersProps) {
  return (
    <div className="glass p-4 rounded-lg mb-6 flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher dans les messages..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 bg-gray-800/50 rounded-lg border-0 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white"
          title="Trier par date"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-5 h-5" />
          ) : (
            <SortDesc className="w-5 h-5" />
          )}
        </button>

        <div className="relative group">
          <button
            className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white"
            title="Filtrer"
          >
            <Filter className="w-5 h-5" />
          </button>

          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 hidden group-hover:block">
            <button
              onClick={() => onFilterChange('all')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 ${
                filter === 'all' ? 'text-indigo-400' : 'text-white'
              }`}
            >
              Tous les messages
            </button>
            <button
              onClick={() => onFilterChange('unread')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 ${
                filter === 'unread' ? 'text-indigo-400' : 'text-white'
              }`}
            >
              Non lus
            </button>
            <button
              onClick={() => onFilterChange('read')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 ${
                filter === 'read' ? 'text-indigo-400' : 'text-white'
              }`}
            >
              Lus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}