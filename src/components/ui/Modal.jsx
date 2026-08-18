import { X } from 'lucide-react';
import { Button } from './Button.jsx';

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal glass-elevated" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" icon={X} aria-label="Close modal" onClick={onClose} />
        </header>
        {children}
      </div>
    </div>
  );
}
