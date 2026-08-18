import { Outlet } from 'react-router-dom';
import { useCallback } from 'react';
import { BottomNav } from './BottomNav.jsx';
import { NotificationPanel } from './NotificationPanel.jsx';
import { SearchModal } from './SearchModal.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TopNav } from './TopNav.jsx';
import { ToastViewport } from '@/components/ui/Toast.jsx';
import { useRealtimePostgres } from '@/hooks/useRealtime.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const addToast = useNotificationStore((state) => state.addToast);
  const onNotification = useCallback(
    (payload) => {
      addNotification(payload.new);
      addToast(payload.new.message, 'info');
    },
    [addNotification, addToast],
  );

  useRealtimePostgres({
    table: 'notifications',
    filter: user?.id ? `recipient_id=eq.${user.id}` : undefined,
    onInsert: user?.id ? onNotification : undefined,
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopNav />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <NotificationPanel />
      <SearchModal />
      <ToastViewport />
    </div>
  );
}
