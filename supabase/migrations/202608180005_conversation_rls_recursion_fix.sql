CREATE OR REPLACE FUNCTION public.is_conversation_member(target_conversation_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_id = target_conversation_id
      AND user_id = target_user_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_conversation_admin(target_conversation_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_id = target_conversation_id
      AND user_id = target_user_id
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_conversation_member(id, auth.uid()));

DROP POLICY IF EXISTS "Users can view members of their conversations" ON public.conversation_members;
CREATE POLICY "Users can view members of their conversations"
ON public.conversation_members FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Conversation admins can add members" ON public.conversation_members;
CREATE POLICY "Conversation admins can add members"
ON public.conversation_members FOR INSERT TO authenticated
WITH CHECK (public.is_conversation_admin(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
CREATE POLICY "Users can read messages in their conversations"
ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(conversation_id, auth.uid()));
