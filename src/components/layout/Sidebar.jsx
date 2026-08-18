import { CalendarDays, Home, LogOut, Map, MessageCircle, Search, Settings, Shuffle, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { useAuthStore } from '@/stores/authStore.js';
import { useUiStore } from '@/stores/uiStore.js';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/dashboard/communities', label: 'Communities', icon: Users },
  { to: '/dashboard/connect', label: 'Connect', icon: MessageCircle, badge: 3 },
  { to: '/dashboard/xd', label: 'XD Board', icon: Shuffle },
  { to: '/dashboard/map', label: 'Campus Map', icon: Map },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const openSearch = useUiStore((state) => state.setSearchOpen);

  return (
    <aside className="sidebar glass-sidebar">
      <NavLink to="/dashboard" className="brand">
        <span className="brand-mark" aria-hidden="true">
          <img src="/cohort-logo.png" alt="" />
        </span>
        <span>
          <strong>COHORT</strong>
          <small>PCCOE</small>
        </span>
      </NavLink>

      <div className="user-chip">
        <Avatar src={user?.avatar_url} fallback={user?.full_name ?? 'CP'} size="sm" online />
        <span>
          <strong>{user?.full_name ?? 'Guest'}</strong>
          <small>{user?.branch ?? 'PCCOE'}</small>
        </span>
      </div>

      <button type="button" className="search-chip" onClick={() => openSearch(true)}>
        <Search size={16} aria-hidden="true" />
        <span>Search campus</span>
        <kbd>Ctrl K</kbd>
      </button>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
            {item.badge ? <b>{item.badge}</b> : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/dashboard/settings" className="nav-link">
          <Settings size={20} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
        <Button variant="ghost" icon={LogOut} onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
