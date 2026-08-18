import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCampusData.js';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calendarCells = Array.from({ length: 35 }, (_, index) => index + 1);

export default function CalendarPage() {
  const { data = [] } = useCalendarEvents();

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/calendar</h1>
          <p className="muted">Academic events and important dates.</p>
        </div>
      </div>
      <div className="calendar-original-head">
        <h2>August 2026</h2>
        <div className="cluster">
          <button type="button" aria-label="Previous month"><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="calendar-grid-original">
        {days.map((day) => <div key={day} className="calendar-day-name">{day}</div>)}
        {calendarCells.map((day) => {
          const event = data.find((item) => new Date(item.start_date).getDate() === day);
          return (
            <div key={day} className="calendar-cell">
              <span>{day}</span>
              {event ? <small>{event.title}</small> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
