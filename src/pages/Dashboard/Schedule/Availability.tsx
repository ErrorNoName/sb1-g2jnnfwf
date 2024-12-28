import React, { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { availabilityService } from '../../../services/availabilityService';
import MonthView from '../../../components/Schedule/Calendar/MonthView';
import WeekView from '../../../components/Schedule/Calendar/WeekView';
import ViewSelector from '../../../components/Schedule/Calendar/ViewSelector';
import DiscordInput from '../../../components/Schedule/DiscordInput';
import type { TimeSlot } from '../../../types/booking';

export default function Availability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [discordId, setDiscordId] = useState('');
  const [discordError, setDiscordError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const user = useAuthStore(state => state.user);

  const validateDiscordId = (id: string): boolean => {
    if (!id.trim()) {
      setDiscordError('Le pseudo Discord est requis');
      return false;
    }
    setDiscordError(undefined);
    return true;
  };

  const handleSave = async () => {
    if (!user) {
      showToast('Vous devez être connecté', 'error');
      return;
    }

    if (!validateDiscordId(discordId)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await availabilityService.saveAvailability({
        hostId: user.id,
        discordId,
        slots: slots.map(slot => ({
          start_time: slot.start_time,
          end_time: slot.end_time
        }))
      });
      showToast('Disponibilités enregistrées avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSlots(prev => {
      const exists = prev.some(s => 
        s.start_time === slot.start_time && 
        s.end_time === slot.end_time
      );
      if (exists) {
        return prev.filter(s => 
          s.start_time !== slot.start_time || 
          s.end_time !== slot.end_time
        );
      }
      return [...prev, slot];
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des disponibilités</h1>
        <ViewSelector view={view} onViewChange={setView} />
      </div>

      <div className="glass p-6 rounded-lg space-y-6">
        <DiscordInput
          value={discordId}
          onChange={(value) => {
            setDiscordId(value);
            setDiscordError(undefined);
          }}
          error={discordError}
        />

        {view === 'month' ? (
          <MonthView
            date={currentDate}
            onPrevMonth={() => setCurrentDate(d => subMonths(d, 1))}
            onNextMonth={() => setCurrentDate(d => addMonths(d, 1))}
            slots={slots}
            onDayClick={(date) => {
              setSelectedDate(date);
              setView('week');
            }}
          />
        ) : (
          <WeekView
            slots={slots}
            onSlotClick={handleSlotClick}
            selectedDate={selectedDate}
          />
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setSlots([])}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Effacer tout
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !discordId || !!discordError}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}