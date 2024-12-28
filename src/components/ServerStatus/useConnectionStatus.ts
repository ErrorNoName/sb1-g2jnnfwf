import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ConnectionStatus } from './types';
import { logger } from '../../utils/logger';

const RETRY_INTERVAL = 30000; // 30 seconds

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastConnected: null,
    error: null
  });

  const checkConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id')
        .limit(1);

      if (error) throw error;

      setStatus({
        isConnected: true,
        lastConnected: new Date(),
        error: null
      });

      logger.info('Supabase connection successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      logger.error('Supabase connection error:', { error: message });
      
      setStatus(prev => ({
        isConnected: false,
        lastConnected: prev.lastConnected,
        error: message
      }));
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(() => {
      if (!status.isConnected) {
        checkConnection();
      }
    }, RETRY_INTERVAL);

    const subscription = supabase
      .channel('system_status')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          checkConnection();
        }
      });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkConnection, status.isConnected]);

  return status;
}