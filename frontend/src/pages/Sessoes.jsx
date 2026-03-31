import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Monitor, Clock, Trash2, AlertTriangle, CheckCircle, XCircle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function parseUserAgent(ua) {
  if (!ua || ua === 'unknown') return { browser: 'Desconhecido', os: 'Desconhecido' };

  let browser = 'Navegador';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  let os = 'SO';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function Sessoes() {
  const { user, getSessions, revokeSession, revokeAllSessions, sessionInfo, getTimeRemaining } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  }, [getSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleRevoke(sessionId) {
    setRevoking(sessionId);
    const ok = await revokeSession(sessionId);
    if (ok) {
      setMessage({ type: 'success', text: 'Sessão encerrada com sucesso' });
      await loadSessions();
    } else {
      setMessage({ type: 'error', text: 'Erro ao encerrar sessão' });
    }
    setRevoking(null);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleRevokeAll() {
    if (!window.confirm('Deseja encerrar todas as outras sessões? Você continuará logado apenas nesta sessão.')) return;
    setRevokingAll(true);
    const result = await revokeAllSessions();
    if (result) {
      setMessage({ type: 'success', text: `${result.revoked} sessão(ões) encerrada(s)` });
      await loadSessions();
    } else {
      setMessage({ type: 'error', text: 'Erro ao encerrar sessões' });
    }
    setRevokingAll(false);
    setTimeout(() => setMessage(null), 3000);
  }

  const timeRemaining = getTimeRemaining();
  const activeSessions = sessions.filter(s => s.is_active && !s.is_expired);
  const inactiveSessions = sessions.filter(s => !s.is_active || s.is_expired);

  return (
    <div style={{ padding: '0', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} color="var(--gold)" />
          Gerenciamento de Sessões
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>
          Visualize e gerencie suas sessões ativas. Encerre sessões suspeitas para proteger sua conta.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.type === 'success' ? 'rgba(75,181,67,0.1)' : 'rgba(255,107,107,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(75,181,67,0.3)' : 'rgba(255,107,107,0.3)'}`,
          borderRadius: 'var(--r-sm)',
          padding: '12px 16px',
          marginBottom: '20px',
          color: message.type === 'success' ? 'var(--green)' : 'var(--coral)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* Current Session Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--gold-border)',
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} color="var(--gold)" />
            Sessão Atual
          </h2>
          <span className="tag tag-gold" style={{ fontSize: '0.7rem' }}>ATIVA</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Usuário
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name || '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{user?.email || '—'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Início da Sessão
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {sessionInfo ? formatDate(sessionInfo.created_at) : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tempo Restante
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: timeRemaining && timeRemaining.hours < 1 ? 'var(--coral)' : 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Clock size={14} />
              {timeRemaining
                ? timeRemaining.expired
                  ? 'Expirada'
                  : `${timeRemaining.hours}h ${timeRemaining.minutes}min`
                : '—'
              }
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Última Atividade
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {sessionInfo ? timeAgo(sessionInfo.last_activity) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={loadSessions}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Atualizar
        </button>

        {activeSessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: 'var(--r-sm)',
              background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
              color: 'var(--coral)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            {revokingAll ? 'Encerrando...' : 'Encerrar Todas as Outras'}
          </button>
        )}
      </div>

      {/* Active Sessions */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-2)' }}>
          Sessões Ativas ({activeSessions.length})
        </h3>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
            Carregando sessões...
          </div>
        ) : activeSessions.length === 0 ? (
          <div style={{
            padding: '32px', textAlign: 'center', color: 'var(--text-3)',
            background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border)',
          }}>
            Nenhuma sessão ativa encontrada.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeSessions.map(session => {
              const { browser, os } = parseUserAgent(session.user_agent);
              return (
                <div key={session.id} style={{
                  background: 'var(--bg-surface)',
                  border: session.is_current ? '1px solid var(--gold-border)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px',
                      background: session.is_current ? 'var(--gold-dim)' : 'var(--bg-card)',
                      border: `1px solid ${session.is_current ? 'var(--gold-border)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Monitor size={18} color={session.is_current ? 'var(--gold)' : 'var(--text-3)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                          {browser} — {os}
                        </span>
                        {session.is_current && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 600, color: 'var(--gold)',
                            background: 'var(--gold-dim)', padding: '2px 8px', borderRadius: '4px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            Esta sessão
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>
                        IP: {session.ip_address} · Criada: {formatDate(session.created_at)} · Última atividade: {timeAgo(session.last_activity)}
                      </div>
                    </div>
                  </div>

                  {!session.is_current && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      disabled={revoking === session.id}
                      title="Encerrar sessão"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: 'var(--r-sm)',
                        background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
                        color: 'var(--coral)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={14} />
                      {revoking === session.id ? '...' : 'Encerrar'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-3)' }}>
            Sessões Encerradas ({inactiveSessions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inactiveSessions.map(session => {
              const { browser, os } = parseUserAgent(session.user_agent);
              return (
                <div key={session.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: '14px 20px',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <XCircle size={16} color="var(--text-3)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-3)' }}>
                      {browser} — {os}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                      IP: {session.ip_address} · {formatDate(session.created_at)}
                      {session.is_expired ? ' · Expirada' : ' · Encerrada'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
