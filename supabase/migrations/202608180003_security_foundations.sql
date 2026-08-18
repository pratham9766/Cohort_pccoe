CREATE OR REPLACE FUNCTION public.is_allowed_institutional_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN lower(coalesce(email, '')) ~ '^[^@]+@(pccoe\.org|pccoepune\.org)$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
      AND role IN ('admin', 'platform_admin', 'moderator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('student', 'community_admin', 'moderator', 'platform_admin', 'faculty', 'alumni', 'admin'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

CREATE OR REPLACE FUNCTION public.validate_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_allowed_institutional_email(NEW.email) THEN
    RAISE EXCEPTION 'Only PCCOE institutional email accounts are allowed.';
  END IF;

  IF TG_OP = 'INSERT' AND NEW.role IS DISTINCT FROM 'student' THEN
    NEW.role := 'student';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'You are not allowed to change profile roles.';
  END IF;

  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_user_profile ON public.users;
CREATE TRIGGER trg_validate_user_profile
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.validate_user_profile();

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_allowed_institutional_email(NEW.email) THEN
    RAISE EXCEPTION 'Only PCCOE institutional email accounts are allowed.';
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role, is_verified, is_onboarded)
  VALUES (
    NEW.id,
    lower(NEW.email),
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'PCCOE Student'),
    NEW.raw_user_meta_data->>'avatar_url',
    'student',
    true,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = coalesce(public.users.full_name, EXCLUDED.full_name),
    avatar_url = coalesce(public.users.avatar_url, EXCLUDED.avatar_url),
    is_verified = true,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own student profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND role = 'student' AND public.is_allowed_institutional_email(email));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND public.is_allowed_institutional_email(email));

CREATE POLICY "Authors can delete own posts"
ON public.posts FOR DELETE TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = author_id);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS content TEXT,
  ALTER COLUMN encrypted_content DROP NOT NULL,
  ALTER COLUMN nonce DROP NOT NULL;

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_members;
CREATE POLICY "Conversation creators can add initial members"
ON public.conversation_members FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = conversation_id
      AND created_by = auth.uid()
  )
);

CREATE POLICY "Conversation admins can add members"
ON public.conversation_members FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversation_members existing
    WHERE existing.conversation_id = conversation_members.conversation_id
      AND existing.user_id = auth.uid()
      AND existing.role = 'admin'
  )
);

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE public.posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_post_comment_count ON public.comments;
CREATE TRIGGER trg_post_comment_count
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('certification', 'hackathon', 'award', 'project')),
  title TEXT NOT NULL,
  issuer TEXT,
  issued_at DATE,
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'xd_post', 'xd_comment', 'user', 'message')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements visible to authenticated users"
ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own achievements"
ON public.achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
ON public.achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
ON public.achievements FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.is_platform_admin(auth.uid()));

CREATE POLICY "Moderators can update reports"
ON public.reports FOR UPDATE TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Moderators can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

GRANT SELECT ON public.xd_public_posts TO authenticated;

DROP POLICY IF EXISTS "XD posts visible to authenticated users" ON public.xd_posts;
CREATE POLICY "XD authors and moderators can view raw XD posts"
ON public.xd_posts FOR SELECT TO authenticated
USING (auth.uid() = author_id OR public.is_platform_admin(auth.uid()));
