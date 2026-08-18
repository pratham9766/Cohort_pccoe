import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CommunityCard } from '@/components/features/communities/CommunityCard.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
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
          <p className="eyebrow">Communities</p>
          <h1 className="page-title">Find your campus circle</h1>
        </div>
      </div>
      <Input icon={Search} placeholder="Search clubs and organizations" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="cluster">
        {categories.map((item) => <Button key={item} variant={category === item ? 'primary' : 'ghost'} onClick={() => setCategory(item)}>{item}</Button>)}
      </div>
      <div className="grid three">
        {filtered.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onOpen={() => navigate(`/communities/${community.slug}`)}
            onToggle={() => toggleSubscription(community)}
          />
        ))}
      </div>
    </section>
  );
}
