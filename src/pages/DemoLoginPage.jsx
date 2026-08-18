import { LogIn, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { demoUsers, startDemoSession } from '@/lib/demo.js';
import { useAuthStore } from '@/stores/authStore.js';
import { ToastViewport } from '@/components/ui/Toast.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function DemoLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const addToast = useNotificationStore((state) => state.addToast);

  function login(userId) {
    const user = startDemoSession(userId);
    setUser(user);
    setSession({ demo: true, user: { id: user.id, email: user.email } });
    setError(null);
    setLoading(false);
    addToast(`Demo signed in as ${user.full_name}.`, 'success');
    navigate('/dashboard', { replace: true });
  }

  return (
    <main className="login-page demo-page">
      <div className="login-effects" aria-hidden="true" />
      <section className="demo-panel glass-elevated">
        <div className="login-logo">
          <img src="/cohort-logo.png" alt="Cohort PCCOE" />
        </div>
        <p className="eyebrow">Demo access</p>
        <h1>Explore Cohort PCCOE</h1>
        <p className="muted">Use fixture campus data without Google OAuth or Supabase credentials. Demo mode is explicit and local to this browser.</p>
        <div className="demo-users">
          {demoUsers.map((user) => (
            <Card key={user.id} className="demo-user-card">
              <Avatar src={user.avatar_url} fallback={user.full_name} online />
              <div>
                <strong>{user.full_name}</strong>
                <p className="muted">{user.branch} · Year {user.year}</p>
              </div>
              <Button icon={LogIn} onClick={() => login(user.id)}>Enter</Button>
            </Card>
          ))}
        </div>
        <p className="demo-note muted"><ShieldCheck size={16} aria-hidden="true" /> Production login remains restricted to PCCOE institutional Google accounts.</p>
      </section>
      <ToastViewport />
    </main>
  );
}
