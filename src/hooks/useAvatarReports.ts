import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import { useAuthStore } from '../stores/authStore';
import type { AvatarReport } from '../types/avatar';
import { logger } from '../utils/logger';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321317066589868135/RZm2cTUTRa601DsAGfCp974ahrUoFrb8yheVuPC7IJnvShGozDN7FbNx3DegZsEZF27R';

export function useAvatarReports() {
  const [reports, setReports] = useState<AvatarReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const user = useAuthStore(state => state.user);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('avatar_crash_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReports(data || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des rapports');
      showToast('Erreur lors du chargement des rapports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (avatarId: string) => {
    if (!user) {
      showToast('Vous devez être connecté pour signaler un avatar', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('avatar_crash_reports')
        .insert({
          avatar_id: avatarId,
          reported_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Send Discord notification
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: [
            'Nouveau rapport d\'avatar crash',
            `Avatar ID: ${avatarId}`,
            `Lien: https://vrchat.com/home/avatar/${avatarId}`,
            `Rapporté par: ${user.username}`
          ].join('\n')
        })
      });

      setReports(prev => [data, ...prev]);
      showToast('Avatar signalé avec succès', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du signalement';
      showToast(message, 'error');
      throw err;
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!user) {
      showToast('Vous devez être connecté pour supprimer un signalement', 'error');
      return false;
    }

    try {
      const { error } = await supabase
        .from('avatar_crash_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== reportId));
      showToast('Signalement supprimé avec succès', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      logger.error('Delete report error:', err);
      showToast(message, 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    error,
    createReport,
    deleteReport
  };
}