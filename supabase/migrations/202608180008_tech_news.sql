CREATE TABLE IF NOT EXISTS public.tech_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Tech',
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tech_news_published
ON public.tech_news(published_at DESC NULLS LAST, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_tech_news_category
ON public.tech_news(category);

ALTER TABLE public.tech_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tech news visible to authenticated users"
ON public.tech_news FOR SELECT TO authenticated
USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tech_news;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
