import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRole = (userId?: string) => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!userId) {
      setRole(null);
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } else if (data) {
        const userRole = data.role as AppRole;
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
        setIsModerator(userRole === 'moderator' || userRole === 'admin');
      } else {
        setRole('user');
      }
    } catch (err) {
      console.error('Error in fetchRole:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    isAdmin,
    isModerator,
    loading,
    refetch: fetchRole,
  };
};
