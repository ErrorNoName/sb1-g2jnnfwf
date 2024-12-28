import React from 'react';
import { Inbox as InboxIcon, Trash2 } from 'lucide-react';

interface InboxStatsProps {
  totalMessages: number;
  unreadCount: number;
  capacityPercentage: number;
  onDeleteAll: () => void;
}

export default function InboxStats({ 
  totalMessages, 
  unreadCount, 
  capacityPercentage,
  onDeleteAll 
}: InboxStatsProps) {
  return (
    <div className="glass p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <InboxIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">
              {totalMessages} message{totalMessages !== 1 ? 's' : ''}
            </span>
          </div>
          
          {unreadCount > 0 && (
            <div className="text-sm">
              <span className="text-indigo-400">{unreadCount}</span> non lu{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
          
          <div className="text-sm">
            Capacité utilisée: <span className={`font-medium ${
              capacityPercentage > 90 ? 'text-red-400' : 
              capacityPercentage > 70 ? 'text-yellow-400' : 
              'text-emerald-400'
            }`}>{capacityPercentage}%</span>
          </div>
        </div>

        {totalMessages > 0 && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Tout supprimer</span>
          </button>
        )}
      </div>
    </div>
  );
}