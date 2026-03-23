import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/simulacao': 'Simulação Solar',
  '/mapa': 'Mapa Solar',
  '/orcamento': 'Orçamento',
};

const roleLabels = {
  admin: { label: 'Admin', color: 'var(--coral)' },
  consultor: { label: 'Consultor', color: 'var(--blue)' },
  usuario: { label: 'Usuário', color: 'var(--green)' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'SolarMap AI';
  const roleInfo = roleLabels[user?.role] || roleLabels.usuario;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
        <span className="tag tag-gold" style={{ fontSize: '0.65rem' }}>BETA</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          padding: '8px 14px',
          width: '240px',
        }}>
          <Search size={16} color="var(--text-3)" />
          <input
            type="text"
            placeholder="Buscar..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-1)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.85rem',
              width: '100%',
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          padding: '8px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Bell size={18} color="var(--text-2)" />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: 'var(--coral)',
            borderRadius: '50%',
          }} />
        </button>

        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--gold-dim)',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={16} color="var(--gold)" />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 500, display: 'block' }}>
              {user?.name || 'Usuário'}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: roleInfo.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sair"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LogOut size={18} color="var(--text-2)" />
        </button>
      </div>
    </header>
  );
}
