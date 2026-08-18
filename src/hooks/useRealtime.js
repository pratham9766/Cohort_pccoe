import { useEffect } from 'react';
import { supabase } from '@/lib/supabase.js';

export function useRealtimePostgres({ table, filter, onInsert, onUpdate, onDelete }) {
  useEffect(() => {
    if (!supabase || !table) return undefined;
    const channel = supabase.channel(`public:${table}:${filter ?? 'all'}`);
    const base = { schema: 'public', table };
    if (filter) base.filter = filter;
    if (onInsert) channel.on('postgres_changes', { ...base, event: 'INSERT' }, onInsert);
    if (onUpdate) channel.on('postgres_changes', { ...base, event: 'UPDATE' }, onUpdate);
    if (onDelete) channel.on('postgres_changes', { ...base, event: 'DELETE' }, onDelete);
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, onDelete, onInsert, onUpdate, table]);
}
