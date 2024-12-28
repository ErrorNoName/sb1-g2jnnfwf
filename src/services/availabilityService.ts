import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { BookingValidation } from '../utils/bookingValidation';
import type { TimeSlot } from '../types/booking';

class AvailabilityService {
  async saveAvailability(params: {
    hostId: string;
    discordId: string;
    slots: Array<{
      start_time: string;
      end_time: string;
    }>;
  }) {
    const { hostId, discordId, slots } = params;

    if (!hostId) {
      throw new Error('Host ID is required');
    }
    
    const discordError = BookingValidation.validateDiscordId(discordId);
    if (discordError) {
      throw new Error(discordError);
    }

    // Valider chaque créneau
    for (const slot of slots) {
      const timeError = BookingValidation.validateTimeSlot(slot.start_time, slot.end_time);
      if (timeError) {
        throw new Error(timeError);
      }
    }

    try {
      // Supprimer les anciens créneaux non réservés
      const { error: deleteError } = await supabase
        .from('time_slots')
        .delete()
        .eq('host_id', hostId)
        .eq('is_booked', false);

      if (deleteError) {
        logger.error('Failed to delete existing slots', { error: deleteError });
        throw deleteError;
      }

      if (slots.length === 0) {
        logger.info('No slots to save, only deleted existing ones');
        return;
      }
      
      // Vérifier les chevauchements
      for (let i = 0; i < slots.length; i++) {
        const otherSlots = slots.filter((_, index) => index !== i);
        if (BookingValidation.checkSlotOverlap(slots[i], otherSlots)) {
          throw new Error('Les créneaux ne peuvent pas se chevaucher');
        }
      }

      // Insérer les nouveaux créneaux
      const { error: insertError } = await supabase
        .from('time_slots')
        .insert(
          slots.map(slot => ({
            host_id: hostId,
            discord_id: discordId,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_booked: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );

      if (insertError) {
        logger.error('Failed to insert new slots', { error: insertError });
        throw insertError;
      }

      logger.info('Availability saved successfully', { 
        hostId,
        discordId, 
        slotsCount: slots.length 
      });
    } catch (error) {
      logger.error('Failed to save availability', { error });
      throw error;
    }
  }

  async getHostSlots(hostId: string): Promise<TimeSlot[]> {
    if (!hostId) {
      throw new Error('Host ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('host_id', hostId)
        .order('start_time');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get host slots', { error });
      throw error;
    }
  }
}

export const availabilityService = new AvailabilityService();