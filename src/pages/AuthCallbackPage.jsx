import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card.jsx';
import { ensureKeyPair } from '@/lib/encryption.js';
import { ensureUserProfile, isAllowedPccoeEmail } from '@/lib/auth.js';
import { supabase, supabaseConfigError } from '@/lib/supabase.js';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (!supabase) {
        navigate(`/login?error=${encodeURIComponent(supabaseConfigError)}`, { replace: true });
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const authUser = data.session?.user;
        if (!authUser || !isAllowedPccoeEmail(authUser.email)) {
          await supabase.auth.signOut();
          navigate('/login?error=unauthorized_domain', { replace: true });
          return;
        }
        const { publicKey } = ensureKeyPair();
        const { data: profile, error: profileError } = await ensureUserProfile(authUser, publicKey);
        if (profileError) throw profileError;
        navigate(profile?.is_onboarded ? '/dashboard' : '/onboarding', { replace: true });
      } catch (error) {
        await supabase.auth.signOut();
        navigate(`/login?error=${encodeURIComponent(error.message)}`, { replace: true });
      }
    }
    handleCallback();
  }, [navigate]);

  return (
    <main className="content">
      <Card>
        <h1>Completing sign in...</h1>
        <p className="muted">Checking your PCCOE account and profile.</p>
      </Card>
    </main>
  );
}
