/**
 * Supabase Frontend Configuration
 *
 * SECURITY POLICY:
 * ONLY public anon/publishable keys are permitted on mobile client applications.
 * Service-role keys and secret keys (e.g. sb_secret_*) are strictly forbidden.
 */

// Ambient declaration for React Native runtime environment
declare const process: { env?: Record<string, string | undefined> } | undefined;

// Supabase project URL (matches backend project)
export const SUPABASE_URL: string =
  (typeof process !== 'undefined' && process?.env?.SUPABASE_URL) ||
  'https://vsewbqjjlmaeatnomgkg.supabase.co';

// Public Anon Key
// In production, inject via build-time environment or configuration.
// Fallback placeholder allows compilation and testing while preventing crashes.
export const SUPABASE_ANON_KEY: string =
  (typeof process !== 'undefined' && process?.env?.SUPABASE_ANON_KEY) ||
  'sb_publishable_8hQX7kfaboAO6w96TVBGXA_XTjiTB4U';

/**
 * Validates that client configuration is present and safe.
 * Throws immediately if a secret or service-role key is detected.
 */
export function validateSupabaseClientConfig(url: string, anonKey: string): void {
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
