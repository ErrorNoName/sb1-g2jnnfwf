import React from 'react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TimeSlot } from '../../../types/booking';

interface WeekViewProps {
  slots: TimeSlot[];
  onSlotClick: (slot: TimeSlot) => void;
  selectedDate: Date;
}

export default function WeekView({ slots, onSlotClick, selectedDate }: WeekViewProps) {
  // Générer les créneaux de 30 minutes pour la journée sélectionnée
  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(8, 0, 0, 0); // Commence à 8h
    
    const endTime = new Date(selectedDate);
    endTime.setHours(22, 0, 0, 0); // Termine à 22h
    
    while (currentTime < endTime) {
      slots.push({
        start_time: currentTime.toISOString(),
        end_time: addMinutes(currentTime, 30).toISOString()
      });
      currentTime = addMinutes(currentTime, 30);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-4">
      <h3 className="font-medium">
        {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
      </h3>
      <div className="grid gap-2">
        {timeSlots.map((timeSlot, index) => {
          const isSelected = slots.some(
            slot => slot.start_time === timeSlot.start_time
          );
          
          return (
            <button
              key={index}
              onClick={() => onSlotClick(timeSlot)}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${isSelected 
                  ? 'bg-indigo-500/20 hover:bg-indigo-500/30' 
                  : 'bg-gray-800/50 hover:bg-gray-800/70'}
              `}
            >
              <span>
                {format(new Date(timeSlot.start_time), 'HH:mm')} - 
                {format(new Date(timeSlot.end_time), 'HH:mm')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}