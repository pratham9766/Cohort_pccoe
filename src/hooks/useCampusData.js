import { useQuery } from '@tanstack/react-query';
import { calendarEvents, campusLocations, campusPeople, communities, conversations, messages, posts, techNews, xdPosts } from '@/lib/constants.js';
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

export function useCampusPeople() {
  return useQuery({
    queryKey: ['campus-people'],
    queryFn: () =>
      isDemoSessionActive()
        ? campusPeople
        : safeSupabaseQuery(
            (db) =>
              db
                .from('users')
                .select('id, full_name, username, avatar_url, branch, year, bio, skills, interests, last_seen_at')
                .order('full_name')
                .limit(50),
          ),
  });
}

export function useCampusAlerts() {
  return useQuery({
    queryKey: ['campus-alerts'],
    queryFn: () =>
      isDemoSessionActive()
        ? []
        : safeSupabaseQuery((db) => db.from('campus_alerts').select('id, title, message, alert_type, created_at').order('starts_at', { ascending: false }).limit(20)),
  });
}

export function useArcadeLeaderboard() {
  return useQuery({
    queryKey: ['arcade-leaderboard'],
    queryFn: () =>
      isDemoSessionActive()
        ? []
        : safeSupabaseQuery(
            (db) =>
              db
                .from('arcade_scores')
                .select('id, score, streak, matches, created_at, user:users(id, full_name, avatar_url, branch)')
                .eq('game_key', 'campus-arcade')
                .order('score', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(5),
          ),
  });
}

export function useTechNews() {
  return useQuery({
    queryKey: ['tech-news'],
    queryFn: () =>
      isDemoSessionActive()
        ? techNews
        : safeSupabaseQuery(
            (db) =>
              db
                .from('tech_news')
                .select('id, title, summary, source, url, category, published_at, fetched_at')
                .order('published_at', { ascending: false })
                .limit(12),
          ),
  });
}
