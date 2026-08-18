import { currentUser } from './constants.js';
import { supabase } from './supabase.js';

async function getActiveUserId(explicitUserId) {
  if (explicitUserId) return explicitUserId;
  if (!supabase) return currentUser.id;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error('You must be signed in to perform this action.');
  return data.user.id;
}

export async function createPost({ content, communityId, contentType = 'text', mediaUrls = [] }) {
  const authorId = await getActiveUserId();
  if (!supabase) return { id: crypto.randomUUID(), content, community_id: communityId, media_urls: mediaUrls, author_id: authorId };
  const { data, error } = await supabase
    .from('posts')
    .insert({ content, community_id: communityId, content_type: contentType, media_urls: mediaUrls, author_id: authorId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function toggleCommunitySubscription(communityId, userId) {
  const activeUserId = await getActiveUserId(userId);
  if (!supabase) return { community_id: communityId, user_id: activeUserId };

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
  const activeUserId = await getActiveUserId(userId);
  if (!supabase) return { id: crypto.randomUUID(), content, category, author_id: activeUserId };
  const { data, error } = await supabase.from('xd_posts').insert({ content, category, author_id: activeUserId }).select('*').single();
  if (error) throw error;
  return data;
}

export async function toggleXDVote(postId, userId) {
  const activeUserId = await getActiveUserId(userId);
  if (!supabase) return { xd_post_id: postId, user_id: activeUserId };
  const { error } = await supabase.from('xd_votes').insert({ xd_post_id: postId, user_id: activeUserId });
  if (error?.code === '23505') {
    const { error: deleteError } = await supabase.from('xd_votes').delete().match({ xd_post_id: postId, user_id: activeUserId });
    if (deleteError) throw deleteError;
    return null;
  }
  if (error) throw error;
  return { xd_post_id: postId, user_id: activeUserId };
}

export async function createCalendarEvent(event) {
  const createdBy = await getActiveUserId(event.created_by);
  if (!supabase) return { id: crypto.randomUUID(), ...event, created_by: createdBy };
  const { data, error } = await supabase.from('calendar_events').insert({ ...event, created_by: createdBy }).select('*').single();
  if (error) throw error;
  return data;
}
