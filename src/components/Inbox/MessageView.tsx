import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Reply, Forward, Trash2 } from 'lucide-react';
import type { Message } from '../../types/inbox';

interface MessageViewProps {
  message: Message;
  onClose: () => void;
  onDelete: (id: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
}

export default function MessageView({ message, onClose, onDelete, onReply, onForward }: MessageViewProps) {
  const formattedDate = format(new Date(message.created_at), 'PPp', { locale: fr });

  return (
    <div className="glass rounded-lg p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{message.subject}</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <span className="text-gray-400">De:</span>{' '}
              {message.sender.username}
            </p>
            <p>
              <span className="text-gray-400">À:</span>{' '}
              {message.recipient.username}
            </p>
            <p className="text-gray-400">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white"
            >
              <Reply className="w-5 h-5" />
            </button>
          )}
          
          {onForward && (
            <button
              onClick={() => onForward(message)}
              className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white"
            >
              <Forward className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(message.id)}
            className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <div className="prose prose-invert max-w-none">
          {message.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}