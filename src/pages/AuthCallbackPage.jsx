import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card.jsx';
import { ensureKeyPair } from '@/lib/encryption.js';
import { ensureUserProfile, isAllowedPccoeEmail } from '@/lib/auth.js';
import { supabase } from '@/lib/supabase.js';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (!supabase) {
        navigate('/dashboard', { replace: true });
        return;
      }
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (!authUser || !isAllowedPccoeEmail(authUser.email)) {
        await supabase.auth.signOut();
        navigate('/login?error=unauthorized_domain', { replace: true });
        return;
      }
      const { publicKey } = ensureKeyPair();
      const { data: profile } = await ensureUserProfile(authUser, publicKey);
      navigate(profile?.is_onboarded ? '/dashboard' : '/onboarding', { replace: true });
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
