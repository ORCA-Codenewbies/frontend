import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  validateSupabaseClientConfig,
} from '../config/supabaseConfig';

// Enforce client credential security constraints
validateSupabaseClientConfig(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Shared Supabase client instance configured with:
 * - AsyncStorage persistent storage for tokens & sessions
 * - Automatic background token refresh
 * - URL polyfill for React Native runtime compliance
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);
