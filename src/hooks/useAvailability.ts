import { useState } from 'react';
import { availabilityService } from '../services/availabilityService';
import { useToast } from './useToast';
import type { AvailabilityData } from '../types/scheduling';

export function useAvailability() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const saveAvailability = async (data: AvailabilityData) => {
    setIsLoading(true);
    try {
      await availabilityService.saveAvailability(data);
      showToast('Disponibilités enregistrées avec succès', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveAvailability
  };
}