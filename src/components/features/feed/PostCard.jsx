import { Heart, MessageCircle, Send, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { createComment, deleteComment, deletePost, getComments, togglePostLike } from '@/lib/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export function PostCard({ post }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const addToast = useNotificationStore((state) => state.addToast);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const author = post.author ?? {};
  const community = post.community;
  const canManagePost = user?.id && user.id === post.author_id;
  const commentsQuery = useQuery({
    queryKey: ['comments', post.id],
    enabled: commentsOpen,
    queryFn: () => getComments(post.id),
  });

  async function like() {
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!liked);
    setLikeCount((count) => Math.max(0, count + (liked ? -1 : 1)));
    try {
      const result = await togglePostLike(post.id);
      setLiked(result.liked);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      addToast(error.message, 'error');
    }
  }

  async function removePost() {
    try {
      await deletePost(post.id);
      queryClient.setQueryData(['feed'], (existing = []) => existing.filter((item) => item.id !== post.id));
      addToast('Post deleted.', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!commentDraft.trim()) return;
    setSubmittingComment(true);
    try {
      const created = await createComment({ postId: post.id, content: commentDraft.trim() });
      queryClient.setQueryData(['comments', post.id], (existing = []) => [...existing, created]);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setCommentDraft('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function removeComment(commentId) {
    try {
      await deleteComment(commentId);
      queryClient.setQueryData(['comments', post.id], (existing = []) => existing.filter((comment) => comment.id !== commentId));
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (error) {
      addToast(error.message, 'error');
    }
  }

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
        <Button variant="ghost" icon={Heart} onClick={like}>{likeCount}</Button>
        <Button variant="ghost" icon={MessageCircle} onClick={() => setCommentsOpen((open) => !open)}>{post.comment_count}</Button>
        <Button variant="ghost" icon={Share2}>Share</Button>
        {canManagePost ? <Button variant="ghost" icon={Trash2} onClick={removePost}>Delete</Button> : null}
      </footer>
      {commentsOpen ? (
        <section className="comments-panel stack">
          {commentsQuery.isLoading ? <p className="muted">Loading comments...</p> : null}
          {commentsQuery.error ? <p className="muted">{commentsQuery.error.message}</p> : null}
          {(commentsQuery.data ?? []).map((comment) => (
            <article key={comment.id} className="comment-row">
              <Avatar fallback={comment.author?.full_name ?? 'CP'} src={comment.author?.avatar_url} size="sm" />
              <div>
                <strong>{comment.author?.full_name ?? 'PCCOE Student'}</strong>
                <p>{comment.content}</p>
              </div>
              {comment.author_id === user?.id ? <Button variant="ghost" icon={Trash2} aria-label="Delete comment" onClick={() => removeComment(comment.id)} /> : null}
            </article>
          ))}
          {commentsQuery.data?.length === 0 ? <p className="muted">No comments yet.</p> : null}
          <form className="comment-form" onSubmit={submitComment}>
            <input value={commentDraft} placeholder="Write a comment..." onChange={(event) => setCommentDraft(event.target.value)} />
            <Button type="submit" icon={Send} disabled={submittingComment || !commentDraft.trim()}>{submittingComment ? 'Sending...' : 'Comment'}</Button>
          </form>
        </section>
      ) : null}
    </Card>
  );
}
