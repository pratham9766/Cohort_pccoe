CREATE TABLE IF NOT EXISTS public.arcade_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL CHECK (game_key IN ('campus-arcade')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  matches INTEGER NOT NULL DEFAULT 0 CHECK (matches >= 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campus_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'event' CHECK (alert_type IN ('urgent', 'event', 'safety', 'info')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arcade_scores_leaderboard
ON public.arcade_scores(game_key, score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_arcade_scores_user
ON public.arcade_scores(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campus_alerts_visible
ON public.campus_alerts(is_published, starts_at DESC);

ALTER TABLE public.arcade_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arcade leaderboard visible to authenticated users"
ON public.arcade_scores FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can save own arcade scores"
ON public.arcade_scores FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own arcade scores"
ON public.arcade_scores FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Published campus alerts visible to authenticated users"
ON public.campus_alerts FOR SELECT TO authenticated
USING (
  is_published = TRUE
  AND starts_at <= NOW()
  AND (ends_at IS NULL OR ends_at >= NOW())
);

CREATE POLICY "Platform admins can publish campus alerts"
ON public.campus_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id AND public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update campus alerts"
ON public.campus_alerts FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete campus alerts"
ON public.campus_alerts FOR DELETE TO authenticated
USING (public.is_platform_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_campus_alerts_updated_at ON public.campus_alerts;
CREATE TRIGGER update_campus_alerts_updated_at
BEFORE UPDATE ON public.campus_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_alerts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
