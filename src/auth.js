import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { loadToken, saveToken, setUnauthorizedHandler } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(async () => {
    await saveToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      try {
        if (await loadToken()) {
          const { user } = await api.get('/auth/me');
          setUser(user);
        }
      } catch {
        await saveToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, [logout]);

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password });
    await saveToken(d.token);
    setUser(d.user);
  };
  const register = async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password });
    await saveToken(d.token);
    setUser(d.user);
  };

  return <AuthCtx.Provider value={{ user, setUser, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
