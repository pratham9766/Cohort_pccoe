import { Paperclip, Send, Smile } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.jsx';
import { messages as fallbackMessages } from '@/lib/constants.js';

export function ChatWindow({ messages = fallbackMessages, title = 'GDGC Core Team', onSend }) {
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
        <span className="muted">E2E encrypted · online</span>
      </header>
      <div className="message-thread">
        {messages.map((message) => (
          <article key={message.id} className={message.mine ? 'message mine' : 'message'}>
            <p>{message.body ?? '[Encrypted payload ready for client decrypt]'}</p>
            <time>{message.time ?? 'now'}</time>
          </article>
        ))}
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
