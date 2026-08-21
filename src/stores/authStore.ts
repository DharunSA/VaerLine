import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { useForumStore } from './forumStore';
import { usePeopleStore } from './peopleStore';

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
  updateProfile: (fullName: string, avatarUrl?: string) => Promise<boolean>;
  provisionRelativeAccount: (email: string, password: string, fullName: string, treeId: string) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
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
        usePeopleStore.getState().initializeUserTree(user.id, profile.fullName);
      } else {
        set({ user: null, session: null, isLoading: false });
      }

      // Listen for auth state changes
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
          usePeopleStore.getState().initializeUserTree(u.id, profile.fullName);
        } else {
          set({ user: null, session: null });
          useForumStore.getState().fetchPosts(undefined);
          usePeopleStore.getState().clearTree();
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already registered')) {
          msg = 'An account with this email address already exists. Please Sign In.';
        }
        set({ error: msg, isLoading: false });
        return { success: false, requiresVerification: false };
      }

      const requiresVerification = !data.session;
      if (requiresVerification) {
        set({
          isLoading: false,
          pendingVerificationEmail: email.trim(),
          authView: 'verification-sent',
        });
      } else if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? email.trim(),
          fullName: fullName.trim() || (data.user.email?.split('@')[0] ?? 'Member'),
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
        usePeopleStore.getState().initializeUserTree(data.user.id, profile.fullName);
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'Email not confirmed. Please check your inbox or spam folder for the confirmation email from Supabase, or click Resend below.';
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Invalid email or password. Please verify your email and password, or create a new account.';
        }
        set({ error: msg, isLoading: false, pendingVerificationEmail: email.trim() });
        return false;
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? email.trim(),
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
        usePeopleStore.getState().initializeUserTree(data.user.id, profile.fullName);
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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Vaerline Auth] Sign out error:', err);
    }
    set({
      user: null,
      session: null,
      isLoading: false,
      isAuthModalOpen: false,
      authView: 'login',
    });
    useForumStore.getState().fetchPosts(undefined);
    usePeopleStore.getState().clearTree();
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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

      set({ isLoading: false, authView: 'reset-sent', pendingVerificationEmail: email.trim() });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  resendVerificationEmail: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
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

  updateProfile: async (fullName: string, avatarUrl?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: Record<string, string> = { full_name: fullName.trim() };
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      const { data, error } = await supabase.auth.updateUser({
        data: updateData,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? '',
          fullName: data.user.user_metadata?.full_name ?? fullName,
          avatarUrl: data.user.user_metadata?.avatar_url ?? avatarUrl,
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
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  provisionRelativeAccount: async (email: string, password: string, fullName: string, treeId: string) => {
    try {
      // Create the Supabase auth account for the relative
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('already registered')) {
          msg = 'An account with this email already exists.';
        } else if (msg.toLowerCase().includes('rate limit')) {
          msg = 'Email rate limit reached. Disable email confirmation in Supabase Auth settings to provision accounts instantly.';
        }
        return { success: false, error: msg };
      }

      if (!data.user) {
        return { success: false, error: 'Account creation returned no user. Ensure "Confirm email" is disabled in Supabase.' };
      }

      // Link this new user to the creator's tree via tree_members
      const { error: memberErr } = await supabase.from('tree_members').insert({
        tree_id: treeId,
        user_id: data.user.id,
        role: 'member',
        invited_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });

      if (memberErr) {
        console.warn('[Vaerline] tree_members insert notice:', memberErr.message);
        // Not fatal — the account was created, member can be linked manually
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to provision account.';
      return { success: false, error: msg };
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });

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
}));
