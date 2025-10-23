import { SupabaseService } from '../../shared/services/supabase.service';

/**
 * Authentication Initializer
 *
 * This initializer runs before the app starts and:
 * 1. Restores authentication session from localStorage (handled by Supabase SDK)
 * 2. Validates the restored session with Supabase backend
 * 3. Clears invalid/expired sessions
 *
 * This ensures users stay logged in after page refresh and invalid tokens are handled gracefully.
 */
export function initializeAuth(supabaseService: SupabaseService): () => Promise<void> {
  return async () => {
    console.log('[Auth Initializer] Starting authentication initialization...');

    try {
      // Supabase SDK automatically restores session from localStorage
      // We just need to validate it by getting the current session
      const session = await supabaseService.validateAndRestoreSession();

      if (session) {
        console.log('[Auth Initializer] Session restored successfully:', {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: new Date(session.expires_at! * 1000).toISOString()
        });
      } else {
        console.log('[Auth Initializer] No valid session found');
      }
    } catch (error) {
      console.error('[Auth Initializer] Error during session validation:', error);
      // Clear any invalid session data
      await supabaseService.clearInvalidSession();
    }

    console.log('[Auth Initializer] Authentication initialization completed');
  };
}
