import { Flag, MessageCircle, Triangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function XDPostCard({ post, tags = [], onVote, onReport }) {
  return (
    <Card hover className="xd-card">
      <header className="xd-card-header">
        <div className="xd-avatar" aria-hidden="true">{post.avatar ?? 'XD'}</div>
        <div>
          <strong>{post.persona ?? 'Anonymous'}</strong>
          <p className="muted">{post.handle ?? '@anonymous'} · {post.created_at}</p>
        </div>
        <Badge variant={post.category === 'Memes' ? 'warning' : 'danger'}>{post.category}</Badge>
      </header>
      {post.media_text ? (
        <div className={`xd-media xd-media-${post.media_type ?? 'note'}`}>
          <span>{post.media_type ?? 'post'}</span>
          <strong>{post.media_text}</strong>
        </div>
      ) : null}
      <p>{post.content}</p>
      <div className="xd-card-tags">
        {tags.slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
      </div>
      <footer className="post-actions">
        <Button variant="ghost" icon={Triangle} onClick={onVote}>{post.vote_count}</Button>
        <Button variant="ghost" icon={MessageCircle}>{post.comment_count}</Button>
        <Button variant="ghost" icon={Flag} onClick={onReport}>Report</Button>
      </footer>
    </Card>
  );
}
