import { create } from 'zustand';
import { clearDemoSession } from '@/lib/demo.js';
import { supabase } from '@/lib/supabase.js';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    clearDemoSession();
    set({ user: null, session: null, loading: false, error: null });
  },
}));
