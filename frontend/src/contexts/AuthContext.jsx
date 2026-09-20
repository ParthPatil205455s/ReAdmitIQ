import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(undefined);

// Demo credentials matching backend seed.py
const DEMO_CREDENTIALS = {
  doctor: { email: 'doctor@readmitiq.io', password: 'Doctor@123' },
  patient: { email: 'patient@readmitiq.io', password: 'Patient@123' },
  admin: { email: 'admin@readmitiq.io', password: 'Admin@123' },
};

function getStoredUser() {
  try {
    const raw = localStorage.getItem('readmitiq-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const _storeSession = (tokenData, userData) => {
    localStorage.setItem('readmitiq-token', tokenData.access_token);
    localStorage.setItem('readmitiq-refresh-token', tokenData.refresh_token);
    localStorage.setItem('readmitiq-user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      // OAuth2 password flow — FastAPI expects form-encoded data
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const { data: tokenData } = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Fetch user profile
      const { data: profile } = await client.get('/auth/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role.toLowerCase(),
        specialization: profile.specialization,
        avatar: null,
      };

      _storeSession(tokenData, userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const demoLogin = useCallback(async (role) => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) throw new Error(`Unknown demo role: ${role}`);
    return login(creds.email, creds.password);
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('readmitiq-user');
    localStorage.removeItem('readmitiq-token');
    localStorage.removeItem('readmitiq-refresh-token');
  }, []);

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, demoLogin, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
