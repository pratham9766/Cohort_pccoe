import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimePostgres } from './useRealtime.js';

export function useRealtimeInvalidation(table, queryKeys, filter) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(() => {
    queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  }, [queryClient, queryKeys]);

  useRealtimePostgres({
    table,
    filter,
    onInsert: invalidate,
    onUpdate: invalidate,
    onDelete: invalidate,
  });
}
