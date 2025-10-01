import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (role: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'admin');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

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
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, user, login, logout }}>
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