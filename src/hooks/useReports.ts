import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Report } from '../types/report';
import { logger } from '../utils/logger';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      logger.info('Fetching reports', { dateRange, sortOrder });
      
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (dateRange[0]) {
        query = query.gte('created_at', dateRange[0].toISOString());
      }
      if (dateRange[1]) {
        query = query.lte('created_at', dateRange[1].toISOString());
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      
      logger.info('Reports fetched successfully', { count: data.length });
      setReports(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      logger.error('Error fetching reports', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dateRange, sortOrder]);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { 
    reports, 
    setReports,
    loading, 
    error,
    dateRange,
    setDateRange,
    sortOrder,
    setSortOrder,
    refreshReports: fetchReports
  };
}