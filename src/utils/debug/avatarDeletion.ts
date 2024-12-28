import { supabase } from '../../lib/supabase';
import { logger } from '../logger';
import type { AvatarReport } from '../../types/avatar';

interface DebugReport {
  timestamp: string;
  operation: string;
  status: 'success' | 'error';
  details: Record<string, any>;
}

export class AvatarDeletionDebugger {
  private debugLog: DebugReport[] = [];
  private reportId: string;

  constructor(reportId: string) {
    this.reportId = reportId;
    this.addLog('init', 'success', { reportId });
  }

  private addLog(operation: string, status: 'success' | 'error', details: Record<string, any>) {
    const log: DebugReport = {
      timestamp: new Date().toISOString(),
      operation,
      status,
      details
    };
    
    this.debugLog.push(log);
    logger.info(`[Avatar Deletion Debug] ${operation}`, log);
  }

  async checkReportExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('avatar_crash_reports')
        .select('*')
        .eq('id', this.reportId)
        .single();

      if (error) {
        this.addLog('check_exists', 'error', { error });
        return false;
      }

      this.addLog('check_exists', 'success', { exists: !!data });
      return !!data;
    } catch (error) {
      this.addLog('check_exists', 'error', { error });
      return false;
    }
  }

  async getDatabaseState(): Promise<AvatarReport | null> {
    try {
      const { data, error } = await supabase
        .from('avatar_crash_reports')
        .select('*')
        .eq('id', this.reportId)
        .single();

      if (error) {
        this.addLog('get_state', 'error', { error });
        return null;
      }

      this.addLog('get_state', 'success', { data });
      return data;
    } catch (error) {
      this.addLog('get_state', 'error', { error });
      return null;
    }
  }

  async verifyDeletion(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('avatar_crash_reports')
        .select('id')
        .eq('id', this.reportId);

      if (error) {
        this.addLog('verify_deletion', 'error', { error });
        return false;
      }

      const isDeleted = !data || data.length === 0;
      this.addLog('verify_deletion', 'success', { isDeleted });
      return isDeleted;
    } catch (error) {
      this.addLog('verify_deletion', 'error', { error });
      return false;
    }
  }

  async checkPermissions(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('avatar_crash_reports')
        .select('reported_by')
        .eq('id', this.reportId)
        .single();

      if (error) {
        this.addLog('check_permissions', 'error', { error });
        return false;
      }

      const hasPermission = data.reported_by === userId;
      this.addLog('check_permissions', 'success', { hasPermission, userId });
      return hasPermission;
    } catch (error) {
      this.addLog('check_permissions', 'error', { error });
      return false;
    }
  }

  getDebugLogs(): DebugReport[] {
    return this.debugLog;
  }

  async generateReport(): Promise<string> {
    const report = [
      '=== Avatar Deletion Debug Report ===',
      `Report ID: ${this.reportId}`,
      `Generated: ${new Date().toISOString()}`,
      '\nOperation Log:',
      ...this.debugLog.map(log => 
        `[${log.timestamp}] ${log.operation.toUpperCase()} (${log.status})\n` +
        `Details: ${JSON.stringify(log.details, null, 2)}`
      )
    ].join('\n');

    return report;
  }
}