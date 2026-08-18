# Backend Schema Document
## Cohort PCCOE — PostgreSQL (Supabase) Database Design

**Version:** 1.0  
**Date:** 2026-08-17  
**Database:** PostgreSQL 15 via Supabase  

---

## Overview

The database uses **Row-Level Security (RLS)** on all tables to enforce data access at the database level. All user sessions are authenticated via Supabase Auth with Google OAuth.

### Design Principles
- Every table has `created_at` and `updated_at` timestamps
- Soft deletes (`deleted_at`) on critical tables
- UUIDs as primary keys (Supabase default)
- JSONB for flexible metadata fields
- GIN indexes on full-text search columns

---

## Entity-Relationship Diagram

```
users ──────────────────────────────────────────────────────┐
  │ 1:N posts                                               │
  │ 1:N comments                                            │
  │ N:M communities (via community_members)                 │
  │ N:M conversations (via conversation_members)            │
  │ 1:N messages (sender)                                   │
  │ 1:N xd_posts (anonymous, linked internally)             │
  │ 1:N notifications                                       │
  └──────────────────────────────────────────────────────────┘

communities ─────────────────────────────────────────────────┐
  │ 1:N posts (community_id)                                │
  │ N:M users (via community_members)                       │
  └──────────────────────────────────────────────────────────┘

conversations ───────────────────────────────────────────────┐
  │ 1:N messages                                            │
  │ N:M users (via conversation_members)                    │
  └──────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### 1. `users`

Extends Supabase Auth `auth.users`. Stores public profile data.

```sql
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  username        TEXT UNIQUE,                    -- @handle
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,                           -- Supabase Storage URL
  bio             TEXT,
  year            SMALLINT CHECK (year BETWEEN 1 AND 4),
  branch          TEXT,                           -- e.g., "Computer Engineering"
  role            TEXT DEFAULT 'student'          -- 'student' | 'faculty' | 'alumni' | 'admin'
                  CHECK (role IN ('student', 'faculty', 'alumni', 'admin')),
  division        TEXT,                           -- e.g., "A", "B"
  prn             TEXT UNIQUE,                    -- PRN number (PCCOE student ID)
  
  -- Social Links
  github_url      TEXT,
  linkedin_url    TEXT,
  portfolio_url   TEXT,
  
  -- Skills & Interests
  skills          TEXT[],                         -- Array of skill tags
  interests       TEXT[],                         -- Array of interest tags
  
  -- Profile portfolio items
  achievements    JSONB DEFAULT '[]',             -- [{title, description, date, url}]
  certifications  JSONB DEFAULT '[]',             -- [{name, issuer, date, url}]
  
  -- E2E Encryption
  public_key      TEXT,                           -- Curve25519 public key (base64)
  
  -- Metadata
  is_verified     BOOLEAN DEFAULT FALSE,          -- Email/PRN verified
  is_onboarded    BOOLEAN DEFAULT FALSE,          -- Completed setup wizard
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_branch ON users(branch);
CREATE INDEX idx_users_year ON users(year);

-- Full-text search index
CREATE INDEX idx_users_fts ON users USING GIN (
  to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(username,'') || ' ' || coalesce(bio,''))
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

---

### 2. `communities`

Student clubs and organizations.

```sql
CREATE TABLE public.communities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,           -- URL-friendly identifier
  name            TEXT NOT NULL,
  description     TEXT,
  long_description TEXT,
  category        TEXT NOT NULL                   -- 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Academic'
                  CHECK (category IN ('Technical', 'Cultural', 'Sports', 'Social', 'Academic')),
  logo_url        TEXT,                           -- Supabase Storage URL
  cover_url       TEXT,                           -- Banner image
  
  -- Social Media Links
  instagram_url   TEXT,
  linkedin_url    TEXT,
  github_url      TEXT,
  website_url     TEXT,
  
  -- Admin
  admin_id        UUID REFERENCES users(id),      -- Primary admin
  
  -- Stats (denormalized for performance)
  member_count    INTEGER DEFAULT 0,
  post_count      INTEGER DEFAULT 0,
  
  is_official     BOOLEAN DEFAULT TRUE,           -- Official PCCOE club
  is_active       BOOLEAN DEFAULT TRUE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communities_category ON communities(category);
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_fts ON communities USING GIN (
  to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))
);

-- RLS Policies
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities viewable by all authenticated users"
  ON communities FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can update their community"
  ON communities FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);
```

---

### 3. `community_members`

Junction table: User ↔ Community subscriptions.

```sql
CREATE TABLE public.community_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member'           -- 'member' | 'moderator' | 'admin'
                  CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

-- Indexes
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);

-- RLS Policies
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community membership"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

### 4. `posts`

Feed posts — can be personal posts or community posts.

```sql
CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id    UUID REFERENCES communities(id) ON DELETE CASCADE,  -- NULL = personal post
  
  content         TEXT NOT NULL,
  content_type    TEXT DEFAULT 'text'             -- 'text' | 'image' | 'link' | 'announcement'
                  CHECK (content_type IN ('text', 'image', 'link', 'announcement')),
  
  -- Media
  media_urls      TEXT[],                         -- Array of Supabase Storage URLs
  link_preview    JSONB,                          -- {url, title, description, image}
  
  -- Stats (denormalized)
  like_count      INTEGER DEFAULT 0,
  comment_count   INTEGER DEFAULT 0,
  
  -- Pinned posts (admin feature)
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_announcement BOOLEAN DEFAULT FALSE,
  
  -- Soft delete
  deleted_at      TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_fts ON posts USING GIN (to_tsvector('english', content));

