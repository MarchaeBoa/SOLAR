import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid/expired - clear local state
        console.warn('Token inválido ou expirado. Fazendo logout.');
        clearAuth();
      }
    } catch (err) {
      // Network error - don't logout, might be temporary
      console.error('Erro de rede ao verificar sessão:', err.message);
      // Only clear if it's not a network error
      if (err.name !== 'TypeError') {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }

  function clearAuth() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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
    return data;
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
    } catch (err) {
      console.warn('Erro ao fazer logout no servidor:', err.message);
    }
    clearAuth();
  }

  function isRole(role) {
    return user?.role === role;
  }

  function hasRole(...roles) {
    return roles.includes(user?.role);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isRole, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
