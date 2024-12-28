import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export function Toast() {
  const { message, type, hideToast } = useToast();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(hideToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, hideToast]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]}`}>
        {icons[type]}
        <p className="text-sm">{message}</p>
        <button
          onClick={hideToast}
          className="ml-2 p-1 rounded-full hover:bg-gray-700/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}