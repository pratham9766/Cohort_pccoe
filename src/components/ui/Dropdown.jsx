import { useState } from 'react';

export function Dropdown({ trigger, items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown">
      <button type="button" className="dropdown-trigger" onClick={() => setOpen((value) => !value)}>
        {trigger}
      </button>
      {open ? (
        <div className="dropdown-menu glass-elevated">
          {items.map((item) => (
            <button key={item.label} type="button" onClick={item.onClick}>
              {item.icon ? <item.icon size={16} aria-hidden="true" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
