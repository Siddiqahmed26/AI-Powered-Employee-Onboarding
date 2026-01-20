import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface User {
  username: string;
  role: string;
  department: string;
  currentDay: number;
  isFirstLogin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentDay: (day: number) => void;
  setFirstLoginComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('onboarding_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Hardcoded credentials for testing
    if (username === 'company@123' && password === '1234') {
      const storedUser = localStorage.getItem('onboarding_user');
      const existingUser = storedUser ? JSON.parse(storedUser) : null;
      
      const newUser: User = {
        username,
        role: 'Software Engineer',
        department: 'Engineering',
        currentDay: existingUser?.currentDay || 1,
        isFirstLogin: !existingUser,
      };
      
      setUser(newUser);
      localStorage.setItem('onboarding_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('onboarding_user');
  }, []);

  const updateCurrentDay = useCallback((day: number) => {
    if (user) {
      const updatedUser = { ...user, currentDay: day };
      setUser(updatedUser);
      localStorage.setItem('onboarding_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const setFirstLoginComplete = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, isFirstLogin: false };
      setUser(updatedUser);
      localStorage.setItem('onboarding_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateCurrentDay,
      setFirstLoginComplete,
    }}>
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
