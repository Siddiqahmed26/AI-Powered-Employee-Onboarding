import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuditLog = (userId?: string) => {
  const log = useCallback(async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!userId) return;
    try {
      // Use rpc or raw insert via any cast to avoid type gen mismatch on new columns
      const { error } = await (supabase as any)
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType ?? null,
          resource_id: resourceId ?? null,
          metadata: metadata ?? {},
        });
      if (error) console.warn('Audit log insert error:', error.message);
    } catch (err) {
      console.warn('Audit log failed:', err);
    }
  }, [userId]);

  return { log };
};
