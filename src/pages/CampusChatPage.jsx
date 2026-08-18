import { Megaphone, Radio, Send, Trash2, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useCampusChatMessages } from '@/hooks/useCampusData.js';
import { useRealtimeInvalidation } from '@/hooks/useRealtimeInvalidation.js';
import { deleteCampusChatMessage, sendCampusChatMessage } from '@/lib/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

function formatChatTime(value) {
  if (!value || value === 'now') return 'now';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function CampusChatPage() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);
  const { data: messages = [], isLoading } = useCampusChatMessages();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messageKeys = useMemo(() => [['campus-chat-messages']], []);

  useRealtimeInvalidation('campus_chat_messages', messageKeys);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    const pendingId = crypto.randomUUID();
    const pendingMessage = {
      id: pendingId,
      sender_id: user?.id,
      content,
      created_at: 'now',
      sender: user,
    };

    setDraft('');
    setSending(true);
    queryClient.setQueryData(['campus-chat-messages'], (existing = []) => [...existing, pendingMessage]);

    try {
      await sendCampusChatMessage(content);
      queryClient.invalidateQueries({ queryKey: ['campus-chat-messages'] });
    } catch (error) {
      queryClient.setQueryData(['campus-chat-messages'], (existing = []) =>
        existing.filter((message) => message.id !== pendingId),
      );
      addToast(error.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const removeMessage = async (messageId) => {
    queryClient.setQueryData(['campus-chat-messages'], (existing = []) =>
      existing.filter((message) => message.id !== messageId),
    );
    try {
      await deleteCampusChatMessage(messageId);
      queryClient.invalidateQueries({ queryKey: ['campus-chat-messages'] });
    } catch (error) {
      addToast(error.message, 'error');
      queryClient.invalidateQueries({ queryKey: ['campus-chat-messages'] });
    }
  };

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/campus-chat</h1>
          <p className="muted">A live room for everyone on Cohort.</p>
        </div>
      </div>

      <div className="campus-chat-layout">
        <Card className="campus-chat-window">
          <header className="campus-chat-header">
            <div>
              <span className="campus-chat-icon"><Radio size={20} aria-hidden="true" /></span>
              <div>
                <strong>Global Campus Chat</strong>
                <small>Visible to signed-in PCCOE students</small>
              </div>
            </div>
            <span className="campus-chat-live">Live</span>
          </header>

          <div className="campus-chat-thread">
            {isLoading ? <p className="muted">Loading campus chat...</p> : null}
            {!isLoading && !messages.length ? <p className="muted">No campus messages yet. Start the room.</p> : null}
            {messages.map((message) => {
              const mine = message.sender_id === user?.id;
              return (
                <article key={message.id} className={`campus-chat-message ${mine ? 'mine' : ''}`}>
                  <Avatar src={message.sender?.avatar_url} fallback={message.sender?.full_name ?? 'CP'} size="sm" />
                  <div>
                    <header>
                      <strong>{message.sender?.full_name ?? 'Cohort Student'}</strong>
                      <time>{formatChatTime(message.created_at)}</time>
                      {mine ? (
                        <button type="button" aria-label="Delete message" onClick={() => removeMessage(message.id)}>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      ) : null}
                    </header>
                    <p>{message.content}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <form className="campus-chat-composer" onSubmit={sendMessage}>
            <input
              value={draft}
              maxLength={500}
              placeholder="Message the campus..."
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" icon={Send} disabled={!draft.trim() || sending}>
              Send
            </Button>
          </form>
        </Card>

        <aside className="campus-chat-rail stack">
          <Card>
            <Megaphone size={22} aria-hidden="true" />
            <strong>Campus-wide</strong>
            <p className="muted">Use this room for quick questions, club updates, event reminders, and lost-and-found pings.</p>
          </Card>
          <Card>
            <UsersRound size={22} aria-hidden="true" />
            <strong>Respect-first</strong>
            <p className="muted">Messages are linked to your profile. Keep private chats in Connect.</p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
