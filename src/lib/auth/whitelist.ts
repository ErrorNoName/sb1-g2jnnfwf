import axios from 'axios';
import { WhitelistData, AuthError } from './types';
import { logger } from '../../utils/logger';

const WHITELIST_URL = 'https://raw.githubusercontent.com/ErrorNoName/P-L-P/refs/heads/main/whitelist.txt';

export async function fetchWhitelist(): Promise<WhitelistData> {
  try {
    const response = await axios.get<WhitelistData>(WHITELIST_URL);

    // Validate response structure
    if (!response.data?.users?.length) {
      throw new Error('Invalid whitelist data structure');
    }

    return response.data;
  } catch (error) {
    logger.error('Whitelist fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw createAuthError('NETWORK_ERROR', 'Impossible de contacter le serveur d\'authentification');
      }
      throw createAuthError('MALFORMED_DATA', 'Données d\'authentification invalides');
    }
    
    throw createAuthError('MALFORMED_DATA', 'Format de données invalide');
  }
}

function createAuthError(code: AuthError['code'], message: string): AuthError {
  return { code, message };
}