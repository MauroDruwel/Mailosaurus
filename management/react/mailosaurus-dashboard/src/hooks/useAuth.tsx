import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { api } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userPrivileges: string[];
  isAdmin: boolean;
  login: (email: string, password: string, token?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPrivileges, setUserPrivileges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = api.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUserEmail(localStorage.getItem('user_email'));
      // Try to get stored privileges or fetch them
      const storedPrivileges = localStorage.getItem('user_privileges');
      if (storedPrivileges) {
        setUserPrivileges(JSON.parse(storedPrivileges));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, token?: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await api.login(email, password, token);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUserEmail(email);
        const privileges = response.data?.privileges || [];
        setUserPrivileges(privileges);
        
        // Store privileges for persistence
        localStorage.setItem('user_privileges', JSON.stringify(privileges));
        
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        // Check if it's a missing TOTP token error
        if (response.error === 'missing-totp-token') {
          throw new Error('missing-totp-token');
        }
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserPrivileges([]);
    localStorage.removeItem('user_privileges');
  };

  const isAdmin = userPrivileges.includes('admin');

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userEmail, 
      userPrivileges, 
      isAdmin, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
