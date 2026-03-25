import React, { useState, useMemo } from 'react';
import {
  Sun, Zap, DollarSign, Gauge, ChevronDown, ChevronUp,
  Check, X, ArrowRight, Package, Shield, BarChart3,
  Scale, Star, Filter, Leaf, FileText, CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Mock data (mesma estrutura do backend)
const KITS_DATA = [
  {
    id: 1,
    nome: 'Kit Residencial Básico',
    descricao: 'Ideal para residências com baixo consumo energético. Perfeito para apartamentos e casas pequenas.',
    potencia_kwp: 2.0,
    eficiencia: 18.5,
    preco: 12500.00,
    paineis: 5,
    modelo_painel: 'Mono PERC 400W',
    inversor: 'Micro-inversor 2kW',
    garantia_anos: 25,
    area_necessaria_m2: 10.5,
    geracao_mensal_kwh: 260,
    economia_mensal_estimada: 195.00,
    payback_anos: 5.3,
    categoria: 'residencial',
    destaque: false,
    inclui: [
      '5x Painéis Solares Mono PERC 400W',
      '1x Micro-inversor 2kW',
      'Estrutura de fixação completa',
      'Cabeamento e conectores',
      'Projeto elétrico',
      'Instalação inclusa',
    ],
  },
  {
    id: 2,
    nome: 'Kit Residencial Plus',
    descricao: 'Para residências com consumo médio. Excelente custo-benefício para famílias de 3-4 pessoas.',
    potencia_kwp: 4.0,
    eficiencia: 20.2,
    preco: 22800.00,
    paineis: 8,
    modelo_painel: 'Mono PERC 500W',
    inversor: 'Inversor String 4kW',
    garantia_anos: 25,
    area_necessaria_m2: 18.0,
    geracao_mensal_kwh: 520,
    economia_mensal_estimada: 390.00,
    payback_anos: 4.9,
    categoria: 'residencial',
    destaque: true,
    inclui: [
      '8x Painéis Solares Mono PERC 500W',
      '1x Inversor String 4kW',
      'Estrutura de fixação completa',
      'Cabeamento e conectores',
      'String Box com proteções',
      'Projeto elétrico',
      'Instalação inclusa',
      'Monitoramento Wi-Fi',
    ],
  },
  {
    id: 3,
    nome: 'Kit Residencial Premium',
    descricao: 'Alto desempenho para residências com consumo elevado. Tecnologia bifacial de última geração.',
    potencia_kwp: 6.5,
    eficiencia: 21.8,
    preco: 35900.00,
    paineis: 12,
    modelo_painel: 'Bifacial 545W',
    inversor: 'Inversor Híbrido 6.5kW',
    garantia_anos: 30,
    area_necessaria_m2: 28.0,
    geracao_mensal_kwh: 845,
    economia_mensal_estimada: 633.75,
    payback_anos: 4.7,
    categoria: 'residencial',
    destaque: false,
    inclui: [
      '12x Painéis Bifaciais 545W',
      '1x Inversor Híbrido 6.5kW',
      'Estrutura de fixação premium',
      'Cabeamento e conectores',
      'String Box com proteções',
      'Projeto elétrico completo',
      'Instalação inclusa',
      'Monitoramento Wi-Fi + App',
      'Compatível com bateria',
    ],
  },
  {
    id: 4,
    nome: 'Kit Comercial Starter',
    descricao: 'Solução inicial para pequenos comércios. Reduz significativamente a conta de energia.',
    potencia_kwp: 10.0,
    eficiencia: 20.5,
    preco: 52000.00,
    paineis: 20,
    modelo_painel: 'Mono PERC 500W',
    inversor: 'Inversor String 10kW',
    garantia_anos: 25,
    area_necessaria_m2: 45.0,
    geracao_mensal_kwh: 1300,
    economia_mensal_estimada: 975.00,
    payback_anos: 4.4,
    categoria: 'comercial',
    destaque: false,
    inclui: [
      '20x Painéis Solares Mono PERC 500W',
      '1x Inversor String 10kW',
      'Estrutura de fixação industrial',
      'Cabeamento e conectores',
      'String Box com proteções',
      'Projeto elétrico completo',
      'Instalação inclusa',
      'Monitoramento remoto',
      'Laudo técnico',
    ],
  },
  {
    id: 5,
    nome: 'Kit Comercial Pro',
    descricao: 'Para médias empresas e comércios com alto consumo. Máxima eficiência e retorno rápido.',
    potencia_kwp: 20.0,
    eficiencia: 22.0,
    preco: 98500.00,
    paineis: 36,
    modelo_painel: 'Bifacial 555W',
    inversor: 'Inversor Trifásico 20kW',
    garantia_anos: 30,
    area_necessaria_m2: 85.0,
    geracao_mensal_kwh: 2600,
    economia_mensal_estimada: 1950.00,
    payback_anos: 4.2,
    categoria: 'comercial',
    destaque: true,
    inclui: [
      '36x Painéis Bifaciais 555W',
      '1x Inversor Trifásico 20kW',
      'Estrutura de fixação industrial reforçada',
      'Cabeamento e conectores premium',
      '2x String Box com proteções',
      'Projeto elétrico completo',
      'Instalação inclusa',
      'Monitoramento remoto + App',
      'Laudo técnico + ART',
      'Seguro contra intempéries (1 ano)',
    ],
  },
  {
    id: 6,
    nome: 'Kit Industrial',
    descricao: 'Solução robusta para indústrias e grandes empresas. Geração em larga escala com tecnologia de ponta.',
    potencia_kwp: 50.0,
    eficiencia: 22.5,
    preco: 235000.00,
    paineis: 90,
    modelo_painel: 'Bifacial 555W',
    inversor: '2x Inversor Central 25kW',
    garantia_anos: 30,
    area_necessaria_m2: 210.0,
    geracao_mensal_kwh: 6500,
    economia_mensal_estimada: 4875.00,
    payback_anos: 4.0,
    categoria: 'industrial',
    destaque: false,
    inclui: [
      '90x Painéis Bifaciais 555W',
      '2x Inversor Central 25kW',
      'Estrutura de fixação industrial pesada',
      'Cabeamento e conectores premium',
      '4x String Box com proteções',
      'Projeto elétrico completo',
      'Instalação inclusa',
      'Sistema de monitoramento SCADA',
      'Laudo técnico + ART',
      'Seguro contra intempéries (2 anos)',
      'Manutenção preventiva (1 ano)',
    ],
  },
];

const categorias = [
  { value: 'todos', label: 'Todos' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
];

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Kit Card ───────────────────────────────────────────
function KitCard({ kit, selected, onSelect, onToggleCompare, isComparing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isComparing ? 'var(--gold-border)' : selected ? 'var(--green-border)' : 'var(--border)'}`,
      borderRadius: 'var(--r)',
      padding: 0,
      transition: 'all var(--t)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Destaque badge */}
      {kit.destaque && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'var(--gold-dim)',
          border: '1px solid var(--gold-border)',
          borderRadius: 99,
          padding: '4px 10px',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          zIndex: 2,
        }}>
          <Star size={12} /> Mais Vendido
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '24px 24px 0 24px',
      }}>
        {/* Categoria tag */}
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: kit.categoria === 'residencial' ? 'var(--green)' :
                 kit.categoria === 'comercial' ? 'var(--blue)' : 'var(--gold)',
          background: kit.categoria === 'residencial' ? 'var(--green-dim)' :
                      kit.categoria === 'comercial' ? 'var(--blue-dim)' : 'var(--gold-dim)',
          padding: '3px 10px',
          borderRadius: 99,
        }}>
          {kit.categoria}
        </span>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 12, marginBottom: 6 }}>
          {kit.nome}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 16 }}>
          {kit.descricao}
        </p>

        {/* Preço */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--gold)',
          }}>
            {formatCurrency(kit.preco)}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
            ou 12x de {formatCurrency(kit.preco / 12)}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        background: 'var(--border)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <StatItem icon={Zap} label="Potência" value={`${kit.potencia_kwp} kWp`} color="var(--gold)" />
        <StatItem icon={Gauge} label="Eficiência" value={`${kit.eficiencia}%`} color="var(--green)" />
        <StatItem icon={BarChart3} label="Geração/mês" value={`${kit.geracao_mensal_kwh} kWh`} color="var(--blue)" />
        <StatItem icon={DollarSign} label="Economia/mês" value={formatCurrency(kit.economia_mensal_estimada)} color="var(--green)" />
      </div>

      {/* Extra info */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <MiniStat label="Painéis" value={kit.paineis} />
          <MiniStat label="Garantia" value={`${kit.garantia_anos} anos`} />
          <MiniStat label="Payback" value={`${kit.payback_anos} anos`} />
          <MiniStat label="Área" value={`${kit.area_necessaria_m2} m²`} />
        </div>

        {/* Expandir detalhes */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif',
            padding: '4px 0',
            marginBottom: 12,
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Ocultar detalhes' : 'Ver o que inclui'}
        </button>

        {expanded && (
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--r-sm)',
            padding: 16,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-2)' }}>
              <Package size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Itens inclusos:
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {kit.inclui.map((item, i) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={13} color="var(--green)" style={{ flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)',
              fontSize: '0.78rem', color: 'var(--text-3)',
            }}>
              <Shield size={13} color="var(--gold)" />
              Modelo painel: {kit.modelo_painel} · Inversor: {kit.inversor}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSelect(kit)}
            className="btn btn-primary"
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.82rem',
              padding: '10px 16px',
            }}
          >
            Selecionar <ArrowRight size={15} />
          </button>
          <button
            onClick={() => onToggleCompare(kit.id)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '10px 14px',
              background: isComparing ? 'var(--gold-dim)' : undefined,
              borderColor: isComparing ? 'var(--gold-border)' : undefined,
              color: isComparing ? 'var(--gold)' : undefined,
            }}
          >
            <Scale size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.88rem', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Comparison Table ───────────────────────────────────
function ComparisonPanel({ kits, onClose, onRemove }) {
  if (kits.length < 2) return null;

  const metrics = [
    { key: 'potencia_kwp', label: 'Potência', suffix: ' kWp', best: 'max', icon: Zap, color: 'var(--gold)' },
    { key: 'eficiencia', label: 'Eficiência', suffix: '%', best: 'max', icon: Gauge, color: 'var(--green)' },
    { key: 'preco', label: 'Preço', format: formatCurrency, best: 'min', icon: DollarSign, color: 'var(--gold)' },
    { key: 'geracao_mensal_kwh', label: 'Geração/mês', suffix: ' kWh', best: 'max', icon: BarChart3, color: 'var(--blue)' },
    { key: 'economia_mensal_estimada', label: 'Economia/mês', format: formatCurrency, best: 'max', icon: DollarSign, color: 'var(--green)' },
    { key: 'payback_anos', label: 'Payback', suffix: ' anos', best: 'min', icon: Leaf, color: 'var(--green)' },
    { key: 'paineis', label: 'Painéis', suffix: '', best: 'max', icon: Sun, color: 'var(--gold)' },
    { key: 'garantia_anos', label: 'Garantia', suffix: ' anos', best: 'max', icon: Shield, color: 'var(--blue)' },
    { key: 'area_necessaria_m2', label: 'Área necessária', suffix: ' m²', best: 'min', icon: Package, color: 'var(--text-2)' },
  ];

  function getBest(key, best) {
    const values = kits.map(k => k[key]);
    return best === 'max' ? Math.max(...values) : Math.min(...values);
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--gold-border)',
      borderRadius: 'var(--r-lg)',
      padding: 28,
      marginBottom: 32,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Scale size={20} color="var(--gold)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Comparativo de Kits</h2>
          <span className="tag tag-gold" style={{ fontSize: '0.62rem' }}>
            {kits.length} KITS
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--text-2)',
            fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <X size={14} /> Fechar
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '12px 16px',
                fontSize: '0.75rem',
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderBottom: '1px solid var(--border)',
                fontWeight: 500,
              }}>
                Métrica
              </th>
              {kits.map(kit => (
                <th key={kit.id} style={{
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  minWidth: 160,
                }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{kit.nome}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>{kit.categoria}</div>
                  <button
                    onClick={() => onRemove(kit.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--coral)',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontFamily: 'Outfit, sans-serif',
                      marginTop: 4,
                    }}
                  >
                    Remover
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const bestVal = getBest(metric.key, metric.best);
              return (
                <tr key={metric.key}>
                  <td style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.82rem',
                    color: 'var(--text-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <metric.icon size={14} color={metric.color} />
                    {metric.label}
                  </td>
                  {kits.map(kit => {
                    const val = kit[metric.key];
                    const isBest = val === bestVal;
                    const display = metric.format ? metric.format(val) : `${val}${metric.suffix}`;
                    return (
                      <td key={kit.id} style={{
                        textAlign: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.85rem',
                        fontWeight: isBest ? 700 : 400,
                        color: isBest ? 'var(--green)' : 'var(--text-1)',
                        background: isBest ? 'var(--green-dim)' : 'transparent',
                      }}>
                        {display}
                        {isBest && <span style={{ marginLeft: 6, fontSize: '0.7rem' }}>★</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Selected Kit Detail ────────────────────────────────
function SelectedKitPanel({ kit, onClose, onGoOrcamento, onGoFinanciamento }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--green-border)',
      borderRadius: 'var(--r-lg)',
      padding: 28,
      marginBottom: 32,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Check size={20} color="var(--green)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Kit Selecionado</h2>
            <span className="tag tag-green" style={{ fontSize: '0.62rem' }}>SELECIONADO</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>{kit.nome}</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginTop: 4 }}>{kit.descricao}</p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--text-2)',
            fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <X size={14} /> Fechar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <SummaryBox icon={DollarSign} label="Preço Total" value={formatCurrency(kit.preco)} color="var(--gold)" />
        <SummaryBox icon={Zap} label="Potência" value={`${kit.potencia_kwp} kWp`} color="var(--gold)" />
        <SummaryBox icon={Gauge} label="Eficiência" value={`${kit.eficiencia}%`} color="var(--green)" />
        <SummaryBox icon={BarChart3} label="Geração Mensal" value={`${kit.geracao_mensal_kwh} kWh`} color="var(--blue)" />
        <SummaryBox icon={DollarSign} label="Economia/mês" value={formatCurrency(kit.economia_mensal_estimada)} color="var(--green)" />
        <SummaryBox icon={Leaf} label="Payback" value={`${kit.payback_anos} anos`} color="var(--green)" />
      </div>

      {/* Flow navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onGoOrcamento}
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <FileText size={16} /> Gerar Orçamento <ArrowRight size={14} />
        </button>
        <button
          onClick={onGoFinanciamento}
          className="btn btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <CreditCard size={16} /> Simular Financiamento <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function SummaryBox({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function KitsSolares() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [compareIds, setCompareIds] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);

  const kitsFiltrados = useMemo(() => {
    if (filtroCategoria === 'todos') return KITS_DATA;
    return KITS_DATA.filter(k => k.categoria === filtroCategoria);
  }, [filtroCategoria]);

  const kitsComparacao = useMemo(() => {
    return KITS_DATA.filter(k => compareIds.includes(k.id));
  }, [compareIds]);

  function toggleCompare(id) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSelect(kit) {
    setSelectedKit(kit);
    dispatch({ type: 'SET_KIT_SELECIONADO', payload: kit });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sun size={28} color="var(--gold)" />
              Kits Solares
            </h1>
            <p>Selecione e compare os melhores kits fotovoltaicos para sua necessidade.</p>
          </div>
          {compareIds.length >= 2 && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-primary"
            >
              <Scale size={16} /> Comparar ({compareIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Selected kit panel */}
      {selectedKit && (
        <SelectedKitPanel
          kit={selectedKit}
          onClose={() => {
            setSelectedKit(null);
            dispatch({ type: 'CLEAR_KIT_SELECIONADO' });
          }}
          onGoOrcamento={() => navigate('/orcamento')}
          onGoFinanciamento={() => navigate('/financiamento')}
        />
      )}

      {/* Comparison panel */}
      {kitsComparacao.length >= 2 && (
        <ComparisonPanel
          kits={kitsComparacao}
          onClose={() => setCompareIds([])}
          onRemove={(id) => toggleCompare(id)}
        />
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <Filter size={16} color="var(--text-3)" />
        {categorias.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFiltroCategoria(cat.value)}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              border: '1px solid',
              borderColor: filtroCategoria === cat.value ? 'var(--gold-border)' : 'var(--border)',
              background: filtroCategoria === cat.value ? 'var(--gold-dim)' : 'var(--bg-card)',
              color: filtroCategoria === cat.value ? 'var(--gold)' : 'var(--text-2)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--t)',
            }}
          >
            {cat.label}
          </button>
        ))}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginLeft: 8 }}>
          {kitsFiltrados.length} kit{kitsFiltrados.length !== 1 ? 's' : ''} encontrado{kitsFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Kits grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 20,
      }}>
        {kitsFiltrados.map(kit => (
          <KitCard
            key={kit.id}
            kit={kit}
            selected={selectedKit?.id === kit.id}
            onSelect={handleSelect}
            onToggleCompare={toggleCompare}
            isComparing={compareIds.includes(kit.id)}
          />
        ))}
      </div>
    </div>
  );
}
