import { CalendarDays, MapPin, MessageSquare, Sparkles, Users } from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { EventCard } from '@/components/features/calendar/EventCard.jsx';
import { CommunityCard } from '@/components/features/communities/CommunityCard.jsx';
import { PostCard } from '@/components/features/feed/PostCard.jsx';
import { PostComposer } from '@/components/features/feed/PostComposer.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useCalendarEvents, useCommunities, useFeed } from '@/hooks/useCampusData.js';
import { useRealtimeInvalidation } from '@/hooks/useRealtimeInvalidation.js';

export default function DashboardPage() {
  const { data: feed = [] } = useFeed();
  const { data: comms = [] } = useCommunities();
  const { data: events = [] } = useCalendarEvents();
  const feedKeys = useMemo(() => [['feed']], []);
  const eventKeys = useMemo(() => [['calendar-events']], []);
  useRealtimeInvalidation('posts', feedKeys);
  useRealtimeInvalidation('calendar_events', eventKeys);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/home</h1>
          <p className="muted">Discover, connect, and collaborate across PCCOE.</p>
        </div>
      </div>

      <div className="module-strip" aria-label="Cohort quick links">
        <NavLink to="/dashboard/communities">
          <Users size={18} aria-hidden="true" />
          <span>Communities</span>
          <strong>{comms.length}</strong>
        </NavLink>
        <NavLink to="/dashboard/connect">
          <MessageSquare size={18} aria-hidden="true" />
          <span>Connect</span>
          <strong>Secure</strong>
        </NavLink>
        <NavLink to="/dashboard/xd">
          <Sparkles size={18} aria-hidden="true" />
          <span>XD Board</span>
          <strong>{feed.length + 3}</strong>
        </NavLink>
        <NavLink to="/dashboard/map">
          <MapPin size={18} aria-hidden="true" />
          <span>Campus Map</span>
          <strong>Live</strong>
        </NavLink>
      </div>

      <div className="dashboard-grid">
        <div className="stack">
          <PostComposer />
          {feed.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
        <aside className="stack">
          <Card className="stack">
            <h2><CalendarDays size={20} aria-hidden="true" /> Upcoming Events</h2>
            {events.slice(0, 2).map((event) => <EventCard key={event.id} event={event} />)}
          </Card>
          <Card className="stack">
            <h2><Users size={20} aria-hidden="true" /> Communities You May Like</h2>
            {comms.slice(0, 2).map((community) => <CommunityCard key={community.id} community={community} />)}
          </Card>
        </aside>
      </div>
    </section>
  );
}
