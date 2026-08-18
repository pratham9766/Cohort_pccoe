import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { useUiStore } from '@/stores/uiStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export function TopNav() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setNotificationPanelOpen = useUiStore((state) => state.setNotificationPanelOpen);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <header className="top-nav">
      <Button variant="ghost" icon={Menu} aria-label="Open navigation" onClick={toggleSidebar} />
      <strong className="top-brand">
        <img src="/cohort-logo.png" alt="" />
        COHORT PCCOE
      </strong>
      <div className="cluster">
        <Button variant="ghost" icon={Search} aria-label="Open search" onClick={() => setSearchOpen(true)} />
        <button type="button" className="bell-button" aria-label="Open notifications" onClick={() => setNotificationPanelOpen(true)}>
          <Bell size={19} aria-hidden="true" />
          {unreadCount ? <span>{unreadCount}</span> : null}
        </button>
      </div>
    </header>
  );
}
