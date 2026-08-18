import { Home, MessageCircle, Shuffle, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/communities', icon: Users, label: 'Comm' },
  { to: '/dashboard/connect', icon: MessageCircle, label: 'Chat' },
  { to: '/dashboard/xd', icon: Shuffle, label: 'XD' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <item.icon size={19} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
