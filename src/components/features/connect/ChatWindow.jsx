import { Paperclip, Send, Smile } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.jsx';

export function ChatWindow({ messages = [], title = 'Conversation', onSend }) {
  const [draft, setDraft] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend?.(draft.trim());
    setDraft('');
  }

  return (
    <section className="chat-window glass-card">
      <header>
        <strong>{title}</strong>
        <span className="muted">Private conversation</span>
      </header>
      <div className="message-thread">
        {messages.map((message) => (
          <article key={message.id} className={message.mine ? 'message mine' : 'message'}>
            <p>{message.body ?? message.content ?? '[Encrypted message]'}</p>
            <time>{message.time ?? message.created_at ?? 'now'}</time>
          </article>
        ))}
        {!messages.length ? <p className="muted">No messages yet.</p> : null}
      </div>
      <form className="chat-input" onSubmit={submit}>
        <Button variant="ghost" icon={Smile} aria-label="Emoji" />
        <Button variant="ghost" icon={Paperclip} aria-label="Attach file" />
        <input value={draft} placeholder="Message privately..." onChange={(event) => setDraft(event.target.value)} />
        <Button type="submit" icon={Send} aria-label="Send message" />
      </form>
    </section>
  );
}
