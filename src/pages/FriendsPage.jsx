import { MessageCircle, Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useCampusPeople } from '@/hooks/useCampusData.js';

export default function FriendsPage() {
  const { data: people = [], isLoading, error } = useCampusPeople();
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('All');

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesQuery = !normalizedQuery
        || [person.full_name, person.username, person.branch, person.bio, ...(person.skills ?? []), ...(person.interests ?? [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesYear = year === 'All' || String(person.year ?? 'Faculty') === year;
      return matchesQuery && matchesYear;
    });
  }, [people, query, year]);

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/friends</h1>
          <p className="muted">Find people across PCCOE, follow their work, and start conversations.</p>
        </div>
      </div>

      <Card className="friends-toolbar">
        <label className="friends-search">
          <Search size={18} aria-hidden="true" />
          <input value={query} placeholder="Search people, branch, skills..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="All">All years</option>
          <option value="1">First year</option>
          <option value="2">Second year</option>
          <option value="3">Third year</option>
          <option value="4">Fourth year</option>
          <option value="Faculty">Faculty</option>
        </select>
      </Card>

      {isLoading ? <p className="muted">Loading people...</p> : null}
      {error ? <p className="muted">{error.message}</p> : null}

      <div className="friends-grid">
        {filteredPeople.map((person) => (
          <Card key={person.id} hover className="friend-card">
            <header>
              <Avatar src={person.avatar_url} fallback={person.full_name ?? 'CP'} online={person.online} />
              <div>
                <h2>{person.full_name}</h2>
                <p className="muted">@{person.username ?? person.full_name?.toLowerCase().replaceAll(' ', '')}</p>
              </div>
            </header>
            <p className="friend-meta">{person.branch ?? 'PCCOE'} {person.year ? `· Year ${person.year}` : ''}</p>
            <p className="muted">{person.bio ?? 'Campus member on Cohort PCCOE.'}</p>
            <div className="friend-tags">
              {(person.skills ?? person.interests ?? []).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <footer>
              <Button as={Link} to={`/dashboard/profile/${person.id}`} variant="ghost" icon={UserPlus}>View</Button>
              <Button as={Link} to="/dashboard/connect" icon={MessageCircle}>Message</Button>
            </footer>
          </Card>
        ))}
      </div>

      {!isLoading && !filteredPeople.length ? <Card><p className="muted">No people found. Try another search.</p></Card> : null}
    </section>
  );
}
