import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TimeSlot } from '../../../types/booking';

interface MonthViewProps {
  date: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  slots: TimeSlot[];
  onDayClick: (date: Date) => void;
}

export default function MonthView({ date, onPrevMonth, onNextMonth, slots, onDayClick }: MonthViewProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });

  const hasSlots = (day: Date) => {
    return slots.some(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.getDate() === day.getDate() &&
             slotDate.getMonth() === day.getMonth() &&
             slotDate.getFullYear() === day.getFullYear();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(date, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
        {days.map(day => {
          const hasAvailability = hasSlots(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                ${hasAvailability ? 'bg-indigo-500/20 hover:bg-indigo-500/30' : 'hover:bg-gray-800/50'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}