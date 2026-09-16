import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  login: (phone?: string) => void;
  demoLogin: () => void;
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
  const [, setHistory] = useState<ScreenType[]>(['AUTH']);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Conversational chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Saved items
  const [savedItems, setSavedItems] = useState<SavedItem[]>(SAMPLE_SAVED);

  // 1. Initial Session Restoration & Real-Time Auth Event Subscription
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
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
        } else {
          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setCurrentScreen('AUTH');
        }
      } catch (err) {
        console.error('[Supabase Auth] Session initialization error:', err);
        if (isMounted) {
          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setCurrentScreen('AUTH');
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
      console.log(`[Supabase Auth] Auth event: ${event}`);

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
            }
          }
          break;

        case 'SIGNED_OUT':
          setSession(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setCurrentScreen('AUTH');
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
      }

      return result;
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  }, []);

  // Legacy login handler maintained for compatibility
  const login = useCallback((phone?: string) => {
    console.warn(
      '[Supabase Auth] Simulated login is deprecated. Real authentication requires Supabase session.'
    );
    if (phone) {
      setUser((prev) => ({ ...prev, phone }));
    }
  }, []);

  // SIH Demo: bypass Supabase auth entirely, set app into authenticated state
  const demoLogin = useCallback(() => {
    setIsAuthenticated(true);
    setIsAuthLoading(false);
    setUser((prev) => ({
      ...prev,
      id: 'demo_sih_user',
      name: 'Subhash',
    }));
    setCurrentScreen('DASHBOARD');
  }, []);

  // Real Supabase Logout
  const logout = useCallback(async () => {
    setIsDrawerOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] Error signing out:', err);
    } finally {
      setSession(null);
      setSupabaseUser(null);
      setIsAuthenticated(false);
      setCurrentScreen('AUTH');
      setMessages([]);
    }
  }, []);

  const completeLocationSetup = useCallback((loc: MarineLocation) => {
    setCurrentLocationState(loc);
    setUser((prev) => ({ ...prev, baseLocation: `${loc.name}, ${loc.state}` }));
    setHasCompletedLocationSetup(true);
    setCurrentScreen('DASHBOARD');
  }, []);

  // Navigation handlers
  const navigateTo = useCallback((screen: ScreenType) => {
    setIsDrawerOpen(false);
    setCurrentScreen(screen);
    setHistory((prev) => (prev[prev.length - 1] === screen ? prev : [...prev, screen]));
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('DASHBOARD');
        return ['DASHBOARD'];
      }
      const newHistory = prev.slice(0, -1);
      setCurrentScreen(newHistory[newHistory.length - 1]);
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

      try {
        const response: OrcaResponse = await OrcaService.queryOrca(
          queryText,
          currentLocation.name,
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
    [currentLocation.name]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
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
      login,
      demoLogin,
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
      login,
      demoLogin,
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
