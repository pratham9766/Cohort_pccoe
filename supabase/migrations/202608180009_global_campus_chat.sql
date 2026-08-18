CREATE TABLE IF NOT EXISTS public.campus_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campus_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_campus_chat_messages_created
ON public.campus_chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campus_chat_messages_sender
ON public.campus_chat_messages(sender_id);

DROP POLICY IF EXISTS "Authenticated users can read campus chat" ON public.campus_chat_messages;
CREATE POLICY "Authenticated users can read campus chat"
ON public.campus_chat_messages FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can send campus chat messages" ON public.campus_chat_messages;
CREATE POLICY "Users can send campus chat messages"
ON public.campus_chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete own campus chat messages" ON public.campus_chat_messages;
CREATE POLICY "Users can delete own campus chat messages"
ON public.campus_chat_messages FOR DELETE TO authenticated
USING (auth.uid() = sender_id);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
