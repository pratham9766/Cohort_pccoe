import { allowedEmailDomains } from './constants.js';
import { requireSupabase, supabase } from './supabase.js';

export function isAllowedPccoeEmail(email = '') {
  const normalized = email.toLowerCase();
  return allowedEmailDomains.some((domain) => normalized.endsWith(`@${domain}`));
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function ensureUserProfile(authUser, publicKey) {
  const db = requireSupabase();
  const profile = {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'PCCOE Student',
    avatar_url: authUser.user_metadata?.avatar_url,
    is_verified: true,
  };
  if (publicKey) profile.public_key = publicKey;

  return db
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();
}
