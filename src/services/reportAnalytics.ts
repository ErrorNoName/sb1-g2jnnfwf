import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export async function getUserReportStats(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_report_count', {
        user_id: userId
      });

    if (error) throw error;

    return {
      totalReports: Number(data[0].total_reports) || 0,
      totalAvatars: Number(data[0].total_avatars) || 0,
      monthlyReports: Number(data[0].monthly_reports) || 0
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}

export async function updateReportPriorities() {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Analyse et mise à jour des priorités
    for (const report of reports) {
      const priority = calculateReportPriority(report);
      logger.info('Mise à jour priorité rapport:', {
        reportId: report.id,
        priority
      });
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des priorités:', error);
    throw error;
  }
}

function calculateReportPriority(report: any): number {
  let priority = 0;
  
  // Facteurs de priorité
  priority += report.warnings * 1;
  priority += report.kicks * 2;
  priority += report.mutes * 1.5;
  
  return priority;
}