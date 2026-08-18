import { Avatar } from '@/components/ui/Avatar.jsx';

export function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <aside className="conversation-list">
      {conversations.map((conversation) => (
        <button key={conversation.id} type="button" className={activeId === conversation.id ? 'active' : ''} onClick={() => onSelect(conversation.id)}>
          <Avatar fallback={conversation.name} online={conversation.online} />
          <span>
            <strong>{conversation.name}</strong>
            <small>{conversation.last_message}</small>
          </span>
          <em>{conversation.unread || ''}</em>
        </button>
      ))}
    </aside>
  );
}
