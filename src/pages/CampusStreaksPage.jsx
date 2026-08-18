import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarCheck, Check, Flame, ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';

const STORAGE_KEY = 'cohort.campusStreak.logs';
const streakTypes = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'events', label: 'Events', icon: CalendarCheck },
  { id: 'study', label: 'Study', icon: BookOpenCheck },
];

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function loadLogs() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function countStreak(logs, type) {
  let streak = 0;
  const cursor = new Date();

  while (logs[todayKey(cursor)]?.[type]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function CampusStreaksPage() {
  const addToast = useNotificationStore((state) => state.addToast);
  const [logs, setLogs] = useState(loadLogs);
  const today = todayKey();

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const stats = useMemo(() => streakTypes.map((type) => ({
    ...type,
    streak: countStreak(logs, type.id),
    doneToday: Boolean(logs[today]?.[type.id]),
  })), [logs, today]);

  const totalToday = stats.filter((item) => item.doneToday).length;
  const bestStreak = Math.max(0, ...stats.map((item) => item.streak));

  const toggleLog = (type) => {
    setLogs((current) => {
      const day = current[today] ?? {};
      return {
        ...current,
        [today]: {
          ...day,
          [type]: !day[type],
        },
      };
    });
    addToast('Campus streak updated.', 'success');
  };

  return (
    <section className="page stack campus-streaks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/streaks</h1>
          <p className="muted">Track consistency across tasks, events, and study sessions.</p>
        </div>
      </div>

      <div className="streak-hero glass-card">
        <div>
          <span className="eyebrow">Campus streak</span>
          <h2>{bestStreak} day{bestStreak === 1 ? '' : 's'}</h2>
          <p>Keep one small campus win alive every day.</p>
        </div>
        <div className="streak-ring" aria-label={`${totalToday} of 3 habits completed today`}>
          <Flame size={36} aria-hidden="true" />
          <strong>{totalToday}/3</strong>
        </div>
      </div>

      <div className="streak-grid">
        {stats.map((item) => (
          <Card key={item.id} className={`streak-card ${item.doneToday ? 'complete' : ''}`}>
            <span className="streak-icon"><item.icon size={24} aria-hidden="true" /></span>
            <div>
              <h2>{item.label}</h2>
              <p className="muted">{item.streak} day streak</p>
            </div>
            <Button variant={item.doneToday ? 'secondary' : 'primary'} icon={item.doneToday ? Check : Plus} onClick={() => toggleLog(item.id)}>
              {item.doneToday ? 'Logged' : 'Log today'}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
