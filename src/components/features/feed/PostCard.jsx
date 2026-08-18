import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function PostCard({ post }) {
  const author = post.author ?? {};
  const community = post.community;
  return (
    <Card hover className={post.is_pinned ? 'post-card pinned' : 'post-card'}>
      <header className="post-header">
        <Avatar fallback={author.full_name ?? 'CP'} src={author.avatar_url} />
        <div>
          <strong>{author.full_name ?? 'PCCOE Student'}</strong>
          <p className="muted">
            {author.branch ?? 'Campus'} {author.year ? `, Year ${author.year}` : ''} · {post.created_at}
          </p>
        </div>
        {post.is_pinned ? <Badge variant="info">Pinned</Badge> : null}
      </header>
      {community ? <Badge variant={community.category}>{community.name}</Badge> : null}
      <p className="post-content">{post.content}</p>
      <footer className="post-actions">
        <Button variant="ghost" icon={Heart}>{post.like_count}</Button>
        <Button variant="ghost" icon={MessageCircle}>{post.comment_count}</Button>
        <Button variant="ghost" icon={Share2}>Share</Button>
      </footer>
    </Card>
  );
}
