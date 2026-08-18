import { ArrowRight, Search } from 'lucide-react';
import { useCalendarEvents, useCommunities, useConversations } from '@/hooks/useCampusData.js';
import { useUiStore } from '@/stores/uiStore.js';

function RailSection({ title, empty, children }) {
  return (
    <section className="rail-section">
      <header>
        <strong>{title}</strong>
        <ArrowRight size={16} aria-hidden="true" />
      </header>
      <div>{children ?? <p className="muted">{empty}</p>}</div>
    </section>
  );
}

export function RightRail() {
  const openSearch = useUiStore((state) => state.setSearchOpen);
  const { data: communities = [] } = useCommunities();
  const { data: conversations = [] } = useConversations();
  const { data: events = [] } = useCalendarEvents();

  return (
    <aside className="right-rail">
      <button type="button" className="rail-search" onClick={() => openSearch(true)}>
        <Search size={17} aria-hidden="true" />
        <span>Search cohort</span>
        <kbd>⌘ K</kbd>
      </button>

      <RailSection title="C/COMMUNITIES" empty="No communities yet">
        {communities.length
          ? communities.slice(0, 2).map((community) => <p key={community.id} className="rail-item">{community.name}</p>)
          : null}
      </RailSection>

      <RailSection title="C/FRIENDS" empty="No users yet" />

      <RailSection title="C/CONNECT" empty="No users available">
        {conversations.length
          ? conversations.slice(0, 2).map((conversation) => <p key={conversation.id} className="rail-item">{conversation.name}</p>)
          : null}
      </RailSection>

      <RailSection title="C/CALENDAR" empty="No upcoming events">
        {events.length
          ? events.slice(0, 2).map((event) => <p key={event.id} className="rail-item">{event.title}</p>)
          : null}
      </RailSection>

      <RailSection title="C/HEADSUP">
        <p className="rail-warning">Important</p>
        <p className="rail-copy">Full access will soon require PCCOE account login</p>
      </RailSection>

      <div className="rail-sticker" aria-hidden="true">SPIDER-MAN</div>
    </aside>
  );
}
