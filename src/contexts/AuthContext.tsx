
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, loginUser, logoutUser, registerUser } from '@/utils/auth';
import { UserAuth } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserAuth | null;
  isAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(getCurrentUser());
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated());
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAuth(!!currentUser);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = loginUser(email, password);
      setUser(user);
      setIsAuth(true);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const user = registerUser(email, password);
      setUser(user);
      setIsAuth(true);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed: ' + (error as Error).message);
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuth(false);
    navigate('/login');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, login, register, logout }}>
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
