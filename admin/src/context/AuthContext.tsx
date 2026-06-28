import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wg_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('wg_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('wg_token', newToken);
    setToken(newToken);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('wg_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
