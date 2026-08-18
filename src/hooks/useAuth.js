import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore.js';
import { currentUser } from '@/lib/constants.js';
import { hasSupabaseConfig, supabase } from '@/lib/supabase.js';

export function useAuth() {
  const store = useAuthStore();
  const { setLoading, setSession, setUser } = store;

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setSession({ demo: true });
      setUser(currentUser);
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (!data.session) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase.from('users').select('*').eq('id', data.session.user.id).single();
      setUser(profile);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setUser(profile);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setLoading, setSession, setUser]);

  return store;
}
