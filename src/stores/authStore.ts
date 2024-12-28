import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { fetchWhitelist } from '../lib/auth/whitelist';
import { validateCredentials } from '../lib/auth/validation';
import type { AuthError } from '../lib/auth/types';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; username: string };
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: AuthError | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  error: null,
  login: async (username: string, password: string) => {
    try {
      set({ error: null });

      const whitelist = await fetchWhitelist();

      const whitelistedUser = whitelist.users.find(
        (u) => validateCredentials(username, password, u)
      );

      if (!whitelistedUser) {
        logger.error('User not whitelisted:', { username });
        set({ error: { 
          code: 'INVALID_CREDENTIALS',
          message: 'Identifiants invalides'
        }});
        return false;
      }

      // Try to sign in first since the user might already exist
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${username}@pixellunar.com`,
        password: password,
      });

      // If login succeeds, update state and return
      if (!signInError && signInData.user) {
        set({ 
          isAuthenticated: true, 
          user: { 
            id: signInData.user.id,
            username: whitelistedUser.username 
          } 
        });
        return true;
      }

      // If login fails, try to create the account
      if (signInError?.message === 'Invalid login credentials') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${username}@pixellunar.com`,
          password: password,
        });

        if (signUpError) {
          logger.error('Sign up error:', { error: signUpError, username });
          set({ error: { 
            code: 'INVALID_CREDENTIALS',
            message: 'Erreur lors de la création du compte'
          }});
          return false;
        }

        // After successful signup, set the authenticated state
        set({ 
          isAuthenticated: true, 
          user: { 
            id: signUpData.user?.id || '',
            username: whitelistedUser.username 
          } 
        });
        return true;
      }

      // If we get here, something went wrong
      logger.error('Authentication error:', { signInError, username });
      set({ error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Erreur d\'authentification'
      }});
      return false;
    } catch (error) {
      logger.error('Login error:', error);
      if ((error as AuthError).code) {
        set({ error: error as AuthError });
      } else {
        set({ error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion'
        }});
      }
      return false;
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, error: null });
  },
}));