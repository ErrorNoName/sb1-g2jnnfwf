import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface AvatarCrashFormProps {
  onSubmit: (avatarId: string) => Promise<void>;
}

export default function AvatarCrashForm({ onSubmit }: AvatarCrashFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarId, setAvatarId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarId.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(avatarId);
      setAvatarId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-lg space-y-4">
      <div>
        <label htmlFor="avatarId" className="block text-sm font-medium text-gray-300 mb-2">
          ID de l'avatar VRChat
        </label>
        <input
          type="text"
          id="avatarId"
          value={avatarId}
          onChange={(e) => setAvatarId(e.target.value)}
          pattern="^avtr_[a-zA-Z0-9-]+$"
          placeholder="avtr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          Format: avtr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          <AlertTriangle size={16} />
          {isSubmitting ? 'Envoi...' : 'Signaler l\'avatar'}
        </button>
      </div>
    </form>
  );
}