import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Linking } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { ScreenType } from '../types/navigation';
import { MarineLocation, UserProfile } from '../types/user';
import { ChatMessage, OrcaResponse } from '../types/orca';
import { DEFAULT_LOCATIONS, INITIAL_USER_PROFILE } from '../data/mockData';
import { HistorySession, SavedItem, SAMPLE_SAVED } from '../data/sampleHistory';
import { OrcaService } from '../services/orcaService';
import { supabase } from '../services/supabaseClient';

interface AppContextType {
  // Auth & Profile
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedLocationSetup: boolean;
  session: Session | null;
  supabaseUser: User | null;
  accessToken: string | null;
  userId: string | null;
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ data: any; error: any }>;
  login: (phone?: string) => void;
  logout: () => Promise<void>;
  completeLocationSetup: (location: MarineLocation) => void;

  // Location
  currentLocation: MarineLocation;
  setCurrentLocation: (loc: MarineLocation) => void;
  availableLocations: MarineLocation[];

  // Navigation
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Conversational Chat
  messages: ChatMessage[];
  isAnalyzing: boolean;
  sendMessage: (query: string) => Promise<void>;
  startNewChat: () => void;
  loadHistorySession: (session: HistorySession) => void;

  // Saved Items
  savedItems: SavedItem[];
  toggleSaveItem: (item: SavedItem) => void;
  isItemSaved: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (char) => {
      const random = Math.floor(Math.random() * 16);
      const value =
        char === 'x'
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase Auth state (Unknown/loading until session check resolves)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedLocationSetup, setHasCompletedLocationSetup] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>({
    ...INITIAL_USER_PROFILE,
    id: '', // Blank until authenticated with real Supabase session
  });

  // Locations
  const [availableLocations] = useState<MarineLocation[]>(DEFAULT_LOCATIONS);
  const [currentLocation, setCurrentLocationState] = useState<MarineLocation>(
    DEFAULT_LOCATIONS[0] // Digha
  );

  // Navigation stack: starts at AUTH until verified
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('AUTH');
  const [history, setHistory] = useState<ScreenType[]>(['AUTH']);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Conversational chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Saved items
  const [savedItems, setSavedItems] = useState<SavedItem[]>(SAMPLE_SAVED);

  // 1. Initial Session Restoration & Real-Time Auth Event Subscription
  useEffect(() => {
    let isMounted = true;

    async function initSession() {

      try {
        // 1. Check for pending deep link callback to prevent race condition
        let hasPendingAuthCallback = false;
        try {
          const initialUrl = await Linking.getInitialURL();
          hasPendingAuthCallback = !!(initialUrl && initialUrl.includes('code='));
        } catch (linkErr) {
          console.warn('[Supabase Auth] Failed to get initial URL during initSession:', linkErr);
        }

        // 2. Fetch current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('[Supabase Auth] Session restore error:', error.message);
        }

        if (!isMounted) return;

        const currentSession = data?.session ?? null;

        if (currentSession?.user) {
          setSession(currentSession);
          setSupabaseUser(currentSession.user);
          setIsAuthenticated(true);

          setUser((prev) => ({
            ...prev,
            id: currentSession.user.id,
            name: currentSession.user.email?.split('@')[0] || prev.name,
          }));
          setCurrentScreen('DASHBOARD');

          setHistory(['DASHBOARD']);
        } else {
          // 3. Prevent race condition: Do NOT apply unauthenticated state if a callback is currently resolving
          if (hasPendingAuthCallback) {
            console.log('[Diagnostic] initSession() deferring AUTH state due to pending callback.');
            return;
          }

          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);

          setCurrentScreen('AUTH');

          setHistory(['AUTH']);
        }
      } catch (err) {
        console.error('[Supabase Auth] Session initialization error:', err);
        if (isMounted) {
          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);

          setCurrentScreen('AUTH');

          setHistory(['AUTH']);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to Supabase auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          if (newSession?.user) {
            setSession(newSession);
            setSupabaseUser(newSession.user);
            setIsAuthenticated(true);

            setUser((prev) => ({
              ...prev,
              id: newSession.user.id,
              name: newSession.user.email?.split('@')[0] || prev.name,
            }));
            if (event === 'SIGNED_IN') {
              setCurrentScreen('DASHBOARD');

              setHistory(['DASHBOARD']);
            }
          }
          break;

        case 'SIGNED_OUT':
          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);

          setCurrentScreen('AUTH');

          setHistory(['AUTH']);
          setMessages([]);
          break;

        default:
          break;
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const lastProcessedUrl = useRef<string | null>(null);

  // 2. Handle Deep Links for Authentication (e.g. email confirmation)
  useEffect(() => {
    let isMounted = true;

    const handleDeepLink = async (url: string | null | undefined) => {
      console.log('[Supabase Auth] Authentication callback received.');
      if (!url || !isMounted) return;
      if (url === lastProcessedUrl.current) return; // Prevent processing the same URL twice

      try {
        const urlObj = new URL(url);
        // Supabase sends error params if the link is invalid or expired
        const error = urlObj.searchParams.get('error');
        const errorDescription = urlObj.searchParams.get('error_description');

        if (error) {

          lastProcessedUrl.current = url;
          return;
        }

        const code = urlObj.searchParams.get('code');

        if (code) {
          lastProcessedUrl.current = url;
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[Supabase Auth] Deep link session exchange error:', exchangeError);
          } else {
            // ONLY FOR DEBUGGING
            const debugSess = await supabase.auth.getSession();

          }
        }
      } catch (err) {
        console.warn('[Supabase Auth] Failed to parse deep link URL:', err);
      }
    };

    // Handle cold start deep link
    Linking.getInitialURL().then(handleDeepLink);

    // Handle warm start deep link
    const linkSubscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => {
      isMounted = false;
      linkSubscription.remove();
    };
  }, []);

  // Derived auth properties (Never log or expose raw access token)
  const accessToken = useMemo(() => session?.access_token ?? null, [session]);
  const userId = useMemo(() => session?.user?.id ?? null, [session]);

  // User Profile
  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  // Location change
  const setCurrentLocation = useCallback((loc: MarineLocation) => {
    setCurrentLocationState(loc);
  }, []);

  // Real Supabase Email + Password Auth actions
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const sess = result.data?.session;
      if (sess && sess.user) {
        setSession(sess);
        setSupabaseUser(sess.user);
        setIsAuthenticated(true);
        setUser((prev) => ({
          ...prev,
          id: sess.user.id,
          name: sess.user.email?.split('@')[0] || prev.name,
        }));
        setCurrentScreen('DASHBOARD');
        setHistory(['DASHBOARD']);
      }

      return result;
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'orca://auth/callback',
        },
      });

      // Do NOT set authenticated state or navigate after signup.
      // The user must confirm their email via the confirmation link first,
      // then sign in normally with email + password.
      return result;
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'orca://auth/callback',
          skipBrowserRedirect: true,
        },
      });


      if (error) {
        return { data: null, error };
      }

      if (data?.url) {
        await Linking.openURL(data.url);
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, []);

  // Resend the signup confirmation email using Supabase's resend API
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      const result = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: 'orca://auth/callback',
        },
      });
      return result;
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, []);

  const login = useCallback((phone?: string) => {
    console.warn(
      '[Supabase Auth] Simulated login is deprecated. Real authentication requires Supabase session.'
    );
    if (phone) {
      setUser((prev) => ({ ...prev, phone }));
    }
  }, []);

  // Real Supabase Logout
  const logout = useCallback(async () => {
    setIsDrawerOpen(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Note: State cleanup is now completely handled by onAuthStateChange('SIGNED_OUT')
    } catch (err) {
      console.error('[Supabase Auth] Logout Error:', err);
      // Fallback cleanup if error occurs (onAuthStateChange might not fire)
      setSession(null);
      setSupabaseUser(null);
      setIsAuthenticated(false);

      setCurrentScreen('AUTH');

      setHistory(['AUTH']);
    } finally {
      setMessages([]);
      setActiveSessionId(null);
    }
  }, []);

  const completeLocationSetup = useCallback((loc: MarineLocation) => {
    setCurrentLocationState(loc);
    setUser((prev) => ({ ...prev, baseLocation: `${loc.name}, ${loc.state}` }));
    setHasCompletedLocationSetup(true);
    setCurrentScreen('DASHBOARD');
    setHistory(['DASHBOARD']);
  }, []);

  // Navigation handlers
  const navigateTo = useCallback((screen: ScreenType) => {
    setIsDrawerOpen(false);
    setCurrentScreen(screen);
    setHistory((prev) => (prev[prev.length - 1] === screen ? prev : [...prev, screen]));
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      // If we are at the root or no previous screens, do not go back further
      if (prev.length <= 1) {
        return prev;
      }
      const newHistory = prev.slice(0, -1);
      const prevScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(prevScreen);
      return newHistory;
    });
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Conversational message dispatcher
  const sendMessage = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;

      const userMsgId = `usr-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: queryText.trim(),
        timestamp: Date.now(),
      };

      // Temporary analyzing message placeholder
      const analyzingMsgId = `orca-analyzing-${Date.now()}`;
      const placeholderMsg: ChatMessage = {
        id: analyzingMsgId,
        sender: 'orca',
        timestamp: Date.now(),
        isAnalyzing: true,
        activeAnalysisStep: {
          step: 1,
          totalSteps: 4,
          label: 'Understanding your query...',
          progressPercent: 25,
        },
      };

      // Ensure we navigate to chat screen immediately
      setCurrentScreen('CHAT');
      setHistory((prev) => (prev[prev.length - 1] === 'CHAT' ? prev : [...prev, 'CHAT']));

      setMessages((prev) => [...prev, userMessage, placeholderMsg]);
      setIsAnalyzing(true);

      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        setActiveSessionId(currentSessionId);
      }

      try {
        const response: OrcaResponse = await OrcaService.queryOrca(
          queryText,
          currentLocation.name,
          currentSessionId,
          (step) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === analyzingMsgId
                  ? { ...msg, activeAnalysisStep: step }
                  : msg
              )
            );
          }
        );

        // Replace placeholder with final structured response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === analyzingMsgId
              ? {
                id: `orca-${Date.now()}`,
                sender: 'orca',
                timestamp: Date.now(),
                isAnalyzing: false,
                response,
              }
              : msg
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === analyzingMsgId
              ? {
                id: `orca-err-${Date.now()}`,
                sender: 'orca',
                timestamp: Date.now(),
                isAnalyzing: false,
                response: {
                  id: `err-${Date.now()}`,
                  timestamp: Date.now(),
                  status: 'CAUTION',
                  isError: true,
                  errorType: 'technical_failure',
                  context: { location: currentLocation.name },
                  message: "Couldn't check",
                  explanation: 'ORCA এখন এই তথ্যটি যাচাই করতে পারছে না।',
                  evidence: [],
                  recommendation: 'দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
                  followUps: ['Try Again ↻'],
                },
              }
              : msg
          )
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentLocation.name, activeSessionId]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
    setIsDrawerOpen(false);
    navigateTo('DASHBOARD');
  }, [navigateTo]);

  const loadHistorySession = useCallback(
    (sessionItem: HistorySession) => {
      setMessages([
        {
          id: `usr-hist-${sessionItem.id}`,
          sender: 'user',
          text: sessionItem.title,
          timestamp: Date.now() - 3600000,
        },
        {
          id: `orca-hist-${sessionItem.id}`,
          sender: 'orca',
          timestamp: Date.now() - 3500000,
          response: sessionItem.lastResponse,
        },
      ]);
      navigateTo('CHAT');
    },
    [navigateTo]
  );

  const toggleSaveItem = useCallback((item: SavedItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [item, ...prev];
    });
  }, []);

  const isItemSaved = useCallback(
    (id: string) => savedItems.some((i) => i.id === id),
    [savedItems]
  );

  const value = useMemo(
    () => ({
      isAuthLoading,
      isAuthenticated,
      hasCompletedLocationSetup,
      session,
      supabaseUser,
      accessToken,
      userId,
      user,
      updateUser,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      resendVerificationEmail,
      login,
      logout,
      completeLocationSetup,
      currentLocation,
      setCurrentLocation,
      availableLocations,
      currentScreen,
      navigateTo,
      goBack,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      messages,
      isAnalyzing,
      sendMessage,
      startNewChat,
      loadHistorySession,
      savedItems,
      toggleSaveItem,
      isItemSaved,
    }),
    [
      isAuthLoading,
      isAuthenticated,
      hasCompletedLocationSetup,
      session,
      supabaseUser,
      accessToken,
      userId,
      user,
      updateUser,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      resendVerificationEmail,
      login,
      logout,
      completeLocationSetup,
      currentLocation,
      setCurrentLocation,
      availableLocations,
      currentScreen,
      navigateTo,
      goBack,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      messages,
      isAnalyzing,
      sendMessage,
      startNewChat,
      loadHistorySession,
      savedItems,
      toggleSaveItem,
      isItemSaved,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
