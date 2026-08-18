import { CalendarDays, Users } from 'lucide-react';
import { useMemo } from 'react';
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
          <p className="eyebrow">Discover. Connect. Collaborate.</p>
          <h1 className="page-title">Campus Feed</h1>
        </div>
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
