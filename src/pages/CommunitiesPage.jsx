import { Bell, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CommunityCard } from '@/components/features/communities/CommunityCard.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { useCommunities } from '@/hooks/useCampusData.js';
import { toggleCommunitySubscription } from '@/lib/api.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Social', 'Academic'];

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data = [] } = useCommunities();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => data.filter((item) => (category === 'All' || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase())), [category, data, query]);

  async function toggleSubscription(community) {
    const nextSubscribed = !community.subscribed;
    queryClient.setQueryData(['communities'], (existing = []) =>
      existing.map((item) =>
        item.id === community.id
          ? {
              ...item,
              subscribed: nextSubscribed,
              member_count: Math.max(0, item.member_count + (nextSubscribed ? 1 : -1)),
            }
          : item,
      ),
    );

    try {
      await toggleCommunitySubscription(community.id);
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      addToast(nextSubscribed ? `Subscribed to ${community.name}.` : `Unsubscribed from ${community.name}.`, 'success');
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      addToast(error.message, 'error');
    }
  }

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/communities</h1>
          <p className="muted">Join discussions and connect with your peers.</p>
        </div>
        <label className="department-filter">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>Department:</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item === 'All' ? 'All Departments' : item}</option>)}
          </select>
        </label>
      </div>
      <div className="community-section-head">
        <h2>Student Development and Welfare (SDW)</h2>
        <Button variant="ghost" icon={Bell}>Subscribe All</Button>
      </div>
      <input className="sr-only" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search communities" />
      <div className="community-grid-original">
        {filtered.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onOpen={() => navigate(`/dashboard/communities/${community.slug}`)}
            onToggle={() => toggleSubscription(community)}
          />
        ))}
      </div>
    </section>
  );
}
