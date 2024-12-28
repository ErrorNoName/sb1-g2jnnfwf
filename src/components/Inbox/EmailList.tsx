import React from 'react';
import { Trash2, Mail, MailOpen } from 'lucide-react';
import type { Message } from '../../types/inbox';

interface EmailListProps {
  messages: Message[];
  onDelete: (id: string) => void;
  onSelect: (message: Message) => void;
}

export default function EmailList({ messages, onDelete, onSelect }: EmailListProps) {
  if (messages.length === 0) {
    return (
      <div className="glass p-6 rounded-lg text-center">
        <p className="text-gray-400">Aucun message dans votre boîte de réception</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg divide-y divide-gray-700">
      {messages.map((message) => (
        <div
          key={message.id}
          className="flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
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
              <h3 className={`text-sm font-medium truncate ${!message.read_at ? 'text-white' : 'text-gray-300'}`}>
                {message.title}
              </h3>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {new Date(message.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate">
              {message.content}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(message.id);
            }}
            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}