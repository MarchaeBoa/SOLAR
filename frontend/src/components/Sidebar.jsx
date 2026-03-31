import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Map, FileText, Sun, ChevronLeft, Package, CreditCard, Ruler, Compass, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  LayoutDashboard,
  Zap,
  Map,
  FileText,
  Package,
  CreditCard,
  Ruler,
  Compass,
  MapPin,
};

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/simulacao', label: 'Simulação', icon: 'Zap' },
  { path: '/mapa', label: 'Mapa Solar', icon: 'Map' },
  { path: '/orcamento', label: 'Orçamento', icon: 'FileText' },
  { path: '/kits', label: 'Kits Solares', icon: 'Package' },
  { path: '/financiamento', label: 'Financiamento', icon: 'CreditCard' },
  { path: '/calculo-area', label: 'Cálculo de Área', icon: 'Ruler' },
  { path: '/posicao-solar', label: 'Posição Solar', icon: 'Compass' },
  { path: '/orcamento-regional', label: 'Orçamento Regional', icon: 'MapPin' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const open = state.sidebarOpen;
  const mobileOpen = state.mobileMenuOpen;

  // Close mobile menu on route change
  useEffect(() => {
    dispatch({ type: 'SET_MOBILE_MENU', payload: false });
  }, [location.pathname, dispatch]);

  function closeMobileMenu() {
    dispatch({ type: 'SET_MOBILE_MENU', payload: false });
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`} style={{
        width: open ? 'var(--sidebar-w)' : '72px',
        minWidth: open ? 'var(--sidebar-w)' : '72px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--t), min-width var(--t), transform 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'var(--gold-dim)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sun size={20} color="var(--gold)" />
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                SolarMap
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                AI Platform
              </div>
            </div>
          </div>
          {/* Close button - visible only on mobile via CSS */}
          <button
            className="sidebar-close-btn"
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
          >
            <X size={22} color="var(--text-2)" />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                  transition: 'all var(--t)',
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom - collapse toggle (hidden on mobile) */}
        <div className="sidebar-collapse-btn" style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: open ? '10px 14px' : '10px',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.85rem',
              color: 'var(--text-3)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              justifyContent: open ? 'flex-start' : 'center',
              transition: 'all var(--t)',
            }}
          >
            <ChevronLeft
              size={18}
              style={{
                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform var(--t)',
                flexShrink: 0,
              }}
            />
            {open && <span>Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
