import { createContext, useContext, useState, useEffect } from 'react';
import { accounts } from '../services/api';

interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockUntil?: string;
  profile: {
    department?: string;
    phone?: string;
    timezone?: string;
    language?: string;
  };
  activity: {
    totalLogins: number;
    lastActivity: string;
    issuesCreated: number;
    issuesResolved: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
  isValidating: boolean;
  login: (role: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate token on mount
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, user not logged in');
      setIsValidating(false);
      return;
    }

    try {
      console.log('Validating token...', token.substring(0, 20) + '...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token validation timeout')), 10000)
      );
      
      // Try to fetch current user to validate token
      const currentUser = await Promise.race([
        accounts.getMe(),
        timeoutPromise
      ]) as any;
      
      console.log('Token validation successful:', currentUser);
      
      // Token is valid, set user state
      setIsLoggedIn(true);
      setIsAdmin(currentUser.role === 'admin');
      setUser(currentUser);
      
      // Update localStorage with fresh data
      localStorage.setItem('userRole', currentUser.role);
      localStorage.setItem('userData', JSON.stringify(currentUser));
    } catch (error) {
      // Token is invalid, clear everything
      console.log('Token validation failed, clearing auth state:', error);
      logout();
    } finally {
      setIsValidating(false);
    }
  };

  const login = (role: string, userData?: User) => {
    setIsLoggedIn(true);
    setIsAdmin(role === 'admin');
    localStorage.setItem('userRole', role);
    if (userData) {
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, user, isValidating, login, logout }}>
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