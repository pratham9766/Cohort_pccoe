import { ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';
import { useTechNews } from '@/hooks/useCampusData.js';

function formatDate(value) {
  if (!value || value === 'Today') return 'Today';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TechNewsSection() {
  const { data: news = [], isLoading, error, refetch, isFetching } = useTechNews();

  return (
    <Card className="tech-news-section">
      <header>
        <div>
          <h2><Newspaper size={20} aria-hidden="true" /> Daily Tech News</h2>
          <p className="muted">Scraped daily updates for AI, web, startups, and backend builders.</p>
        </div>
        <button type="button" onClick={() => refetch()} aria-label="Refresh tech news">
          <RefreshCw size={17} aria-hidden="true" className={isFetching ? 'spinning' : ''} />
        </button>
      </header>

      {isLoading ? <p className="muted">Loading technology updates...</p> : null}
      {error ? <p className="muted">{error.message}</p> : null}

      <div className="tech-news-list">
        {news.slice(0, 5).map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="tech-news-item">
            <span>{item.category ?? 'Tech'}</span>
            <strong>{item.title}</strong>
            <p>{item.summary}</p>
            <small>{item.source} · {formatDate(item.published_at)}</small>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
      </div>

      {!isLoading && !news.length ? <p className="muted">No tech news yet. Run the scraper to populate updates.</p> : null}
    </Card>
  );
}
