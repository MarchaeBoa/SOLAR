import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_URL = '/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchSessionInfo();
    } else {
      setLoading(false);
    }
  }, []);

  // Check session expiry every minute
  useEffect(() => {
    if (!sessionExpiry) return;
    const interval = setInterval(() => {
      const now = new Date();
      const exp = new Date(sessionExpiry);
      if (now >= exp) {
        logout();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sessionExpiry]);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function fetchSessionInfo() {
    try {
      const res = await fetch(`${API_URL}/session-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessionInfo(data.session);
        if (data.token_exp) {
          setSessionExpiry(data.token_exp);
        }
      }
    } catch {
      // silent fail
    }
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    // Fetch session info after login
    setTimeout(() => fetchSessionInfoWithToken(data.token), 100);
    return data;
  }

  async function fetchSessionInfoWithToken(t) {
    try {
      const res = await fetch(`${API_URL}/session-info`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessionInfo(data.session);
        if (data.token_exp) {
          setSessionExpiry(data.token_exp);
        }
      }
    } catch {
      // silent
    }
  }

  async function register(name, email, password, role) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setTimeout(() => fetchSessionInfoWithToken(data.token), 100);
    return data;
  }

  async function logout() {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSessionInfo(null);
    setSessionExpiry(null);
  }

  const getSessions = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.sessions;
      }
    } catch {
      // silent
    }
    return [];
  }, [token]);

  const revokeSession = useCallback(async (sessionId) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [token]);

  const revokeAllSessions = useCallback(async () => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/sessions/revoke-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // silent
    }
    return false;
  }, [token]);

  function isRole(role) {
    return user?.role === role;
  }

  function hasRole(...roles) {
    return roles.includes(user?.role);
  }

  function getTimeRemaining() {
    if (!sessionExpiry) return null;
    const now = new Date();
    const exp = new Date(sessionExpiry);
    const diff = exp - now;
    if (diff <= 0) return { expired: true, hours: 0, minutes: 0 };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { expired: false, hours, minutes };
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      sessionInfo, sessionExpiry,
      login, register, logout,
      isRole, hasRole,
      getSessions, revokeSession, revokeAllSessions,
      getTimeRemaining,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
