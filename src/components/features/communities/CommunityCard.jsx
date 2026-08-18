import { Check, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function CommunityCard({ community, onOpen, onToggle }) {
  return (
    <Card hover className="community-card">
      <button type="button" className="community-logo" onClick={onOpen} aria-label={`Open ${community.name}`}>
        {community.name.slice(0, 2).toUpperCase()}
      </button>
      <div className="community-stats">
        <Users size={16} aria-hidden="true" />
        {community.member_count}
      </div>
      <button type="button" className="community-title" onClick={onOpen}>{community.name}</button>
      <Badge variant={community.category}>{community.category}</Badge>
      <p className="muted">{community.description}</p>
      <Button variant={community.subscribed ? 'secondary' : 'primary'} icon={community.subscribed ? Check : undefined} onClick={onToggle}>
        {community.subscribed ? 'Unsubscribe' : 'Subscribe'}
      </Button>
    </Card>
  );
}
