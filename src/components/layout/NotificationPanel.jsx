import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { useUiStore } from '@/stores/uiStore.js';

export function NotificationPanel() {
  const open = useUiStore((state) => state.notificationPanelOpen);
  const setOpen = useUiStore((state) => state.setNotificationPanelOpen);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  if (!open) return null;

  return (
    <aside className="notification-panel glass-elevated">
      <header>
        <h2>Notifications</h2>
        <div className="cluster">
          <Button variant="ghost" onClick={markAllRead}>
            Mark read
          </Button>
          <Button variant="ghost" icon={X} aria-label="Close notifications" onClick={() => setOpen(false)} />
        </div>
      </header>
      <div className="stack">
        {notifications.map((item) => (
          <Card key={item.id} className={item.is_read ? '' : 'notification-unread'}>
            <strong>{item.message}</strong>
            <p className="muted">{item.created_at}</p>
          </Card>
        ))}
        {!notifications.length ? <Card><p className="muted">No notifications yet.</p></Card> : null}
      </div>
    </aside>
  );
}
