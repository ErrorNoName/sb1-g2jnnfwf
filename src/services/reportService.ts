import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321304367760015482/cF5aQWxjGMthfUcgVMA7bdW2jwHgRc_grt_FyaCylGVZWzsauXbvJyM4OefyY7XZZtto';

export async function deleteReport(reportId: string, username: string) {
  try {
    // Get report details first to get the proof_url
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('proof_url')
      .eq('id', reportId)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch report', { error: fetchError });
      throw new Error('Erreur lors de la récupération du rapport');
    }

    // Delete report from database first
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      logger.error('Failed to delete report', { error: deleteError });
      throw new Error('Erreur lors de la suppression du rapport');
    }

    // If report had a proof file, delete it from storage
    if (report?.proof_url) {
      const filePathMatch = report.proof_url.match(/\/proofs\/(.+)$/);
      if (filePathMatch) {
        const filePath = `proofs/${filePathMatch[1]}`;
        
        const { error: storageError } = await supabase.storage
          .from('reports')
          .remove([filePath]);

        if (storageError) {
          logger.error('Failed to delete file from storage', { error: storageError });
          // Don't throw here as the report is already deleted
        }
      }
    }

    // Log to Discord webhook
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**Rapport supprimé**\n` +
          `- **ID:** ${reportId}\n` +
          `- **Supprimé par:** ${username}\n` +
          `- **Date:** ${new Date().toLocaleString()}`
      })
    });

    logger.info('Report deleted successfully', { reportId, username });
    return true;
  } catch (error) {
    logger.error('Delete operation failed', { reportId, error });
    throw error;
  }
}