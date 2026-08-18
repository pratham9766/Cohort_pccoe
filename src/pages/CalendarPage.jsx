import { EventCard } from '@/components/features/calendar/EventCard.jsx';
import { useCalendarEvents } from '@/hooks/useCampusData.js';

export default function CalendarPage() {
  const { data = [] } = useCalendarEvents();

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Academic Calendar</p>
          <h1 className="page-title">Events, deadlines, workshops</h1>
        </div>
      </div>
      <div className="grid three">
        {data.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}
