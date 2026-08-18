GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER TABLE public.community_members
  DROP CONSTRAINT IF EXISTS community_members_role_check;

ALTER TABLE public.community_members
  ADD CONSTRAINT community_members_role_check
  CHECK (role IN ('member', 'moderator', 'admin', 'owner'));

ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;

ALTER TABLE public.calendar_events
  ADD CONSTRAINT calendar_events_event_type_check
  CHECK (event_type IN ('academic', 'exam', 'holiday', 'community', 'hackathon', 'workshop', 'placement', 'deadline', 'event', 'other'));

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE public.reports
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.reports
  ADD CONSTRAINT reports_status_check
  CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed', 'open', 'under_review'));

CREATE OR REPLACE FUNCTION public.is_community_admin(target_community_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_members
    WHERE community_id = target_community_id
      AND user_id = is_community_admin.user_id
      AND role IN ('admin', 'owner')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admins can update their community" ON public.communities;
CREATE POLICY "Community owners and platform admins can update communities"
ON public.communities FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()) OR auth.uid() = admin_id OR public.is_community_admin(id, auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()) OR auth.uid() = admin_id OR public.is_community_admin(id, auth.uid()));

CREATE POLICY "Community owners and platform admins can delete communities"
ON public.communities FOR DELETE TO authenticated
USING (public.is_platform_admin(auth.uid()) OR auth.uid() = admin_id OR public.is_community_admin(id, auth.uid()));

CREATE POLICY "Community admins can manage memberships"
ON public.community_members FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()) OR public.is_community_admin(community_id, auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()) OR public.is_community_admin(community_id, auth.uid()));

CREATE POLICY "Community admins can remove members"
ON public.community_members FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()) OR public.is_community_admin(community_id, auth.uid()));

CREATE POLICY "Platform admins can manage official events"
ON public.calendar_events FOR UPDATE TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR (
    community_id IS NOT NULL
    AND public.is_community_admin(community_id, auth.uid())
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR (
    community_id IS NOT NULL
    AND public.is_community_admin(community_id, auth.uid())
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Platform admins can delete official events"
ON public.calendar_events FOR DELETE TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR (
    community_id IS NOT NULL
    AND public.is_community_admin(community_id, auth.uid())
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Moderators can update XD posts"
ON public.xd_posts FOR UPDATE TO authenticated
USING (auth.uid() = author_id OR public.is_platform_admin(auth.uid()))
WITH CHECK (auth.uid() = author_id OR public.is_platform_admin(auth.uid()));

CREATE POLICY "Moderators can update XD comments"
ON public.xd_comments FOR UPDATE TO authenticated
USING (auth.uid() = author_id OR public.is_platform_admin(auth.uid()))
WITH CHECK (auth.uid() = author_id OR public.is_platform_admin(auth.uid()));

CREATE POLICY "Moderators can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()) AND actor_id = auth.uid());

CREATE POLICY "Users can update own avatar objects"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar objects"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authors can update own post media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authors can delete own post media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authors can update own XD media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'xd-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'xd-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authors can delete own XD media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'xd-media' AND (storage.foldername(name))[1] = auth.uid()::text);
