import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          color: 'var(--text-1)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontFamily: 'Outfit, sans-serif',
          transition: 'all 0.2s',
        }}
      >
        <Globe size={13} color="var(--blue)" />
        <span style={{ fontSize: '1rem' }}>{current.flag}</span>
        <span style={{ fontWeight: 600 }}>{current.code.toUpperCase()}</span>
        <ChevronDown size={13} style={{
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          color: 'var(--text-3)',
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          width: '200px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          zIndex: 1000,
          padding: '6px',
        }}>
          {languages.map((lang) => {
            const isActive = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
                  borderRadius: 'var(--r-sm)',
                  color: isActive ? 'var(--gold)' : 'var(--text-1)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'background 0.15s',
                  marginBottom: '2px',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>{lang.flag}</span>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
