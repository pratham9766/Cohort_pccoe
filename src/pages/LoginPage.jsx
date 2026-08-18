import { Chrome } from 'lucide-react';
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
      <section className="login-card glass-elevated">
        <div className="login-logo">C</div>
        <h1>Welcome to Cohort</h1>
        <p className="muted">The official PCCOE campus platform for students, faculty, and alumni.</p>
        <Button icon={Chrome} onClick={login}>Sign in with Google</Button>
        <small className="muted">Restricted to @pccoe.org and @pccoepune.org accounts.</small>
      </section>
      <ToastViewport />
    </main>
  );
}
