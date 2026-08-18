import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communities, posts } from '@/lib/constants.js';
import { Input } from '@/components/ui/Input.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useUiStore } from '@/stores/uiStore.js';

export function SearchModal() {
  const navigate = useNavigate();
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [
      ...communities.filter((item) => item.name.toLowerCase().includes(q)).map((item) => ({ label: item.name, type: 'Community', to: `/dashboard/communities/${item.slug}` })),
      ...posts.filter((item) => item.content.toLowerCase().includes(q)).map((item) => ({ label: item.content, type: 'Post', to: '/dashboard' })),
    ].slice(0, 8);
  }, [query]);

  function openResult(to) {
    setOpen(false);
    navigate(to);
  }

  return (
    <Modal open={open} title="Search Campus" onClose={() => setOpen(false)}>
      <div className="stack">
        <Input icon={Search} value={query} placeholder="Search people, communities, posts" autoFocus onChange={(event) => setQuery(event.target.value)} />
        <div className="search-results">
          {results.map((result) => (
            <button key={`${result.type}-${result.label}`} type="button" onClick={() => openResult(result.to)}>
              <small>{result.type}</small>
              <span>{result.label}</span>
            </button>
          ))}
          {query && !results.length ? <p className="muted">No matches found.</p> : null}
        </div>
      </div>
    </Modal>
  );
}
