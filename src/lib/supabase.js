import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && anonKey && !url.includes('xxxxx') && !anonKey.includes('your_'));

export const supabase = hasSupabaseConfig
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function safeSupabaseQuery(queryFactory, fallback) {
  if (!supabase) return fallback;
  const { data, error } = await queryFactory(supabase);
  if (error) throw error;
  return data ?? fallback;
}
