import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatWindow } from '@/components/features/connect/ChatWindow.jsx';
import { ConversationList } from '@/components/features/connect/ConversationList.jsx';
import { useConversations, useMessages } from '@/hooks/useCampusData.js';
import { useRealtimeInvalidation } from '@/hooks/useRealtimeInvalidation.js';
import { sendMessage } from '@/lib/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function ConnectPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data: conversations = [] } = useConversations();
  const [activeId, setActiveId] = useState(chatId ?? null);
  const { data: chatMessages = [] } = useMessages(activeId);
  const renderedMessages = useMemo(() => chatMessages.map((message) => ({ ...message, mine: message.sender_id === user?.id })), [chatMessages, user?.id]);
  const active = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const messageKeys = useMemo(() => [['messages', activeId], ['conversations']], [activeId]);
  useRealtimeInvalidation('messages', messageKeys, activeId ? `conversation_id=eq.${activeId}` : undefined);

  useEffect(() => {
    if (chatId && chatId !== activeId) setActiveId(chatId);
  }, [activeId, chatId]);

  useEffect(() => {
    if (!activeId && conversations[0]?.id) {
      setActiveId(conversations[0].id);
      return;
    }
    if (!chatId && activeId) navigate(`/dashboard/connect/${activeId}`, { replace: true });
  }, [activeId, chatId, conversations, navigate]);

  function selectConversation(id) {
    setActiveId(id);
    navigate(`/dashboard/connect/${id}`);
  }

  async function sendConversationMessage(body) {
    if (!activeId) return;
    const pendingId = crypto.randomUUID();
    const pending = { id: pendingId, mine: true, content: body, created_at: 'sending...' };
    queryClient.setQueryData(['messages', activeId], (existing = []) => [...existing, pending]);
    try {
      await sendMessage({ conversationId: activeId, content: body });
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      queryClient.setQueryData(['messages', activeId], (existing = []) => existing.filter((message) => message.id !== pendingId));
      addToast(error.message, 'error');
    }
  }

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/connect</h1>
          <p className="muted">Private chats for cohort users.</p>
        </div>
      </div>
      <div className="connect-layout glass-card">
        <ConversationList conversations={conversations} activeId={activeId} onSelect={selectConversation} />
        <ChatWindow messages={renderedMessages} title={active?.name} onSend={sendConversationMessage} />
      </div>
    </section>
  );
}
