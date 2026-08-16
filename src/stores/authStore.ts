import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { useForumStore } from './forumStore';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'creator' | 'member' | 'guest';
  isEmailVerified: boolean;
  createdAt: string;
}

export type AuthView = 'login' | 'register' | 'forgot-password' | 'verification-sent' | 'reset-sent';

interface AuthStore {
  // State
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authView: AuthView;
  pendingVerificationEmail: string | null;

  // Modal Actions
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
  setAuthView: (view: AuthView) => void;
  clearError: () => void;

  // Auth Actions
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; requiresVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  loginAsDemoUser: (role?: 'creator' | 'member') => void;
  initializeAuth: () => Promise<void>;
}

const DEMO_USER_CREATOR: UserProfile = {
  id: 'demo-creator-123',
  email: 'aditya.sharma@vaerline.family',
  fullName: 'Aditya Sharma',
  avatarUrl: undefined,
  role: 'creator',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
};

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder'));
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null, // Starts as null until session is restored or user logs in
  session: null,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authView: 'login',
  pendingVerificationEmail: null,

  openAuthModal: (view = 'login') => {
    set({ isAuthModalOpen: true, authView: view, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  setAuthView: (view) => {
    set({ authView: view, error: null });
  },

  clearError: () => set({ error: null }),

  initializeAuth: async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      set({ isLoading: true });
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const user = session.user;
        const profile: UserProfile = {
          id: user.id,
          email: user.email ?? '',
          fullName: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Family Member',
          avatarUrl: user.user_metadata?.avatar_url,
          role: 'creator',
          isEmailVerified: Boolean(user.email_confirmed_at),
          createdAt: user.created_at,
        };
        set({ user: profile, session, isLoading: false });
      } else {
        set({ user: null, session: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession?.user) {
          const u = newSession.user;
          const profile: UserProfile = {
            id: u.id,
            email: u.email ?? '',
            fullName: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'Family Member',
            avatarUrl: u.user_metadata?.avatar_url,
            role: 'creator',
            isEmailVerified: Boolean(u.email_confirmed_at),
            createdAt: u.created_at,
          };
          set({ user: profile, session: newSession });
          useForumStore.getState().fetchPosts(u.id);
        } else {
          set({ user: null, session: null });
          useForumStore.getState().fetchPosts(undefined);
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('[Vaerline Auth] Supabase init notice:', errorMessage);
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      // Offline / Demo registration simulation
      await new Promise(r => setTimeout(r, 600));
      const simulatedUser: UserProfile = {
        id: 'user_' + Math.random().toString(36).slice(2, 9),
        email,
        fullName,
        role: 'creator',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };

      set({
        isLoading: false,
        pendingVerificationEmail: email,
        authView: 'verification-sent',
      });
      return { success: true, requiresVerification: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, requiresVerification: false };
      }

      const requiresVerification = !data.session;
      if (requiresVerification) {
        set({
          isLoading: false,
          pendingVerificationEmail: email,
          authView: 'verification-sent',
        });
      } else if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: fullName || (data.user.email?.split('@')[0] ?? 'Member'),
          role: 'creator',
          isEmailVerified: Boolean(data.user.email_confirmed_at),
          createdAt: data.user.created_at,
        };
        set({
          user: profile,
          session: data.session,
          isLoading: false,
          isAuthModalOpen: false,
        });
      }

      return { success: true, requiresVerification };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, requiresVerification: false };
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      // Demo authentication simulation
      await new Promise(r => setTimeout(r, 500));
      const demoUser: UserProfile = {
        id: 'user_demo_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
        email,
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: 'creator',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      set({ user: demoUser, isLoading: false, isAuthModalOpen: false });
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Member',
          avatarUrl: data.user.user_metadata?.avatar_url,
          role: 'creator',
          isEmailVerified: Boolean(data.user.email_confirmed_at),
          createdAt: data.user.created_at,
        };
        set({
          user: profile,
          session: data.session,
          isLoading: false,
          isAuthModalOpen: false,
        });
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Vaerline Auth] Sign out error:', err);
      }
    }
    set({
      user: null,
      session: null,
      isLoading: false,
      isAuthModalOpen: true,
      authView: 'login',
    });
    useForumStore.getState().fetchPosts(undefined);
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      await new Promise(r => setTimeout(r, 600));
      set({ isLoading: false, authView: 'reset-sent', pendingVerificationEmail: email });
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('over_email_send_rate_limit')) {
          msg = 'Email rate limit reached by Supabase. Please wait a few minutes or click the reset link previously sent to your inbox.';
        }
        set({ error: msg, isLoading: false });
        return false;
      }

      set({ isLoading: false, authView: 'reset-sent', pendingVerificationEmail: email });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  resendVerificationEmail: async (email: string) => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      await new Promise(r => setTimeout(r, 500));
      set({ isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }

      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend confirmation email.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      await new Promise(r => setTimeout(r, 600));
      set({ isLoading: false });
      return true;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? '',
          fullName: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Member',
          avatarUrl: data.user.user_metadata?.avatar_url,
          role: 'creator',
          isEmailVerified: Boolean(data.user.email_confirmed_at),
          createdAt: data.user.created_at,
        };
        set({ user: profile, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  loginAsDemoUser: (role = 'creator') => {
    set({
      user: role === 'creator' ? DEMO_USER_CREATOR : {
        id: 'demo-member-456',
        email: 'priya.sharma@vaerline.family',
        fullName: 'Priya Sharma',
        role: 'member',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      },
      session: null,
      isAuthModalOpen: false,
    });
  },
}));
