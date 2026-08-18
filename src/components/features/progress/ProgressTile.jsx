import { Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

const dayMs = 24 * 60 * 60 * 1000;
const weekCount = 16;
const totalDays = weekCount * 7;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function createDemoActivity() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const daysAgo = totalDays - index - 1;
    const date = new Date(today.getTime() - daysAgo * dayMs);
    const seed = date.getDate() + date.getMonth() * 3 + index;
    const value = seed % 11 === 0 ? 0 : (seed % 5) + (seed % 7 === 0 ? 2 : 0);
    return {
      date: formatDate(date),
      value: Math.min(value, 5),
    };
  });
}

function getLevel(value) {
  if (!value) return 0;
  if (value <= 1) return 1;
  if (value <= 3) return 2;
  if (value <= 5) return 3;
  return 4;
}

function getCurrentStreak(days) {
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (!days[index].value) break;
    streak += 1;
  }
  return streak;
}

export function ProgressTile({ activity = createDemoActivity() }) {
  const total = activity.reduce((sum, day) => sum + day.value, 0);
  const activeDays = activity.filter((day) => day.value > 0).length;
  const streak = getCurrentStreak(activity);

  return (
    <Card className="progress-tile">
      <header>
        <div>
          <h2>Daily Progress</h2>
          <p className="muted">Campus activity over the last {weekCount} weeks.</p>
        </div>
        <Trophy size={20} aria-hidden="true" />
      </header>

      <div className="progress-grid" aria-label="Daily activity progress">
        {activity.map((day) => (
          <span
            key={day.date}
            className={`progress-cell level-${getLevel(day.value)}`}
            title={`${day.date}: ${day.value} activity point${day.value === 1 ? '' : 's'}`}
            aria-label={`${day.date}: ${day.value} activity points`}
          />
        ))}
      </div>

      <footer>
        <span><strong>{total}</strong> points</span>
        <span><strong>{activeDays}</strong> active days</span>
        <span><Flame size={14} aria-hidden="true" /> <strong>{streak}</strong> day streak</span>
      </footer>
    </Card>
  );
}
