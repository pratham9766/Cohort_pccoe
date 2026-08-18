import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && anonKey && !url.includes('xxxxx') && !anonKey.includes('your_'));

export const supabaseConfigError = hasSupabaseConfig
  ? null
  : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.';

export const supabase = hasSupabaseConfig
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

export async function safeSupabaseQuery(queryFactory) {
  const db = requireSupabase();
  const { data, error } = await queryFactory(db);
  if (error) throw error;
  return data ?? [];
}
