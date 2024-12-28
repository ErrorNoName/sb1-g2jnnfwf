import React from 'react';
import { Calendar } from 'lucide-react';
import type { TimeSlot } from '../../types/booking';

interface AvailableSlotsProps {
  slots: TimeSlot[];
  onBook: (slotId: string) => void;
  isLoading?: boolean;
}

export default function AvailableSlots({ slots, onBook, isLoading }: AvailableSlotsProps) {
  if (isLoading) {
    return (
      <div className="glass p-6 rounded-lg flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="glass p-6 rounded-lg text-center">
        <p className="text-gray-400">Aucun créneau disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-6 space-y-4">
        {slots.map((slot) => (
          <div 
            key={slot.id}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Calendar className="text-indigo-400" />
              <div>
                <p className="font-medium">
                  {new Date(slot.start_time).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-400">
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
            </div>
            <button
              onClick={() => onBook(slot.id)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
            >
              Réserver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}