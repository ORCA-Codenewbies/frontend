/**
 * Supabase Frontend Configuration
 *
 * SECURITY POLICY:
 * ONLY public anon/publishable keys are permitted on mobile client applications.
 * Service-role keys and secret keys are strictly forbidden.
 */

import Config from 'react-native-config';

export const SUPABASE_URL: string = Config.SUPABASE_URL || '';

export const SUPABASE_ANON_KEY: string =
  Config.SUPABASE_ANON_KEY || '';

/**
 * Validates that client configuration is present and safe.
 */
export function validateSupabaseClientConfig(
  url: string,
  anonKey: string
): void {
  if (!url || typeof url !== 'string') {
    throw new Error('[Supabase] Missing or invalid SUPABASE_URL');
  }

  if (!anonKey || typeof anonKey !== 'string') {
    throw new Error('[Supabase] Missing or invalid SUPABASE_ANON_KEY');
  }

  const normalized = anonKey.toLowerCase();

  if (
    anonKey.startsWith('sb_secret_') ||
    normalized.includes('service_role') ||
    normalized.includes('secret')
  ) {
    throw new Error(
      '[Supabase Security Violation] Secret or service-role key detected in client config! ' +
      'Mobile frontend must only use the public anon/publishable key.'
    );
  }
}