import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock, MapPin, Plus, Sparkles, Trash2, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';

const STORAGE_KEY = 'cohort.studyBuddy.requests';
const defaultRequest = {
  subject: '',
  slot: '',
  mode: 'Library',
  goal: '',
};

const seedBuddies = [
  { id: 'buddy-1', name: 'Isha', subject: 'DSA', slot: '18:00', mode: 'Library', goal: 'Graphs revision' },
  { id: 'buddy-2', name: 'Aarav', subject: 'DBMS', slot: '16:30', mode: 'Online', goal: 'SQL practice' },
  { id: 'buddy-3', name: 'Mira', subject: 'Maths', slot: '17:00', mode: 'Canteen', goal: 'Previous year sums' },
  { id: 'buddy-4', name: 'Kabir', subject: 'DSA', slot: '18:30', mode: 'Library', goal: 'Dynamic programming' },
];

function loadRequests() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function scoreBuddy(request, buddy) {
  if (!request.subject) return 0;
  let score = 0;
  if (buddy.subject.toLowerCase() === request.subject.toLowerCase()) score += 55;
  if (buddy.mode === request.mode) score += 25;
  if (request.slot && Math.abs(Number(buddy.slot.replace(':', '')) - Number(request.slot.replace(':', ''))) <= 100) score += 20;
  return score;
}

export default function StudyBuddyPage() {
  const addToast = useNotificationStore((state) => state.addToast);
  const [request, setRequest] = useState(defaultRequest);
  const [savedRequests, setSavedRequests] = useState(loadRequests);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRequests));
  }, [savedRequests]);

  const matches = useMemo(() => (
    seedBuddies
      .map((buddy) => ({ ...buddy, score: scoreBuddy(request, buddy) }))
      .filter((buddy) => buddy.score > 0)
      .sort((a, b) => b.score - a.score)
  ), [request]);

  const updateRequest = (field) => (event) => setRequest((current) => ({ ...current, [field]: event.target.value }));

  const openRequests = useMemo(() => savedRequests.map((item) => ({
    ...item,
    name: 'You',
    score: 100,
  })), [savedRequests]);

  const saveRequest = (event) => {
    event.preventDefault();
    if (!request.subject.trim() || !request.slot) {
      addToast('Add subject and available time first.', 'error');
      return;
    }

    setSavedRequests((current) => [{
      ...request,
      id: crypto.randomUUID(),
      subject: request.subject.trim(),
      goal: request.goal.trim(),
      createdAt: new Date().toISOString(),
    }, ...current]);
    setRequest(defaultRequest);
    addToast('Study buddy request posted.', 'success');
  };

  const deleteRequest = (requestId) => {
    setSavedRequests((current) => current.filter((item) => item.id !== requestId));
    addToast('Study buddy request closed.', 'info');
  };

  return (
    <section className="page stack study-buddy-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/study-buddy</h1>
          <p className="muted">Pick a subject and time to find classmates studying the same thing.</p>
        </div>
      </div>

      <div className="study-buddy-layout">
        <Card className="study-request-card">
          <form onSubmit={saveRequest}>
            <Input label="Subject" icon={BookOpen} value={request.subject} placeholder="DSA, DBMS, Maths..." onChange={updateRequest('subject')} />
            <Input label="Available time" icon={Clock} type="time" value={request.slot} onChange={updateRequest('slot')} />
            <label className="field">
              <span>Mode</span>
              <select className="todo-select" value={request.mode} onChange={updateRequest('mode')}>
                <option>Library</option>
                <option>Canteen</option>
                <option>Online</option>
                <option>Lab</option>
              </select>
            </label>
            <Input label="Goal" value={request.goal} placeholder="What do you want to finish?" onChange={updateRequest('goal')} />
            <Button type="submit" icon={Plus}>Post request</Button>
          </form>
        </Card>

        <div className="study-results stack">
          <div className="study-match-banner glass-card">
            <Sparkles size={22} aria-hidden="true" />
            <div>
              <strong>{matches.length || seedBuddies.length} possible buddies</strong>
              <span>{request.subject ? 'Sorted by best match' : 'Enter a subject to rank matches'}</span>
            </div>
          </div>

          <div className="study-match-grid">
            {(matches.length ? matches : seedBuddies.map((buddy) => ({ ...buddy, score: 0 }))).map((buddy) => (
              <Card key={buddy.id} hover className="study-match-card">
                <div className="study-avatar" aria-hidden="true">{buddy.name.slice(0, 1)}</div>
                <div>
                  <h2>{buddy.name}</h2>
                  <p>{buddy.goal}</p>
                  <div className="todo-meta">
                    <span><BookOpen size={15} aria-hidden="true" /> {buddy.subject}</span>
                    <span><Clock size={15} aria-hidden="true" /> {buddy.slot}</span>
                    <span><MapPin size={15} aria-hidden="true" /> {buddy.mode}</span>
                  </div>
                </div>
                <strong className="study-score">{buddy.score ? `${buddy.score}%` : 'New'}</strong>
              </Card>
            ))}
          </div>

          <Card className="study-posted">
            <h2><UsersRound size={20} aria-hidden="true" /> Open requests</h2>
            {openRequests.length ? (
              <div className="study-open-list">
                {openRequests.map((item) => (
                  <article key={item.id} className="study-open-request">
                    <div>
                      <strong>{item.subject}</strong>
                      <p>{item.goal || 'Open study session'}</p>
                      <div className="todo-meta">
                        <span><Clock size={15} aria-hidden="true" /> {item.slot}</span>
                        <span><MapPin size={15} aria-hidden="true" /> {item.mode}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={Trash2} aria-label="Close request" onClick={() => deleteRequest(item.id)} />
                  </article>
                ))}
              </div>
            ) : (
              <p>No open requests yet. Post one to make it visible here.</p>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
