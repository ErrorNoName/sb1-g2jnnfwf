import { useState } from 'react';
import { deleteReport } from '../services/reportService';
import { useAuthStore } from '../stores/authStore';
import { useToast } from './useToast';
import { logger } from '../utils/logger';

export function useDeleteReport() {
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();

  const handleDelete = async (reportId: string) => {
    if (!user) {
      showToast('Erreur: Utilisateur non authentifié', 'error');
      return false;
    }

    setIsDeleting(true);
    
    try {
      await deleteReport(reportId, user.username);
      showToast('Rapport supprimé avec succès', 'success');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      logger.error('Delete report error:', { reportId, error });
      showToast(message, 'error');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleDelete,
    isDeleting
  };
}