-- RLS Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts visible to authenticated users"
  ON posts FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can soft-delete own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);
```

---

### 5. `post_reactions`

Reactions (likes, emoji) on posts.

```sql
CREATE TABLE public.post_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type   TEXT DEFAULT 'like'             -- 'like' | '❤️' | '🔥' | '👏' | '😂'
                  CHECK (reaction_type IN ('like', '❤️', '🔥', '👏', '😂')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)                        -- One reaction per user per post
);

-- RLS Policies
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by authenticated users"
  ON post_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can react to posts"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

### 6. `comments`

Comments on posts (supports nesting up to 2 levels).

```sql
CREATE TABLE public.comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES comments(id),   -- NULL = top-level comment
  
  content         TEXT NOT NULL,
  
  like_count      INTEGER DEFAULT 0,
  deleted_at      TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments visible to authenticated users"
  ON comments FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
```

---

### 7. `conversations`

Chat sessions (1-on-1 DMs or group chats).

```sql
CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL                   -- 'direct' | 'group'
                  CHECK (type IN ('direct', 'group')),
  
  -- Group-specific fields
  name            TEXT,                           -- Group chat name (NULL for DMs)
  avatar_url      TEXT,                           -- Group avatar
  created_by      UUID REFERENCES users(id),
  
  -- Last message preview (denormalized)
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
    )
  );
```

---

### 8. `conversation_members`

Users participating in a conversation.

```sql
CREATE TABLE public.conversation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member'           -- 'member' | 'admin'
                  CHECK (role IN ('member', 'admin')),
  
  -- Read receipt tracking
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX idx_conv_members_conv ON conversation_members(conversation_id);

-- RLS Policies
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their conversations"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
    )
  );
```

---

### 9. `messages`

Encrypted messages in conversations.

```sql
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Encrypted content (NaCl box ciphertext)
  encrypted_content TEXT NOT NULL,               -- Base64 encoded ciphertext
  nonce             TEXT NOT NULL,               -- Base64 encoded nonce
  
  -- Message metadata (not encrypted)
  message_type    TEXT DEFAULT 'text'            -- 'text' | 'image' | 'file' | 'system'
                  CHECK (message_type IN ('text', 'image', 'file', 'system')),
  
  -- For file/image messages
  file_url        TEXT,                          -- Supabase Storage URL
  file_name       TEXT,
  file_size       INTEGER,
  
  -- Reply threading
  reply_to_id     UUID REFERENCES messages(id),
  
  -- Status
  is_deleted      BOOLEAN DEFAULT FALSE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (
      SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
    )
  );
```

---

### 10. `xd_posts`

Anonymous Exchange (XD) board posts.

```sql
CREATE TABLE public.xd_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User is stored internally for moderation but never exposed publicly
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content         TEXT NOT NULL,
  category        TEXT DEFAULT 'General'         -- 'Tips' | 'Ideas' | 'Rants' | 'Opportunities' | 'Memes' | 'General'
                  CHECK (category IN ('Tips', 'Ideas', 'Rants', 'Opportunities', 'Memes', 'General')),
  
  -- Media
  media_urls      TEXT[],
  
  -- Stats (denormalized)
  vote_count      INTEGER DEFAULT 0,
  comment_count   INTEGER DEFAULT 0,
  
  -- Moderation
  is_flagged      BOOLEAN DEFAULT FALSE,
  is_removed      BOOLEAN DEFAULT FALSE,
  removal_reason  TEXT,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_xd_posts_votes ON xd_posts(vote_count DESC);
CREATE INDEX idx_xd_posts_created ON xd_posts(created_at DESC);
CREATE INDEX idx_xd_posts_category ON xd_posts(category);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE xd_posts;

-- RLS Policies
ALTER TABLE xd_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "XD posts visible to authenticated users"
  ON xd_posts FOR SELECT
  TO authenticated
  USING (is_removed = false);

-- Author hidden from SELECT (only admins can see author_id)
CREATE POLICY "Anyone can create XD posts"
  ON xd_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);
```

---

### 11. `xd_votes`

Upvotes on XD posts.

```sql
CREATE TABLE public.xd_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xd_post_id      UUID NOT NULL REFERENCES xd_posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(xd_post_id, user_id)
);

-- RLS Policies
ALTER TABLE xd_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can vote" ON xd_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unvote" ON xd_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Votes visible to authenticated" ON xd_votes FOR SELECT TO authenticated USING (true);
```

---

### 12. `xd_comments`

Comments on XD board posts (also anonymous).

