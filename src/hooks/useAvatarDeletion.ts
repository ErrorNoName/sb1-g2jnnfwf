import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AvatarDeletionDebugger } from '../utils/debug/avatarDeletion';
import { useToast } from './useToast';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../utils/logger';

export function useAvatarDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string | null>(null);
  const { showToast } = useToast();
  const user = useAuthStore(state => state.user);

  const deleteAvatar = async (reportId: string): Promise<boolean> => {
    if (!user) {
      showToast('Utilisateur non authentifié', 'error');
      return false;
    }

    setIsDeleting(true);
    const debugger = new AvatarDeletionDebugger(reportId);

    try {
      // 1. Vérifier l'existence du rapport
      const exists = await debugger.checkReportExists();
      if (!exists) {
        throw new Error('Le rapport n\'existe pas');
      }

      // 2. Vérifier les permissions
      const hasPermission = await debugger.checkPermissions(user.id);
      if (!hasPermission) {
        throw new Error('Permissions insuffisantes');
      }

      // 3. Récupérer l'état initial
      const initialState = await debugger.getDatabaseState();
      if (!initialState) {
        throw new Error('Impossible de récupérer l\'état initial');
      }

      // 4. Effectuer la suppression
      const { error: deleteError } = await supabase
        .from('avatar_crash_reports')
        .delete()
        .eq('id', reportId);

      if (deleteError) {
        throw deleteError;
      }

      // 5. Vérifier la suppression
      const isDeleted = await debugger.verifyDeletion();
      if (!isDeleted) {
        throw new Error('La suppression n\'a pas pu être vérifiée');
      }

      // Générer le rapport de débogage
      const report = await debugger.generateReport();
      setDebugLogs(report);
      logger.info('Avatar deletion debug report:', { report });

      showToast('Suppression réussie', 'success');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      const report = await debugger.generateReport();
      setDebugLogs(report);
      logger.error('Avatar deletion failed:', { error, debugReport: report });
      showToast(message, 'error');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAvatar,
    isDeleting,
    debugLogs
  };
}