import React from 'react';

export default function Card({ children, style, className = '', ...props }) {
  return (
    <div
      className={`card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, change, positive = true, icon: Icon, color = 'var(--gold)' }) {
  return (
    <div className="card stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-label">{label}</span>
        {Icon && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-sm)',
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <span className="stat-value">{value}</span>
      {change && (
        <span className={`stat-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '+' : ''}{change}
        </span>
      )}
    </div>
  );
}