```sql
CREATE TABLE public.xd_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xd_post_id      UUID NOT NULL REFERENCES xd_posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Hidden
  parent_id       UUID REFERENCES xd_comments(id),
  content         TEXT NOT NULL,
  is_removed      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE xd_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments visible" ON xd_comments FOR SELECT TO authenticated USING (is_removed = false);
CREATE POLICY "Users can comment" ON xd_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
```

---

### 13. `calendar_events`

Academic and campus events.

```sql
CREATE TABLE public.calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT NOT NULL                  -- 'exam' | 'holiday' | 'deadline' | 'event' | 'workshop'
                  CHECK (event_type IN ('exam', 'holiday', 'deadline', 'event', 'workshop', 'other')),
  
  start_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ,
  is_all_day      BOOLEAN DEFAULT FALSE,
  
  -- Location
  location        TEXT,
  map_coordinates JSONB,                         -- {lat, lng} for TomTom map pin
  
  -- Community association
  community_id    UUID REFERENCES communities(id),
  
  -- Creator
  created_by      UUID NOT NULL REFERENCES users(id),
  
  -- Visibility
  is_public       BOOLEAN DEFAULT TRUE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_events_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_community ON calendar_events(community_id);

-- RLS Policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events visible to authenticated users" ON calendar_events FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Only admins and community admins can create events" ON calendar_events FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
      OR EXISTS (SELECT 1 FROM community_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator') AND community_id = calendar_events.community_id)
    )
  );
```

---

### 14. `notifications`

In-app notification queue.

```sql
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who triggered this
  
  type            TEXT NOT NULL,                 -- 'like' | 'comment' | 'follow' | 'mention' | 'community_post' | 'message'
  
  -- Reference to entity
  entity_type     TEXT,                          -- 'post' | 'comment' | 'community' | 'message'
  entity_id       UUID,                          -- ID of the referenced entity
  
  message         TEXT NOT NULL,                 -- Human-readable notification text
  
  is_read         BOOLEAN DEFAULT FALSE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE is_read = false;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can mark own notifications as read" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
```

---

### 15. `campus_locations`

Map POIs for the campus map feature.

```sql
CREATE TABLE public.campus_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,                 -- 'classroom' | 'lab' | 'admin' | 'canteen' | 'hostel' | 'sports' | 'other'
  
  -- TomTom coordinates
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  
  -- Building info
  building        TEXT,
  floor           TEXT,
  
  icon_type       TEXT DEFAULT 'default',        -- Icon identifier for map marker
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE campus_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations visible to all authenticated users" ON campus_locations FOR SELECT TO authenticated USING (true);
```

---

### 16. `user_follows`

Following/connection graph between users.

```sql
CREATE TABLE public.user_follows (
  follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);

-- RLS Policies
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows visible to authenticated users" ON user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
```

---

## Database Functions & Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Auto-increment member count

```sql
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_member_count
AFTER INSERT OR DELETE ON community_members
FOR EACH ROW EXECUTE FUNCTION update_community_member_count();
```

### Auto-increment post like count

```sql
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_like_count
AFTER INSERT OR DELETE ON post_reactions
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();
```

### Auto-create notification on post reaction

```sql
CREATE OR REPLACE FUNCTION notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author UUID;
BEGIN
  SELECT author_id INTO post_author FROM posts WHERE id = NEW.post_id;
  IF post_author != NEW.user_id THEN
    INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
    VALUES (post_author, NEW.user_id, 'like', 'post', NEW.post_id, 'liked your post');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_reaction
AFTER INSERT ON post_reactions
FOR EACH ROW EXECUTE FUNCTION notify_on_reaction();
```

---

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `avatars` | Authenticated read, owner write | User profile photos |
| `community-assets` | Authenticated read, admin write | Community logos, covers |
| `post-media` | Authenticated read, author write | Post images |
| `message-files` | Conversation member read/write | Chat file attachments |
| `xd-media` | Authenticated read, owner write | XD board media |

```sql
-- Example Storage Policy
CREATE POLICY "Avatar images accessible by authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Seed Data: Initial Communities

```sql
INSERT INTO communities (slug, name, description, category, is_official) VALUES
  ('gdgc-pccoe', 'GDGC PCCOE', 'Google Developer Groups on Campus at PCCOE', 'Technical', true),
  ('acm-pccoe', 'ACM PCCOE', 'ACM Student Chapter at PCCOE', 'Technical', true),
  ('ieee-pccoe', 'IEEE PCCOE', 'IEEE Student Branch at PCCOE', 'Technical', true),
  ('art-circle', 'Art Circle', 'Creative arts and design community at PCCOE', 'Cultural', true),
  ('nss-pccoe', 'NSS PCCOE', 'National Service Scheme unit at PCCOE', 'Social', true),
  ('ecell-pccoe', 'E-Cell PCCOE', 'Entrepreneurship Cell at PCCOE', 'Academic', true),
  ('robotics-club', 'Robotics Club', 'Robotics and automation enthusiasts', 'Technical', true),
  ('cesa-pccoe', 'CESA', 'Computer Engineering Students Association', 'Academic', true),
  ('music-club', 'Music Club', 'Campus music and performing arts', 'Cultural', true);
```
