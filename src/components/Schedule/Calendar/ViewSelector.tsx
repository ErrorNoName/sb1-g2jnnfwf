import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ViewSelectorProps {
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
}

export default function ViewSelector({ view, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
      <button
        onClick={() => onViewChange('month')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          ${view === 'month' ? 'bg-indigo-500' : 'hover:bg-gray-700/50'}
        `}
      >
        <Calendar size={16} />
        <span>Mois</span>
      </button>
      <button
        onClick={() => onViewChange('week')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          ${view === 'week' ? 'bg-indigo-500' : 'hover:bg-gray-700/50'}
        `}
      >
        <Clock size={16} />
        <span>Semaine</span>
      </button>
    </div>
  );
}