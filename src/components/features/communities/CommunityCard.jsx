import { Bell, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

export function CommunityCard({ community, onOpen, onToggle }) {
  return (
    <Card hover className="community-card">
      <div className={`community-cover-card cover-${community.category}`} aria-hidden="true" />
      <button type="button" className="community-bell" onClick={onToggle} aria-label={`${community.subscribed ? 'Unsubscribe from' : 'Subscribe to'} ${community.name}`}>
        <Bell size={18} aria-hidden="true" />
      </button>
      <button type="button" className="community-logo" onClick={onOpen} aria-label={`Open ${community.name}`}>
        {community.name.slice(0, 2).toUpperCase()}
      </button>
      <button type="button" className="community-title" onClick={onOpen}>{community.name}</button>
      <p className="community-handle muted">@{community.slug ?? community.name.toLowerCase().replaceAll(' ', '')}</p>
      <p className="muted community-description">{community.description}</p>
      <div className="community-members muted">
        <Users size={15} aria-hidden="true" />
        {community.member_count} members
      </div>
    </Card>
  );
}
