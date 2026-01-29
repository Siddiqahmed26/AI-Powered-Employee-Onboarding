import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from './useUserRole';

interface UserWithProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  department: string | null;
  role: string | null;
  current_day: number | null;
  is_first_login: boolean | null;
  created_at: string;
  updated_at: string;
  app_role?: AppRole;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all profiles (admin RLS policy allows this)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        throw rolesError;
      }

      // Merge profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          app_role: (userRole?.role as AppRole) || 'user',
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: AppRole): Promise<boolean> => {
    try {
      // Check if user has an existing role entry
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) throw insertError;
      }

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.user_id === userId ? { ...user, app_role: newRole } : user
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update role');
      return false;
    }
  }, []);

  const updateUserProfile = useCallback(async (
    userId: string,
    updates: Partial<Pick<UserWithProfile, 'full_name' | 'department' | 'role'>>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.user_id === userId ? { ...user, ...updates } : user
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    updateUserProfile,
  };
};
