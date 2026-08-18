import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatWindow } from '@/components/features/connect/ChatWindow.jsx';
import { ConversationList } from '@/components/features/connect/ConversationList.jsx';
import { useConversations, useMessages } from '@/hooks/useCampusData.js';
import { useRealtimeInvalidation } from '@/hooks/useRealtimeInvalidation.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function ConnectPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data: conversations = [] } = useConversations();
  const [activeId, setActiveId] = useState(chatId ?? conversations[0]?.id ?? 'c1');
  const { data: chatMessages = [] } = useMessages(activeId);
  const active = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const messageKeys = useMemo(() => [['messages', activeId], ['conversations']], [activeId]);
  useRealtimeInvalidation('messages', messageKeys, activeId ? `conversation_id=eq.${activeId}` : undefined);

  useEffect(() => {
    if (chatId && chatId !== activeId) setActiveId(chatId);
  }, [activeId, chatId]);

  useEffect(() => {
    if (!chatId && activeId) navigate(`/dashboard/connect/${activeId}`, { replace: true });
  }, [activeId, chatId, navigate]);

  function selectConversation(id) {
    setActiveId(id);
    navigate(`/dashboard/connect/${id}`);
  }

  function sendDemoMessage(body) {
    const message = { id: crypto.randomUUID(), mine: true, body, time: 'now' };
    queryClient.setQueryData(['messages', activeId], (existing = []) => [...existing, message]);
    addToast('Message added locally. Live encrypted send needs recipient keys connected.', 'info');
  }

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Connect</p>
          <h1 className="page-title">Encrypted messaging</h1>
        </div>
      </div>
      <div className="connect-layout glass-card">
        <ConversationList conversations={conversations} activeId={activeId} onSelect={selectConversation} />
        <ChatWindow messages={chatMessages} title={active?.name} onSend={sendDemoMessage} />
      </div>
    </section>
  );
}
