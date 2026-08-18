import { Flag, MessageCircle, Triangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function XDPostCard({ post, onVote, onReport }) {
  return (
    <Card hover className="xd-card">
      <header>
        <strong>Anonymous</strong>
        <Badge variant="danger">{post.category}</Badge>
      </header>
      <p>{post.content}</p>
      <footer className="post-actions">
        <Button variant="ghost" icon={Triangle} onClick={onVote}>{post.vote_count}</Button>
        <Button variant="ghost" icon={MessageCircle}>{post.comment_count}</Button>
        <Button variant="ghost" icon={Flag} onClick={onReport}>Report</Button>
        <span className="muted">{post.created_at}</span>
      </footer>
    </Card>
  );
}
