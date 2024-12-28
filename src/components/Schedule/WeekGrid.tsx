import React from 'react';
import type { WeeklyAvailability } from '../../types/scheduling';

interface WeekGridProps {
  availability: WeeklyAvailability;
  onSlotSelect: (day: string, hour: number, minute: number) => void;
  isSelecting: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 20 }, (_, i) => i + 4); // 4h à 23h

export default function WeekGrid({ 
  availability, 
  onSlotSelect, 
  isSelecting,
  onMouseDown,
  onMouseUp
}: WeekGridProps) {
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-1">
          {/* En-tête */}
          <div className="h-12" />
          {DAYS.map(day => (
            <div key={day} className="h-12 flex items-center justify-center font-medium">
              {day}
            </div>
          ))}

          {/* Grille horaire */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="h-12 flex items-center justify-end pr-2 text-sm text-gray-400">
                {formatHour(hour)}
              </div>
              {DAYS.map(day => (
                <div key={`${day}-${hour}`} className="h-12 grid grid-rows-4 gap-px">
                  {[0, 15, 30, 45].map(minute => {
                    const slotKey = `${day}-${hour}:${minute.toString().padStart(2, '0')}`;
                    const isSelected = availability[day]?.some(
                      slot => slot.startTime === `${hour}:${minute.toString().padStart(2, '0')}`
                    );

                    return (
                      <button
                        key={`${slotKey}`}
                        onMouseDown={() => {
                          onMouseDown();
                          onSlotSelect(day, hour, minute);
                        }}
                        onMouseEnter={() => {
                          if (isSelecting) {
                            onSlotSelect(day, hour, minute);
                          }
                        }}
                        onMouseUp={onMouseUp}
                        className={`h-3 transition-colors ${
                          isSelected 
                            ? 'bg-indigo-500/50 hover:bg-indigo-500/40' 
                            : 'bg-gray-800/50 hover:bg-gray-800/70'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}