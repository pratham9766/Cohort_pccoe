import { Chrome, Compass, LockKeyhole, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { signInWithGoogle } from '@/lib/auth.js';
import { hasSupabaseConfig } from '@/lib/supabase.js';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { ToastViewport } from '@/components/ui/Toast.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const addToast = useNotificationStore((state) => state.addToast);

  useEffect(() => {
    if (!loading && user?.is_onboarded) navigate('/dashboard', { replace: true });
    if (!loading && user && !user.is_onboarded) navigate('/onboarding', { replace: true });
  }, [loading, navigate, user]);

  async function login() {
    try {
      if (!hasSupabaseConfig) {
        addToast('Demo mode is active. Add Supabase env vars for Google OAuth.', 'info');
        return;
      }
      await signInWithGoogle();
    } catch (error) {
      addToast(error.message, 'error');
    }
  }

  return (
    <main className="login-page">
      <div className="login-effects" aria-hidden="true" />
      <section className="login-card glass-elevated">
        <div className="login-logo">
          <img src="/cohort-logo.png" alt="Cohort PCCOE" />
        </div>
        <p className="eyebrow">PCCOE campus platform</p>
        <h1>Cohort PCCOE</h1>
        <p className="muted">Discover communities, connect with peers, collaborate on campus opportunities, and stay in sync with PCCOE.</p>
        <div className="login-highlights" aria-label="Platform highlights">
          <span><Users size={16} aria-hidden="true" /> Communities</span>
          <span><LockKeyhole size={16} aria-hidden="true" /> Secure connect</span>
          <span><Compass size={16} aria-hidden="true" /> Campus map</span>
        </div>
        <Button icon={Chrome} onClick={login}>Sign in with Google</Button>
        <small className="muted">Restricted to @pccoe.org and @pccoepune.org accounts.</small>
      </section>
      <ToastViewport />
    </main>
  );
}
