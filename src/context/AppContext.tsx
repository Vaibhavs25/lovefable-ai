/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Storyboard, SavedFable, BookmarkedScene, User } from '../types';
import { OFFLINE_STORYBOARDS } from '../data/presets';

// ─── Helpers ─────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function loadGenerationsToday(): number {
  try {
    const stored = localStorage.getItem('lovefable_generations');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === new Date().toDateString()) return parsed.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── State ───────────────────────────────────────────────────

export interface AppState {
  // Navigation
  activeStoryboard: Storyboard | null;
  activeTab: 'create' | 'my_stories';
  myStories: Storyboard[];
  shareModalStoryboard: Storyboard | null;

  // Saved data
  savedFables: SavedFable[];
  bookmarkedScenes: BookmarkedScene[];

  // Modal visibility
  isLibraryOpen: boolean;
  isBookmarksOpen: boolean;
  isPricingOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthModalOpen: boolean;
  isProfileOpen: boolean;
  isBillingOpen: boolean;

  // App state
  isOffline: boolean;
  tier: 'Free' | 'Pro';
  generationsToday: number;
  limitReachedAlert: boolean;

  // Auth
  user: User | null;
  authInterceptMessage: string | null;
}

const initialState: AppState = {
  activeStoryboard: null,
  activeTab: 'create',
  myStories: OFFLINE_STORYBOARDS,
  shareModalStoryboard: null,

  savedFables: loadFromStorage<SavedFable[]>('lovefable_saved_stories', []),
  bookmarkedScenes: loadFromStorage<BookmarkedScene[]>('lovefable_bookmarked_scenes', []),

  isLibraryOpen: false,
  isBookmarksOpen: false,
  isPricingOpen: false,
  isCheckoutOpen: false,
  isAuthModalOpen: false,
  isProfileOpen: false,
  isBillingOpen: false,

  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  tier: (loadFromStorage<string>('lovefable_tier', 'Free') as 'Free' | 'Pro'),
  generationsToday: loadGenerationsToday(),
  limitReachedAlert: false,

  user: loadFromStorage<User | null>('lovefable_user', null),
  authInterceptMessage: null,
};

// ─── Actions ─────────────────────────────────────────────────

export type AppAction =
  // Navigation
  | { type: 'SET_ACTIVE_STORYBOARD'; payload: Storyboard | null }
  | { type: 'SET_ACTIVE_TAB'; payload: 'create' | 'my_stories' }
  | { type: 'SET_SHARE_MODAL_STORYBOARD'; payload: Storyboard | null }
  | { type: 'ADD_MY_STORY'; payload: Storyboard }
  | { type: 'DELETE_MY_STORY'; payload: string }

  // Saved data
  | { type: 'SET_SAVED_FABLES'; payload: SavedFable[] }
  | { type: 'SET_BOOKMARKED_SCENES'; payload: BookmarkedScene[] }

  // Modals
  | { type: 'SET_MODAL'; payload: { modal: keyof Pick<AppState, 'isLibraryOpen' | 'isBookmarksOpen' | 'isPricingOpen' | 'isCheckoutOpen' | 'isAuthModalOpen' | 'isProfileOpen' | 'isBillingOpen'>; open: boolean } }

  // App state
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_TIER'; payload: 'Free' | 'Pro' }
  | { type: 'SET_LIMIT_REACHED_ALERT'; payload: boolean }
  | { type: 'INCREMENT_GENERATIONS' }

  // Auth
  | { type: 'SIGN_IN'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_AUTH_INTERCEPT'; payload: string | null };

// ─── Reducer ─────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Navigation
    case 'SET_ACTIVE_STORYBOARD':
      return { ...state, activeStoryboard: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_SHARE_MODAL_STORYBOARD':
      return { ...state, shareModalStoryboard: action.payload };

    case 'ADD_MY_STORY':
      return { ...state, myStories: [action.payload, ...state.myStories] };

    case 'DELETE_MY_STORY':
      return { ...state, myStories: state.myStories.filter(s => s.id !== action.payload) };

    // Saved data (with localStorage sync)
    case 'SET_SAVED_FABLES':
      saveToStorage('lovefable_saved_stories', action.payload);
      return { ...state, savedFables: action.payload };

    case 'SET_BOOKMARKED_SCENES':
      saveToStorage('lovefable_bookmarked_scenes', action.payload);
      return { ...state, bookmarkedScenes: action.payload };

    // Modals
    case 'SET_MODAL':
      return { ...state, [action.payload.modal]: action.payload.open };

    // App state
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };

    case 'SET_TIER':
      saveToStorage('lovefable_tier', action.payload);
      return { ...state, tier: action.payload };

    case 'SET_LIMIT_REACHED_ALERT':
      return { ...state, limitReachedAlert: action.payload };

    case 'INCREMENT_GENERATIONS': {
      const newCount = state.generationsToday + 1;
      saveToStorage('lovefable_generations', { date: new Date().toDateString(), count: newCount });
      // Also decrement user credits
      const updatedUser = state.user && state.user.credits > 0
        ? { ...state.user, credits: state.user.credits - 1 }
        : state.user;
      if (updatedUser) saveToStorage('lovefable_user', updatedUser);
      return { ...state, generationsToday: newCount, user: updatedUser };
    }

    // Auth
    case 'SIGN_IN': {
      const newUser = action.payload;
      saveToStorage('lovefable_user', newUser);
      const newTier = (newUser.plan === 'Pro' || newUser.plan === 'VIP') ? 'Pro' as const : state.tier;
      if (newTier === 'Pro') saveToStorage('lovefable_tier', 'Pro');
      return {
        ...state,
        user: newUser,
        tier: newTier,
        isAuthModalOpen: false,
        authInterceptMessage: null,
      };
    }

    case 'SIGN_OUT':
      removeFromStorage('lovefable_user');
      removeFromStorage('lovefable_tier');
      removeFromStorage('lovefable_generations');
      return { ...state, user: null, tier: 'Free', generationsToday: 0 };

    case 'UPDATE_USER': {
      const updated = action.payload;
      saveToStorage('lovefable_user', updated);
      const tierUpdate = (updated.plan === 'Pro' || updated.plan === 'VIP') ? 'Pro' as const : state.tier;
      if (tierUpdate === 'Pro') saveToStorage('lovefable_tier', 'Pro');
      return { ...state, user: updated, tier: tierUpdate };
    }

    case 'SET_AUTH_INTERCEPT':
      return { ...state, authInterceptMessage: action.payload };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// Convenience selectors
export function useAppState(): AppState {
  return useAppContext().state;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  return useAppContext().dispatch;
}

// ─── Provider ────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
