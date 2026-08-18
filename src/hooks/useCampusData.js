import { useQuery } from '@tanstack/react-query';
import { calendarEvents, campusLocations, communities, conversations, messages, posts, xdPosts } from '@/lib/constants.js';
import { safeSupabaseQuery } from '@/lib/supabase.js';

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: () => safeSupabaseQuery((db) => db.from('communities').select('*').order('member_count', { ascending: false }), communities),
  });
}

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () =>
      safeSupabaseQuery(
        (db) => db.from('posts').select('*, author:users(*), community:communities(*)').is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
        posts,
      ),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => safeSupabaseQuery((db) => db.from('conversations').select('*').order('last_message_at', { ascending: false }), conversations),
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => safeSupabaseQuery((db) => db.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'), messages),
  });
}

export function useXDPosts() {
  return useQuery({
    queryKey: ['xd-posts'],
    queryFn: () => safeSupabaseQuery((db) => db.from('xd_posts').select('*').eq('is_removed', false).order('vote_count', { ascending: false }), xdPosts),
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => safeSupabaseQuery((db) => db.from('calendar_events').select('*').order('start_date'), calendarEvents),
  });
}

export function useCampusLocations() {
  return useQuery({
    queryKey: ['campus-locations'],
    queryFn: () => safeSupabaseQuery((db) => db.from('campus_locations').select('*').order('name'), campusLocations),
  });
}
