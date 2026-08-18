INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', false),
  ('community-assets', 'community-assets', false),
  ('post-media', 'post-media', false),
  ('message-files', 'message-files', false),
  ('xd-media', 'xd-media', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images readable by authenticated users"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Community assets readable by authenticated users"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-assets');

CREATE POLICY "Post media readable by authenticated users"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-media');

CREATE POLICY "Authors can upload post media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "XD media readable by authenticated users"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'xd-media');

CREATE POLICY "Authors can upload XD media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'xd-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE VIEW public.xd_public_posts AS
SELECT
  id,
  content,
  category,
  media_urls,
  vote_count,
  comment_count,
  is_flagged,
  created_at,
  updated_at
FROM public.xd_posts
WHERE is_removed = false;

CREATE OR REPLACE FUNCTION public.search_users(query TEXT)
RETURNS SETOF public.users AS $$
  SELECT *
  FROM public.users
  WHERE to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(username, '') || ' ' || coalesce(bio, ''))
    @@ plainto_tsquery('english', query)
  LIMIT 5;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.search_communities(query TEXT)
RETURNS SETOF public.communities AS $$
  SELECT *
  FROM public.communities
  WHERE is_active = true
    AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    @@ plainto_tsquery('english', query)
  LIMIT 5;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.search_posts(query TEXT)
RETURNS SETOF public.posts AS $$
  SELECT *
  FROM public.posts
  WHERE deleted_at IS NULL
    AND to_tsvector('english', content) @@ plainto_tsquery('english', query)
  ORDER BY created_at DESC
  LIMIT 8;
$$ LANGUAGE sql STABLE;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.xd_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
