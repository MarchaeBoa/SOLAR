import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useRegional } from '../context/RegionalContext';
import { SUPPORTED_CURRENCIES, getExchangeRate } from '../utils/currencyConverter';

export default function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, currency } = useRegional();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = SUPPORTED_CURRENCIES.find(c => c.code === displayCurrency) || SUPPORTED_CURRENCIES[0];
  const baseCurrency = currency.code || 'BRL';
  const rate = getExchangeRate(baseCurrency, displayCurrency);

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
        <RefreshCw size={13} color="var(--gold)" />
        <span style={{ fontSize: '1rem' }}>{current.flag}</span>
        <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{current.code}</span>
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
          width: '260px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          zIndex: 1000,
          padding: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 10px 10px',
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-3)',
          }}>
            <RefreshCw size={10} style={{ display: 'inline', marginRight: '4px' }} />
            Moeda de exibição
          </div>

          {SUPPORTED_CURRENCIES.map((cur) => {
            const isActive = cur.code === displayCurrency;
            const curRate = getExchangeRate(baseCurrency, cur.code);
            return (
              <button
                key={cur.code}
                onClick={() => { setDisplayCurrency(cur.code); setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'background 0.15s',
                  marginBottom: '2px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.15rem' }}>{cur.flag}</span>
                  <span>
                    <span style={{ fontWeight: 600 }}>{cur.code}</span>
                    <span style={{ color: 'var(--text-3)', marginLeft: '6px', fontSize: '0.78rem' }}>
                      {cur.name}
                    </span>
                  </span>
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  color: isActive ? 'var(--gold)' : 'var(--text-3)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {cur.code === baseCurrency ? '1.00' : curRate.toFixed(2)}x
                </span>
              </button>
            );
          })}

          <div style={{
            marginTop: '6px',
            padding: '8px 12px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--r-sm)',
            fontSize: '0.7rem',
            color: 'var(--text-3)',
            lineHeight: 1.4,
          }}>
            Taxas simuladas (mock). Base: {baseCurrency}
          </div>
        </div>
      )}
    </div>
  );
}
