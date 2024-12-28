import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AvatarCrashReportFormData } from '../../types/avatarReport';

interface AvatarReportFormProps {
  onSubmit: (data: AvatarCrashReportFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function AvatarReportForm({ onSubmit, isSubmitting }: AvatarReportFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit({
      avatar_id: formData.get('avatar_id') as string
    });
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-lg space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="avatar_id" className="block text-sm font-medium text-gray-300 mb-1">
            ID de l'avatar VRChat
          </label>
          <input
            type="text"
            id="avatar_id"
            name="avatar_id"
            required
            pattern="^avtr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
            className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="avtr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>
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