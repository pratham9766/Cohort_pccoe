CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  year SMALLINT CHECK (year BETWEEN 1 AND 4),
  branch TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'alumni', 'admin')),
  division TEXT,
  prn TEXT UNIQUE,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  skills TEXT[],
  interests TEXT[],
  achievements JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  public_key TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_onboarded BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Cultural', 'Sports', 'Social', 'Academic')),
  logo_url TEXT,
  cover_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  admin_id UUID REFERENCES public.users(id),
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  post_count INTEGER DEFAULT 0 CHECK (post_count >= 0),
  is_official BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'link', 'announcement')),
  media_urls TEXT[],
  link_preview JSONB,
  like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_announcement BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id),
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.users(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  encrypted_content TEXT NOT NULL,
  nonce TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER CHECK (file_size IS NULL OR file_size >= 0),
  reply_to_id UUID REFERENCES public.messages(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.xd_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General' CHECK (category IN ('Tips', 'Ideas', 'Rants', 'Opportunities', 'Memes', 'General')),
  media_urls TEXT[],
  vote_count INTEGER DEFAULT 0 CHECK (vote_count >= 0),
  comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
  is_flagged BOOLEAN DEFAULT FALSE,
  is_removed BOOLEAN DEFAULT FALSE,
  removal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.xd_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xd_post_id UUID NOT NULL REFERENCES public.xd_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (xd_post_id, user_id)
);

CREATE TABLE public.xd_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xd_post_id UUID NOT NULL REFERENCES public.xd_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.xd_comments(id),
  content TEXT NOT NULL,
  is_removed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.campus_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('classroom', 'lab', 'admin', 'canteen', 'hostel', 'sports', 'other')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  building TEXT,
  floor TEXT,
  icon_type TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('exam', 'holiday', 'deadline', 'event', 'workshop', 'other')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  map_coordinates JSONB,
  community_id UUID REFERENCES public.communities(id),
  created_by UUID REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'community_post', 'message', 'calendar')),
  entity_type TEXT CHECK (entity_type IN ('post', 'comment', 'community', 'message', 'calendar_event', 'profile')),
  entity_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_follows (
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_branch ON public.users(branch);
CREATE INDEX idx_users_year ON public.users(year);
CREATE INDEX idx_users_fts ON public.users USING GIN (to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(username, '') || ' ' || coalesce(bio, '')));
CREATE INDEX idx_communities_category ON public.communities(category);
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_communities_fts ON public.communities USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_community ON public.posts(community_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_fts ON public.posts USING GIN (to_tsvector('english', content));
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);
CREATE INDEX idx_conv_members_user ON public.conversation_members(user_id);
CREATE INDEX idx_conv_members_conv ON public.conversation_members(conversation_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_xd_posts_votes ON public.xd_posts(vote_count DESC);
CREATE INDEX idx_xd_posts_created ON public.xd_posts(created_at DESC);
CREATE INDEX idx_xd_posts_category ON public.xd_posts(category);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(start_date);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_community ON public.calendar_events(community_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id) WHERE is_read = false;
CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xd_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xd_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xd_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Communities viewable by authenticated users" ON public.communities FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can update their community" ON public.communities FOR UPDATE TO authenticated USING (auth.uid() = admin_id) WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Members can view community membership" ON public.community_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Posts visible to authenticated users" ON public.posts FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Reactions viewable by authenticated users" ON public.post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can react to posts" ON public.post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Comments visible to authenticated users" ON public.comments FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (
  id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can view members of their conversations" ON public.conversation_members FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can add themselves to conversations" ON public.conversation_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read messages in their conversations" ON public.messages FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
);

CREATE POLICY "XD posts visible to authenticated users" ON public.xd_posts FOR SELECT TO authenticated USING (is_removed = false);
CREATE POLICY "Users can create XD posts" ON public.xd_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can vote" ON public.xd_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unvote" ON public.xd_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Votes visible to authenticated users" ON public.xd_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "XD comments visible" ON public.xd_comments FOR SELECT TO authenticated USING (is_removed = false);
CREATE POLICY "Users can create XD comments" ON public.xd_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Events visible to authenticated users" ON public.calendar_events FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Admins and community moderators can create events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = created_by AND (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
    OR EXISTS (SELECT 1 FROM public.community_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator') AND community_id = public.calendar_events.community_id)
  )
);
CREATE POLICY "Locations visible to authenticated users" ON public.campus_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can mark own notifications as read" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Follows visible to authenticated users" ON public.user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_xd_posts_updated_at BEFORE UPDATE ON public.xd_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_member_count AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_post_like_count AFTER INSERT OR DELETE ON public.post_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE OR REPLACE FUNCTION public.update_xd_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.xd_posts SET vote_count = vote_count + 1 WHERE id = NEW.xd_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.xd_posts SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.xd_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_xd_vote_count AFTER INSERT OR DELETE ON public.xd_votes
FOR EACH ROW EXECUTE FUNCTION public.update_xd_vote_count();

CREATE OR REPLACE FUNCTION public.notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author UUID;
BEGIN
  SELECT author_id INTO post_author FROM public.posts WHERE id = NEW.post_id;
  IF post_author IS NOT NULL AND post_author <> NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
    VALUES (post_author, NEW.user_id, 'like', 'post', NEW.post_id, 'liked your post');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_reaction AFTER INSERT ON public.post_reactions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reaction();

INSERT INTO public.communities (slug, name, description, category, is_official, member_count, post_count) VALUES
  ('gdgc-pccoe', 'GDGC PCCOE', 'Google Developer Groups on Campus at PCCOE', 'Technical', true, 936, 38),
  ('acm-pccoe', 'ACM PCCOE', 'ACM Student Chapter at PCCOE', 'Technical', true, 701, 31),
  ('ieee-pccoe', 'IEEE PCCOE', 'IEEE Student Branch at PCCOE', 'Technical', true, 532, 28),
  ('art-circle', 'Art Circle', 'Creative arts and design community at PCCOE', 'Cultural', true, 414, 19),
  ('nss-pccoe', 'NSS PCCOE', 'National Service Scheme unit at PCCOE', 'Social', true, 629, 24),
  ('ecell-pccoe', 'E-Cell PCCOE', 'Entrepreneurship Cell at PCCOE', 'Academic', true, 488, 22),
  ('robotics-club', 'Robotics Club', 'Robotics and automation enthusiasts', 'Technical', true, 390, 17),
  ('cesa-pccoe', 'CESA', 'Computer Engineering Students Association', 'Academic', true, 620, 20),
  ('sports-council', 'Sports Council', 'Campus sports teams, trials, fixtures, and tournaments', 'Sports', true, 574, 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.campus_locations (name, description, category, latitude, longitude, building, floor, icon_type) VALUES
  ('Admin Block', 'Administrative offices and reception.', 'admin', 18.6286, 73.8394, 'Main Building', 'Ground', 'building'),
  ('Central Canteen', 'Food court and student hangout.', 'canteen', 18.6289, 73.8390, 'Student Area', 'Ground', 'food'),
  ('Computer Lab 3', 'Programming lab and workshop room.', 'lab', 18.6283, 73.8398, 'Computer Department', 'Second', 'terminal'),
  ('Seminar Hall B', 'Talks, workshops, and club events.', 'classroom', 18.6287, 73.8401, 'Academic Block', 'First', 'presentation');
