import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

type Feed = {
  source: string;
  category: string;
  url: string;
};

type NewsItem = {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  published_at: string | null;
  fetched_at: string;
};

const feeds: Feed[] = [
  { source: 'Hacker News', category: 'Startups', url: 'https://hnrss.org/frontpage' },
  { source: 'The GitHub Blog', category: 'DevTools', url: 'https://github.blog/feed/' },
  { source: 'Vercel Blog', category: 'Web', url: 'https://vercel.com/atom' },
  { source: 'Supabase Blog', category: 'Backend', url: 'https://supabase.com/feed.xml' },
  { source: 'Google AI Blog', category: 'AI', url: 'https://blog.google/technology/ai/rss/' },
];

function decodeEntities(value: string) {
  return value
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/<[^>]*>/g, '')
    .trim();
}

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeEntities(match[1]) : '';
}

function getLink(block: string) {
  const direct = getTag(block, 'link');
  if (direct) return direct;
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  return href ? decodeEntities(href[1]) : '';
}

function getPublishedAt(block: string) {
  const raw = getTag(block, 'pubDate') || getTag(block, 'updated') || getTag(block, 'published');
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function parseFeed(xml: string, feed: Feed): NewsItem[] {
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const fetchedAt = new Date().toISOString();

  return blocks.slice(0, 8).map((block) => ({
    title: getTag(block, 'title'),
    summary: getTag(block, 'description') || getTag(block, 'summary') || getTag(block, 'content'),
    source: feed.source,
    url: getLink(block),
    category: feed.category,
    published_at: getPublishedAt(block),
    fetched_at: fetchedAt,
  })).filter((item) => item.title && item.url);
}

Deno.serve(async (request) => {
  const scraperSecret = Deno.env.get('TECH_NEWS_SCRAPER_SECRET');
  if (scraperSecret && request.headers.get('x-scraper-secret') !== scraperSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service configuration' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const articles: NewsItem[] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, { headers: { 'user-agent': 'Cohort PCCOE Tech News Scraper' } });
      if (!response.ok) continue;
      articles.push(...parseFeed(await response.text(), feed));
    } catch (_error) {
      // Continue with the remaining feeds if one source is temporarily unavailable.
    }
  }

  const { error } = await supabase
    .from('tech_news')
    .upsert(articles, { onConflict: 'url' });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ inserted: articles.length }), {
    headers: { 'content-type': 'application/json' },
  });
});
