import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useReports } from './useReports';
import { logger } from '../utils/logger';
import type { Report } from '../types/report';

export function useRealtimeReports() {
  const { reports, setReports, refreshReports } = useReports();

  const handleRealtimeUpdate = useCallback((payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Report;
    old: { id: string };
  }) => {
    logger.info('Real-time update received', { type: payload.eventType });

    switch (payload.eventType) {
      case 'INSERT':
      case 'UPDATE':
        // Pour INSERT et UPDATE, on rafraîchit la liste complète
        refreshReports();
        break;
      
      case 'DELETE':
        // Pour DELETE, on peut juste filtrer localement
        setReports(prev => prev.filter(report => report.id !== payload.old.id));
        break;
    }
  }, [refreshReports, setReports]);

  useEffect(() => {
    const subscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      logger.info('Unsubscribed from real-time updates');
    };
  }, [handleRealtimeUpdate]);

  return { reports };
}