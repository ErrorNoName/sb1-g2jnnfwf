import React, { useState, useEffect } from 'react';
import { bookingService } from '../../../services/bookingService';
import { useToast } from '../../../hooks/useToast';
import AvailableSlots from '../../../components/Booking/AvailableSlots';
import BookingDialog from '../../../components/Booking/BookingDialog';
import type { TimeSlot } from '../../../types/booking';

export default function Booking() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const data = await bookingService.getAvailableSlots();
      setSlots(data);
    } catch (error) {
      showToast('Erreur lors du chargement des créneaux', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot) {
      setSelectedSlot(slot);
    }
  };

  const handleConfirmBooking = async (discordId: string) => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      await bookingService.createBooking({
        slot_id: selectedSlot.id,
        booked_by: 'user_id', // TODO: Get from auth
        booked_by_discord_id: discordId,
        created_at: new Date().toISOString()
      });
      
      showToast('Réservation confirmée', 'success');
      await loadSlots();
    } catch (error) {
      showToast('Erreur lors de la réservation', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold">Réservation de rendez-vous</h1>
      
      <AvailableSlots
        slots={slots}
        onBook={handleBook}
        isLoading={isLoading}
      />

      {selectedSlot && (
        <BookingDialog
          slot={selectedSlot}
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onConfirm={handleConfirmBooking}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}