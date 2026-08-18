import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PostCard } from '@/components/features/feed/PostCard.jsx';
import { PostComposer } from '@/components/features/feed/PostComposer.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useCommunities, useFeed } from '@/hooks/useCampusData.js';
import { toggleCommunitySubscription } from '@/lib/api.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function CommunityDetailPage() {
  const { communityId } = useParams();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data: communities = [], isLoading, error } = useCommunities();
  const { data: posts = [] } = useFeed();
  const community = communities.find((item) => item.slug === communityId || item.id === communityId);
  const communityPosts = community ? posts.filter((post) => post.community_id === community.id || post.community?.id === community.id || post.community?.slug === community.slug) : [];

  async function toggleSubscription() {
    try {
      await toggleCommunitySubscription(community.id);
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      addToast(`${community.subscribed ? 'Unsubscribed from' : 'Subscribed to'} ${community.name}.`, 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  }

  if (isLoading) {
    return (
      <section className="page stack">
        <Card><p className="muted">Loading community...</p></Card>
      </section>
    );
  }

  if (error || !community) {
    return (
      <section className="page stack">
        <Card><p className="muted">{error?.message ?? 'Community not found.'}</p></Card>
      </section>
    );
  }

  return (
    <section className="page stack">
      <Card className="community-detail">
        <div className="community-cover" />
        <div className="cluster">
          <div className="community-logo">{community.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h1>{community.name}</h1>
            <p className="muted">{community.member_count} members · {community.post_count} posts</p>
          </div>
          <Badge variant={community.category}>{community.category}</Badge>
          <Button onClick={toggleSubscription}>{community.subscribed ? 'Unsubscribe' : 'Subscribe'}</Button>
        </div>
        <p>{community.description}</p>
      </Card>
      <PostComposer community={community} />
      {communityPosts.map((post) => <PostCard key={post.id} post={post} />)}
      {!communityPosts.length ? <Card><p className="muted">No posts yet. Admin announcements will appear here.</p></Card> : null}
    </section>
  );
}
