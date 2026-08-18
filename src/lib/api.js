import { currentUser } from './constants.js';
import { getStoredDemoUser, isDemoSessionActive } from './demo.js';
import { requireSupabase } from './supabase.js';

function getDemoActiveUser() {
  return getStoredDemoUser() ?? currentUser;
}

async function getActiveUserId(explicitUserId) {
  if (explicitUserId) return explicitUserId;
  const supabase = requireSupabase();

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error('You must be signed in to perform this action.');
  return data.user.id;
}

export async function updateProfile(profile) {
  if (isDemoSessionActive()) return { ...getDemoActiveUser(), ...profile };
  const supabase = requireSupabase();
  const activeUserId = await getActiveUserId();
  const allowed = {
    full_name: profile.full_name,
    branch: profile.branch,
    year: profile.year ? Number(profile.year) : null,
    division: profile.division,
    bio: profile.bio,
    interests: profile.interests,
    avatar_url: profile.avatar_url,
    is_onboarded: profile.is_onboarded,
  };

  const { data, error } = await supabase.from('users').update(allowed).eq('id', activeUserId).select('*').single();
  if (error) throw error;
  return data;
}

export async function createPost({ content, communityId, contentType = 'text', mediaUrls = [] }) {
  if (isDemoSessionActive()) {
    return { id: crypto.randomUUID(), content, community_id: communityId, content_type: contentType, media_urls: mediaUrls, author_id: getDemoActiveUser().id };
  }
  const supabase = requireSupabase();
  const authorId = await getActiveUserId();
  const { data, error } = await supabase
    .from('posts')
    .insert({ content, community_id: communityId, content_type: contentType, media_urls: mediaUrls, author_id: authorId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  if (isDemoSessionActive()) return { id: postId };
  const supabase = requireSupabase();
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function togglePostLike(postId) {
  if (isDemoSessionActive()) return { post_id: postId, liked: true };
  const supabase = requireSupabase();
  const activeUserId = await getActiveUserId();
  const { data: existing, error: lookupError } = await supabase.from('post_reactions').select('id').match({ post_id: postId, user_id: activeUserId }).maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    const { error } = await supabase.from('post_reactions').delete().eq('id', existing.id);
    if (error) throw error;
    return { liked: false };
  }

  const { error } = await supabase.from('post_reactions').insert({ post_id: postId, user_id: activeUserId, reaction_type: 'like' });
  if (error) throw error;
  return { liked: true };
}

export async function getComments(postId) {
  if (isDemoSessionActive()) return [];
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, content, created_at, author:users(id, full_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createComment({ postId, content }) {
  if (isDemoSessionActive()) {
    const demoUser = getDemoActiveUser();
    return {
      id: crypto.randomUUID(),
      post_id: postId,
      author_id: demoUser.id,
      content,
      created_at: 'now',
      author: demoUser,
    };
  }
  const supabase = requireSupabase();
  const authorId = await getActiveUserId();
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, content })
    .select('id, post_id, author_id, content, created_at, author:users(id, full_name, avatar_url)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId) {
  if (isDemoSessionActive()) return { id: commentId };
  const supabase = requireSupabase();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

export async function toggleCommunitySubscription(communityId, userId) {
  if (isDemoSessionActive()) return { community_id: communityId, user_id: userId ?? getDemoActiveUser().id };
  const supabase = requireSupabase();
  const activeUserId = await getActiveUserId(userId);

  const { data: existing } = await supabase.from('community_members').select('id').match({ community_id: communityId, user_id: activeUserId }).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('community_members').delete().eq('id', existing.id);
    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase.from('community_members').insert({ community_id: communityId, user_id: activeUserId }).select('*').single();
  if (error) throw error;
  return data;
}

export async function createXDPost({ content, category = 'General', userId }) {
  if (isDemoSessionActive()) return { id: crypto.randomUUID(), content, category, vote_count: 0, comment_count: 0, created_at: 'now' };
  const supabase = requireSupabase();
  const activeUserId = await getActiveUserId(userId);
  const { data, error } = await supabase
    .from('xd_posts')
    .insert({ content, category, author_id: activeUserId })
    .select('id, content, category, media_urls, vote_count, comment_count, is_flagged, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function toggleXDVote(postId, userId) {
  if (isDemoSessionActive()) return { xd_post_id: postId, user_id: userId ?? getDemoActiveUser().id };
  const supabase = requireSupabase();
  const activeUserId = await getActiveUserId(userId);
  const { error } = await supabase.from('xd_votes').insert({ xd_post_id: postId, user_id: activeUserId });
  if (error?.code === '23505') {
    const { error: deleteError } = await supabase.from('xd_votes').delete().match({ xd_post_id: postId, user_id: activeUserId });
    if (deleteError) throw deleteError;
    return null;
  }
  if (error) throw error;
  return { xd_post_id: postId, user_id: activeUserId };
}

export async function sendMessage({ conversationId, content }) {
  if (isDemoSessionActive()) return { id: crypto.randomUUID(), conversation_id: conversationId, sender_id: getDemoActiveUser().id, content, created_at: 'now', body: content, mine: true };
  const supabase = requireSupabase();
  const senderId = await getActiveUserId();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: 'text',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function sendCampusChatMessage(content) {
  if (isDemoSessionActive()) {
    const demoUser = getDemoActiveUser();
    return {
      id: crypto.randomUUID(),
      sender_id: demoUser.id,
      content,
      created_at: 'now',
      sender: demoUser,
    };
  }
  const supabase = requireSupabase();
  const senderId = await getActiveUserId();
  const { data, error } = await supabase
    .from('campus_chat_messages')
    .insert({ sender_id: senderId, content })
    .select('id, sender_id, content, created_at, sender:users(id, full_name, avatar_url, branch)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCampusChatMessage(messageId) {
  if (isDemoSessionActive()) return { id: messageId };
  const supabase = requireSupabase();
  const { error } = await supabase.from('campus_chat_messages').delete().eq('id', messageId);
  if (error) throw error;
  return { id: messageId };
}

export async function createCalendarEvent(event) {
  if (isDemoSessionActive()) return { id: crypto.randomUUID(), ...event, created_by: getDemoActiveUser().id };
  const supabase = requireSupabase();
  const createdBy = await getActiveUserId(event.created_by);
  const { data, error } = await supabase.from('calendar_events').insert({ ...event, created_by: createdBy }).select('*').single();
  if (error) throw error;
  return data;
}

export async function saveArcadeScore({ score, streak, matches, metadata = {} }) {
  if (isDemoSessionActive()) {
    return {
      id: crypto.randomUUID(),
      user_id: getDemoActiveUser().id,
      game_key: 'campus-arcade',
      score,
      streak,
      matches,
      metadata,
      created_at: 'now',
    };
  }
  const supabase = requireSupabase();
  const userId = await getActiveUserId();
  const { data, error } = await supabase
    .from('arcade_scores')
    .insert({
      user_id: userId,
      game_key: 'campus-arcade',
      score,
      streak,
      matches,
      metadata,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function createCampusAlert({ title = 'Campus update', message, alertType = 'event' }) {
  if (isDemoSessionActive()) {
    return {
      id: crypto.randomUUID(),
      title,
      message,
      alert_type: alertType,
      author_id: getDemoActiveUser().id,
      created_at: 'Just now',
    };
  }
  const supabase = requireSupabase();
  const authorId = await getActiveUserId();
  const { data, error } = await supabase
    .from('campus_alerts')
    .insert({
      author_id: authorId,
      title,
      message,
      alert_type: alertType,
      is_published: true,
    })
    .select('id, title, message, alert_type, created_at')
    .single();
  if (error) throw error;
  return data;
}
