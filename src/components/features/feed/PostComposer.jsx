import { ImagePlus, Link, Send } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { createPost } from '@/lib/api.js';
import { currentUser } from '@/lib/constants.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export function PostComposer({ community }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);

  async function submit(event) {
    event.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      const created = await createPost({ content: value.trim(), communityId: community?.id });
      const optimisticPost = {
        ...created,
        author: currentUser,
        community,
        content: value.trim(),
        like_count: 0,
        comment_count: 0,
        created_at: 'now',
      };
      queryClient.setQueryData(['feed'], (existing = []) => [optimisticPost, ...existing]);
      if (community?.id) queryClient.invalidateQueries({ queryKey: ['communities'] });
      addToast('Post published.', 'success');
      setValue('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="composer">
      <form onSubmit={submit}>
        <textarea value={value} placeholder="Share an update with PCCOE..." onChange={(event) => setValue(event.target.value)} />
        <footer className="cluster">
          <Button type="button" variant="ghost" icon={ImagePlus}>Image</Button>
          <Button type="button" variant="ghost" icon={Link}>Link</Button>
          <Button type="submit" icon={Send} disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</Button>
        </footer>
      </form>
    </Card>
  );
}
