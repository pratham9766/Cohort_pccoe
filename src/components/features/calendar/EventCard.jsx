import { CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function EventCard({ event }) {
  const date = new Date(event.start_date);
  return (
    <Card hover className="event-card">
      <Badge variant="warning">{event.event_type}</Badge>
      <h3>{event.title}</h3>
      <p className="muted"><CalendarDays size={16} aria-hidden="true" /> {date.toLocaleString()}</p>
      <p className="muted"><MapPin size={16} aria-hidden="true" /> {event.location}</p>
    </Card>
  );
}
