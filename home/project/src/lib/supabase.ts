import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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

    // Create bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('reports', {
      public: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      fileSizeLimit: 10485760 // 10MB in bytes
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      logger.error('Erreur création bucket:', bucketError);
      throw new Error('Échec de la création du bucket');
    }

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