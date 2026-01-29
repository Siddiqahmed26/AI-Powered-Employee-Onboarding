import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  department: string;
  role: string;
  current_day: number;
  is_first_login: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  appRole: AppRole | null;
  isAdmin: boolean;
  isModerator: boolean;
  roleLoading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useSupabaseAuth();
  const { role, isAdmin, isModerator, loading: roleLoading } = useUserRole(auth.user?.id);

  const value: AuthContextType = {
    ...auth,
    appRole: role,
    isAdmin,
    isModerator,
    roleLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
