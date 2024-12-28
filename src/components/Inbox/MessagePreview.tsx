import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import type { Message } from '../../types/inbox';

interface MessagePreviewProps {
  message: Message;
  onSelect: (message: Message) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export default function MessagePreview({ message, onSelect, onDelete, isSelected }: MessagePreviewProps) {
  const formattedDate = format(new Date(message.created_at), 'PPp', { locale: fr });

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all
        ${isSelected ? 'bg-indigo-500/20' : 'hover:bg-gray-800/30'}
      `}
      onClick={() => onSelect(message)}
    >
      <div className="flex-shrink-0">
        {message.read_at ? (
          <MailOpen className="w-5 h-5 text-gray-400" />
        ) : (
          <Mail className="w-5 h-5 text-indigo-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`text-sm font-medium truncate ${!message.read_at ? 'text-white' : 'text-gray-300'}`}>
              {message.subject}
            </h3>
            <p className="text-xs text-gray-400">
              {message.sender.username === 'me' ? 'À: ' : 'De: '}
              {message.sender.username === 'me' ? message.recipient.username : message.sender.username}
            </p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {formattedDate}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate mt-1">
          {message.content}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(message.id);
        }}
        className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}