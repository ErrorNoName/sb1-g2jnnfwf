import { TimeSlot } from '../types/booking';

export class BookingValidation {
  static validateTimeSlot(start: string, end: string): string | null {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Dates invalides';
    }
    
    if (startDate >= endDate) {
      return 'L\'heure de début doit être antérieure à l\'heure de fin';
    }
    
    if (startDate < new Date()) {
      return 'La date de début doit être dans le futur';
    }
    
    return null;
  }

  static validateDiscordId(discordId: string): string | null {
    if (!discordId.trim()) {
      return 'Discord ID requis';
    }
    
    // Format: username#1234 ou username
    const discordRegex = /^.+$/;
    if (!discordRegex.test(discordId)) {
      return 'Format Discord ID invalide';
    }
    
    return null;
  }

  static checkSlotOverlap(newSlot: { start_time: string; end_time: string }, existingSlots: TimeSlot[]): boolean {
    const newStart = new Date(newSlot.start_time);
    const newEnd = new Date(newSlot.end_time);
    
    return existingSlots.some(slot => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      
      return (newStart < slotEnd && newEnd > slotStart);
    });
  }
}