import { useEffect } from 'react';
import { getStoredDemoUser } from '@/lib/demo.js';
import { useAuthStore } from '@/stores/authStore.js';
import { hasSupabaseConfig, supabase, supabaseConfigError } from '@/lib/supabase.js';

export function useAuth() {
  const store = useAuthStore();
  const { setError, setLoading, setSession, setUser } = store;

  useEffect(() => {
    const demoUser = getStoredDemoUser();
    if (demoUser) {
      setSession({ demo: true, user: { id: demoUser.id, email: demoUser.email } });
      setUser(demoUser);
      setError(null);
      setLoading(false);
      return undefined;
    }

    if (!hasSupabaseConfig || !supabase) {
      setSession(null);
      setUser(null);
      setError(supabaseConfigError);
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    async function loadProfile(session) {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: profile, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (error) {
        setError(error.message);
        setUser(null);
      } else {
        setError(null);
        setUser(profile);
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSession(data.session);
      await loadProfile(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await loadProfile(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setError, setLoading, setSession, setUser]);

  return store;
}
