import { Home, MessageCircle, Shuffle, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/communities', icon: Users, label: 'Comm' },
  { to: '/connect', icon: MessageCircle, label: 'Chat' },
  { to: '/xd', icon: Shuffle, label: 'XD' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <item.icon size={19} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
