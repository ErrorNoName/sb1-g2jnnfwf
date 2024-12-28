import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { BookingValidation } from '../utils/bookingValidation';
import type { TimeSlot } from '../types/booking';

class BookingService {
  async getAvailableSlots(): Promise<TimeSlot[]> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          profile:host_id(
            id,
            username,
            discord_id
          )
        `)
        .eq('is_booked', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        logger.error('Failed to fetch available slots', { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getAvailableSlots', { error });
      throw error;
    }
  }

  async createBooking(params: {
    slotId: string;
    guestProfileId: string;
    discordId: string;
  }) {
    const { slotId, guestProfileId, discordId } = params;

    const discordError = BookingValidation.validateDiscordId(discordId);
    if (discordError) {
      throw new Error(discordError);
    }

    try {
      // Check if slot is still available
      const { data: slot, error: checkError } = await supabase
        .from('time_slots')
        .select('*, host_id')
        .eq('id', slotId)
        .eq('is_booked', false)
        .single();

      if (checkError || !slot) {
        throw new Error('Ce créneau n\'est plus disponible');
      }
      
      // Vérifier que l'utilisateur ne réserve pas son propre créneau
      if (slot.host_id === guestProfileId) {
        throw new Error('Vous ne pouvez pas réserver votre propre créneau');
      }

      // Update the slot
      const { data: updatedSlot, error: updateError } = await supabase
        .from('time_slots')
        .update({
          is_booked: true,
          booked_by: guestProfileId,
          booked_by_discord_id: discordId,
          updated_at: new Date().toISOString()
        })
        .eq('id', slotId)
        .select()
        .single();

      if (updateError) throw updateError;

      logger.info('Booking created successfully', { slotId, guestProfileId });
      return updatedSlot;
    } catch (error) {
      logger.error('Failed to create booking', { error });
      throw error;
    }
  }
}

export const bookingService = new BookingService();