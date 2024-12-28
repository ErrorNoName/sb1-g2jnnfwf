import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { logger } from '../utils/logger';
import type { TimeSlot } from '../types/booking';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function createTimeSlot(data: Omit<TimeSlot, 'id' | 'created_at'>): Promise<TimeSlot> {
  const { data: slot, error } = await supabase
    .from('time_slots')
    .insert({
      host_id: data.host_id,
      discord_id: data.discord_id,
      start_time: data.start_time,
      end_time: data.end_time,
      is_booked: false,
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to create time slot:', error);
    throw error;
  }

  return slot;
}

export async function getAvailableTimeSlots(): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('is_booked', false)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    logger.error('Failed to fetch available time slots:', error);
    throw error;
  }

  return data || [];
}

export async function bookTimeSlot(
  slotId: string,
  userId: string,
  discordId: string
): Promise<TimeSlot> {
  const { data: slot, error } = await supabase
    .from('time_slots')
    .update({
      is_booked: true,
      booked_by: userId,
      booked_by_discord_id: discordId,
    })
    .eq('id', slotId)
    .eq('is_booked', false)
    .select()
    .single();

  if (error) {
    logger.error('Failed to book time slot:', error);
    throw error;
  }

  return slot;
}

export const uploadProof = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  try {
    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Utilisateur non authentifié');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error('Extension de fichier invalide');
    }

    // Valider le type de fichier
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4'];
    if (!allowedTypes.includes(fileExt)) {
      throw new Error('Type de fichier non supporté');
    }

    // Valider la taille du fichier (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux (max 10MB)');
    }

    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    logger.info('Début upload fichier:', { 
      name: fileName, 
      path: filePath,
      size: file.size,
      type: file.type 
    });

    // Upload du fichier directement sans vérifier/créer le bucket
    const { error: uploadError, data } = await supabase.storage
      .from('reports')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      logger.error('Erreur upload:', uploadError);
      throw new Error('Échec de l\'upload du fichier');
    }

    if (!data?.path) {
      throw new Error('Chemin du fichier manquant');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(data.path);

    logger.info('Upload réussi:', { url: publicUrl });
    return publicUrl;
  } catch (error) {
    logger.error('Erreur détaillée:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      context: 'Upload fichier'
    });
    throw error;
  }
}