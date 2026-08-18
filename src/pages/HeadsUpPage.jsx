import { Bell, CalendarClock, CheckCheck, Megaphone, Send, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { useUiStore } from '@/stores/uiStore.js';

const defaultAlerts = [
  { id: 'h1', type: 'urgent', title: 'ERP form deadline', message: 'Mid-semester exam form closes on August 24 at 5:00 PM.', created_at: 'Today, 9:15 AM', is_read: false },
  { id: 'h2', type: 'event', title: 'GDGC Product Jam', message: 'Report to Seminar Hall B by 10:00 AM with your laptop.', created_at: 'Today, 8:40 AM', is_read: false },
  { id: 'h3', type: 'safety', title: 'Lab access notice', message: 'Computer Lab 3 is reserved for workshop setup after 4:00 PM.', created_at: 'Yesterday', is_read: true },
];

export default function HeadsUpPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const addToast = useNotificationStore((state) => state.addToast);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const openPanel = useUiStore((state) => state.setNotificationPanelOpen);
  const [draft, setDraft] = useState('');

  const alerts = useMemo(() => {
    const customAlerts = notifications.map((item) => ({ type: 'event', title: 'Campus update', ...item }));
    return [...customAlerts, ...defaultAlerts];
  }, [notifications]);

  const sendDemoAlert = (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    addNotification({
      id: crypto.randomUUID(),
      message,
      created_at: 'Just now',
      is_read: false,
    });
    addToast('HeadsUp alert published.', 'success');
    setDraft('');
  };

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/headsup</h1>
          <p className="muted">Campus alerts, deadlines, notices, and urgent updates.</p>
        </div>
        <div className="cluster">
          <Button variant="ghost" icon={CheckCheck} onClick={markAllRead}>Mark read</Button>
          <Button variant="ghost" icon={Bell} onClick={() => openPanel(true)}>Open panel</Button>
        </div>
      </div>

      <div className="headsup-layout">
        <div className="stack">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`headsup-alert ${alert.is_read ? '' : 'unread'} ${alert.type}`}>
              <div className="headsup-icon">
                {alert.type === 'urgent' ? <ShieldAlert size={20} aria-hidden="true" /> : null}
                {alert.type === 'event' ? <CalendarClock size={20} aria-hidden="true" /> : null}
                {alert.type === 'safety' ? <Megaphone size={20} aria-hidden="true" /> : null}
              </div>
              <div>
                <h2>{alert.title}</h2>
                <p>{alert.message}</p>
                <small>{alert.created_at}</small>
              </div>
            </Card>
          ))}
        </div>

        <Card className="stack headsup-composer">
          <h2>Broadcast Demo Alert</h2>
          <form className="stack" onSubmit={sendDemoAlert}>
            <textarea
              className="textarea-input"
              rows={5}
              value={draft}
              placeholder="Write a notice for students..."
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button icon={Send} disabled={!draft.trim()}>
              Publish Alert
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
