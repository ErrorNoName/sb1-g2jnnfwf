import React, { useState } from 'react';
import type { TimeSlot } from '../../types/booking';

interface BookingDialogProps {
  slot: TimeSlot;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (discordId: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function BookingDialog({ 
  slot, 
  isOpen, 
  onClose, 
  onConfirm,
  isSubmitting 
}: BookingDialogProps) {
  const [discordId, setDiscordId] = useState('');
  const [error, setError] = useState<string>();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!discordId.includes('#')) {
      setError('Format invalide. Exemple: User#1234');
      return;
    }

    try {
      await onConfirm(discordId);
      onClose();
    } catch (error) {
      setError('Une erreur est survenue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="glass relative p-6 rounded-lg max-w-md w-full m-4 space-y-4">
        <h3 className="text-lg font-semibold">Réserver un créneau</h3>
        
        <div className="space-y-2">
          <p>
            {new Date(slot.start_time).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-gray-400">
            {new Date(slot.start_time).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
            {' - '}
            {new Date(slot.end_time).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="discordId" className="block text-sm font-medium text-gray-300 mb-1">
              Votre ID Discord
            </label>
            <input
              type="text"
              id="discordId"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Exemple: User#1234"
              className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Réservation...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}