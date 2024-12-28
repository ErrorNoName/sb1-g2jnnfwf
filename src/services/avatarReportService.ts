import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type { AvatarCrashReport } from '../types/avatarReport';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321317066589868135/RZm2cTUTRa601DsAGfCp974ahrUoFrb8yheVuPC7IJnvShGozDN7FbNx3DegZsEZF27R';

export const createAvatarReport = async (
  avatarId: string,
  username: string
): Promise<AvatarCrashReport> => {
  try {
    const { data, error } = await supabase
      .from('avatar_crash_reports')
      .insert({
        avatar_id: avatarId,
        reported_by: supabase.auth.getUser().then(({ data }) => data.user?.id)
      })
      .select()
      .single();

    if (error) throw error;

    const vrchatUrl = `https://vrchat.com/home/avatar/${avatarId}`;

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: [
          'Nouveau rapport d\'avatar crash',
          `Avatar ID: ${avatarId}`,
          `Lien: ${vrchatUrl}`,
          `Rapporté par: ${username}`
        ].join('\n')
      })
    });

    logger.info('Avatar crash report created', { avatarId, username });
    return data;
  } catch (error) {
    logger.error('Failed to create avatar report', { error });
    throw error;
  }
};

export const getAvatarReports = async (): Promise<AvatarCrashReport[]> => {
  const { data, error } = await supabase
    .from('avatar_crash_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};