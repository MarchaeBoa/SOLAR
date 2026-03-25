import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Mail, Lock, User, UserPlus, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('usuario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    { value: 'usuario', label: t.register.roleUser, desc: t.register.roleUserDesc },
    { value: 'consultor', label: t.register.roleConsultant, desc: t.register.roleConsultantDesc },
  ];

  const inputStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
  };

  const fieldStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-1)',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9rem',
    width: '100%',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '40px 32px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'var(--gold-dim)',
            border: '1px solid var(--gold-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Sun size={28} color="var(--gold)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{t.register.title}</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>{t.register.subtitle}</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            marginBottom: '20px',
            color: 'var(--coral)',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px' }}>
              {t.register.name}
            </label>
            <div style={inputStyle}>
              <User size={18} color="var(--text-3)" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.register.namePlaceholder}
                required
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px' }}>
              {t.register.email}
            </label>
            <div style={inputStyle}>
              <Mail size={18} color="var(--text-3)" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.register.emailPlaceholder}
                required
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px' }}>
              {t.register.profile}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-sm)',
                    border: role === r.value ? '1px solid var(--gold)' : '1px solid var(--border)',
                    background: role === r.value ? 'var(--gold-dim)' : 'var(--bg-card)',
                    color: role === r.value ? 'var(--gold)' : 'var(--text-2)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {r.value === 'usuario' ? <User size={14} /> : <Briefcase size={14} />}
                    {r.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.7 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px' }}>
              {t.register.password}
            </label>
            <div style={inputStyle}>
              <Lock size={18} color="var(--text-3)" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.register.passwordPlaceholder}
                required
                minLength={6}
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px' }}>
              {t.register.confirmPassword}
            </label>
            <div style={inputStyle}>
              <Lock size={18} color="var(--text-3)" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t.register.confirmPlaceholder}
                required
                style={fieldStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <UserPlus size={18} />
            {loading ? t.register.loading : t.register.submit}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-3)' }}>
          {t.register.hasAccount}{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
            {t.register.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
