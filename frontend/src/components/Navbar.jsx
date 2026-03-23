import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pageTitles = {
  '/': 'Dashboard',
  '/simulacao': 'Simulação Solar',
  '/mapa': 'Mapa Solar',
  '/orcamento': 'Orçamento',
};

export default function Navbar() {
  const { state } = useApp();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SolarMap AI';

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

        {/* User */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
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
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
            {state.user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
