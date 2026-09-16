import { validateSupabaseClientConfig } from '../src/config/supabaseConfig';
import { supabase } from '../src/services/supabaseClient';

describe('Phase F1: Supabase Authentication Foundation', () => {
  beforeEach(async () => {
    // Clear any test storage state
    await supabase.auth.signOut();
  });

  describe('Security Constraint & Configuration', () => {
    it('allows valid URL and publishable/anon key', () => {
      expect(() => {
        validateSupabaseClientConfig(
          'https://vsewbqjjlmaeatnomgkg.supabase.co',
          'process.env.VITE_SUPABASE_ANON_KEY;'
        );
      }).not.toThrow();
    });

    it('strictly rejects service-role and secret keys (sb_secret_*)', () => {
      expect(() => {
        validateSupabaseClientConfig(
          'https://vsewbqjjlmaeatnomgkg.supabase.co',
          'process.env.VITE_SUPABASE_ANON_KEY;'
        );
      }).toThrow(/Security Violation/);

      expect(() => {
        validateSupabaseClientConfig(
          'https://vsewbqjjlmaeatnomgkg.supabase.co',
          'service_role_key_here'
        );
      }).toThrow(/Security Violation/);
    });

    it('rejects missing URL or anon key', () => {
      expect(() => {
        validateSupabaseClientConfig('', 'anon_key');
      }).toThrow(/Missing or invalid SUPABASE_URL/);

      expect(() => {
        validateSupabaseClientConfig('https://vsewbqjjlmaeatnomgkg.supabase.co', '');
      }).toThrow(/Missing or invalid SUPABASE_ANON_KEY/);
    });
  });

  describe('Session Lifecycle & State Verification', () => {
    it('A. Fresh launch with no session: getSession returns null session', async () => {
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });

    it('B & C. Simulated session persistence: session holds access_token and user.id', async () => {
      const storageKey = 'sb-v-auth-token';
      const mockSession = {
        access_token: 'mock.access.token.jwt',
        refresh_token: 'mock.refresh.token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'b8d4b321-4f93-47e1-bf29-3732b14421aa',
          email: 'fisherman@orca.marine',
          phone: '+919832145678',
          app_metadata: { provider: 'phone' },
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      // 1. Simulate saving session to persistent AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(storageKey, JSON.stringify(mockSession));

      // 2. Retrieve session via Supabase client getSession()
      const restored = await supabase.auth.getSession();
      expect(restored.data.session).not.toBeNull();
      expect(restored.data.session?.access_token).toBe(mockSession.access_token);
      expect(restored.data.session?.user?.id).toBe(mockSession.user.id);
    });

    it('D. Logout: signOut destroys session', async () => {
      await supabase.auth.setSession({
        access_token: 'valid.token',
        refresh_token: 'valid.refresh',
      });

      const { error } = await supabase.auth.signOut();
      expect(error).toBeNull();

      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });

    it('E. Invalid/expired session: does not remain authenticated', async () => {
      await supabase.auth.signOut();
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });
  });

  describe('Email + Password Authentication', () => {
    it('rejects invalid email credentials with explicit error', async () => {
      const result = await supabase.auth.signInWithPassword({
        email: 'nonexistent_user@example.com',
        password: 'WrongPassword123!',
      });

      expect(result.error).not.toBeNull();
      expect(result.data.session).toBeNull();
    });

    it('rejects empty or malformed signup payloads visibly', async () => {
      const result = await supabase.auth.signUp({
        email: 'invalid-email-format',
        password: '123',
      });

      expect(result.error).not.toBeNull();
      expect(result.data.session).toBeNull();
    });

    it('session exposes access_token and user.id to AppContext', async () => {
      const storageKey = 'sb-vsewbqjjlmaeatnomgkg-auth-token';
      const mockSession = {
        access_token: 'valid.supabase.access.token',
        refresh_token: 'valid.supabase.refresh.token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'b5873086-f16e-4b87-a12a-f8a0e6aa7a6d',
          email: 'fisherman_test@example.com',
          phone: '',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(storageKey, JSON.stringify(mockSession));

      const { data } = await supabase.auth.getSession();
      expect(data.session?.access_token).toBe('valid.supabase.access.token');
      expect(data.session?.user?.id).toBe('b5873086-f16e-4b87-a12a-f8a0e6aa7a6d');
    });
  });
});

