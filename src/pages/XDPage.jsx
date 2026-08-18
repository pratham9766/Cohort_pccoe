import { useState } from 'react';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { XDPostCard } from '@/components/features/xd/XDPostCard.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useXDPosts } from '@/hooks/useCampusData.js';
import { useRealtimeInvalidation } from '@/hooks/useRealtimeInvalidation.js';
import { createXDPost, toggleXDVote } from '@/lib/api.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function XDPage() {
  const queryClient = useQueryClient();
  const { data = [] } = useXDPosts();
  const [sort, setSort] = useState('Hot');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const addToast = useNotificationStore((state) => state.addToast);
  const xdKeys = useMemo(() => [['xd-posts']], []);
  useRealtimeInvalidation('xd_posts', xdKeys);

  const sortedPosts = useMemo(() => {
    const copy = [...data];
    if (sort === 'New') return copy.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return copy.sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  }, [data, sort]);

  async function submitPost() {
    if (!content.trim()) return;
    try {
      const created = await createXDPost({ content: content.trim(), category });
      queryClient.setQueryData(['xd-posts'], (existing = []) => [{ ...created, vote_count: 0, comment_count: 0, created_at: 'now' }, ...existing]);
      addToast('Posted anonymously.', 'success');
      setContent('');
      setCategory('General');
    } catch (error) {
      addToast(error.message, 'error');
    }
  }

  async function vote(post) {
    queryClient.setQueryData(['xd-posts'], (existing = []) => existing.map((item) => (item.id === post.id ? { ...item, vote_count: (item.vote_count ?? 0) + 1 } : item)));
    try {
      await toggleXDVote(post.id);
      queryClient.invalidateQueries({ queryKey: ['xd-posts'] });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['xd-posts'] });
      addToast(error.message, 'error');
    }
  }

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">XD Board</p>
          <h1 className="page-title">Anonymous exchange</h1>
        </div>
      </div>
      <Card className="composer">
        <textarea value={content} placeholder="What's on your mind? Post anonymously..." onChange={(event) => setContent(event.target.value)} />
        <div className="cluster">
          {['General', 'Tips', 'Ideas', 'Rants', 'Opportunities', 'Memes'].map((item) => (
            <Button key={item} variant={category === item ? 'primary' : 'ghost'} onClick={() => setCategory(item)}>{item}</Button>
          ))}
        </div>
        <Button onClick={submitPost}>Post Anonymously</Button>
      </Card>
      <div className="cluster">
        {['Hot', 'New', 'Top'].map((item) => <Button key={item} variant={sort === item ? 'primary' : 'ghost'} onClick={() => setSort(item)}>{item}</Button>)}
      </div>
      {sortedPosts.map((post) => <XDPostCard key={post.id} post={post} onVote={() => vote(post)} onReport={() => addToast('Report queued for moderation.', 'info')} />)}
    </section>
  );
}
