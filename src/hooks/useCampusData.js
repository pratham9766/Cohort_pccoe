import { useQuery } from '@tanstack/react-query';
import { calendarEvents, campusLocations, communities, conversations, messages, posts, xdPosts } from '@/lib/constants.js';
import { isDemoSessionActive } from '@/lib/demo.js';
import { safeSupabaseQuery } from '@/lib/supabase.js';

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: () => (isDemoSessionActive() ? communities : safeSupabaseQuery((db) => db.from('communities').select('*').order('member_count', { ascending: false }))),
  });
}

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () =>
      isDemoSessionActive()
        ? posts
        :
      safeSupabaseQuery(
        (db) => db.from('posts').select('*, author:users(*), community:communities(*)').is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
      ),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => (isDemoSessionActive() ? conversations : safeSupabaseQuery((db) => db.from('conversations').select('*').order('last_message_at', { ascending: false }))),
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    enabled: Boolean(conversationId),
    queryFn: () => (isDemoSessionActive() ? messages : safeSupabaseQuery((db) => db.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'))),
  });
}

export function useXDPosts() {
  return useQuery({
    queryKey: ['xd-posts'],
    queryFn: () => (isDemoSessionActive() ? xdPosts : safeSupabaseQuery((db) => db.from('xd_public_posts').select('*').order('vote_count', { ascending: false }))),
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => (isDemoSessionActive() ? calendarEvents : safeSupabaseQuery((db) => db.from('calendar_events').select('*').order('start_date'))),
  });
}

export function useCampusLocations() {
  return useQuery({
    queryKey: ['campus-locations'],
    queryFn: () => (isDemoSessionActive() ? campusLocations : safeSupabaseQuery((db) => db.from('campus_locations').select('*').order('name'))),
  });
}
