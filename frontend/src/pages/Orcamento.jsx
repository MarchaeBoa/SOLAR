import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Send, Package, ArrowRight, CreditCard, Sun, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const catalogoProdutos = [
  { id: 1, nome: 'Painel Solar 550W Monocristalino', categoria: 'Painéis', preco: 1150, unidade: 'un' },
  { id: 2, nome: 'Painel Solar 450W Policristalino', categoria: 'Painéis', preco: 890, unidade: 'un' },
  { id: 3, nome: 'Inversor String 5kW', categoria: 'Inversores', preco: 4200, unidade: 'un' },
  { id: 4, nome: 'Inversor String 10kW', categoria: 'Inversores', preco: 7800, unidade: 'un' },
  { id: 5, nome: 'Inversor Microinversor 1.5kW', categoria: 'Inversores', preco: 2400, unidade: 'un' },
  { id: 6, nome: 'Estrutura Telhado Cerâmico (kit)', categoria: 'Estrutura', preco: 320, unidade: 'kit' },
  { id: 7, nome: 'Estrutura Telhado Metálico (kit)', categoria: 'Estrutura', preco: 280, unidade: 'kit' },
  { id: 8, nome: 'Cabo Solar 6mm (metro)', categoria: 'Cabos', preco: 12, unidade: 'm' },
  { id: 9, nome: 'String Box CC/CA', categoria: 'Proteção', preco: 450, unidade: 'un' },
  { id: 10, nome: 'Serviço de Instalação', categoria: 'Serviço', preco: 3500, unidade: 'un' },
];

// Map kit components to catalog products
function gerarItensDoKit(kit) {
  const itens = [];
  // Painéis - use 550W mono for bifacial/mono, 450W for poli
  const painelId = kit.modelo_painel.toLowerCase().includes('poli') ? 2 : 1;
  const painel = catalogoProdutos.find(p => p.id === painelId);
  itens.push({ ...painel, qtd: kit.paineis });

  // Inversor - match by power
  const potencia = kit.potencia_kwp;
  let inversorId;
  if (potencia <= 3) inversorId = 5;      // Microinversor
  else if (potencia <= 8) inversorId = 3;  // String 5kW
  else inversorId = 4;                      // String 10kW
  const inversor = catalogoProdutos.find(p => p.id === inversorId);
  const qtdInversores = potencia > 25 ? Math.ceil(potencia / 10) : 1;
  itens.push({ ...inversor, qtd: qtdInversores });

  // Estrutura
  const estrutura = catalogoProdutos.find(p => p.id === 6);
  itens.push({ ...estrutura, qtd: Math.ceil(kit.paineis / 4) });

  // Cabos (estimate ~5m per panel)
  const cabo = catalogoProdutos.find(p => p.id === 8);
  itens.push({ ...cabo, qtd: kit.paineis * 5 });

  // String Box
  const stringBox = catalogoProdutos.find(p => p.id === 9);
  itens.push({ ...stringBox, qtd: Math.ceil(kit.paineis / 12) });

  // Instalação
  const instalacao = catalogoProdutos.find(p => p.id === 10);
  itens.push({ ...instalacao, qtd: 1 });

  return itens;
}

// Map simulation results to catalog products
function gerarItensDeSimulacao(resultado) {
  const itens = [];
  const paineis = resultado.paineis || 0;
  if (paineis <= 0) return itens;

  const painel = catalogoProdutos.find(p => p.id === 1);
  itens.push({ ...painel, qtd: paineis });

  const potencia = parseFloat(resultado.potenciaKWp) || 0;
  let inversorId;
  if (potencia <= 3) inversorId = 5;
  else if (potencia <= 8) inversorId = 3;
  else inversorId = 4;
  const inversor = catalogoProdutos.find(p => p.id === inversorId);
  itens.push({ ...inversor, qtd: potencia > 25 ? Math.ceil(potencia / 10) : 1 });

  const estrutura = catalogoProdutos.find(p => p.id === 6);
  itens.push({ ...estrutura, qtd: Math.ceil(paineis / 4) });

  const cabo = catalogoProdutos.find(p => p.id === 8);
  itens.push({ ...cabo, qtd: paineis * 5 });

  const stringBox = catalogoProdutos.find(p => p.id === 9);
  itens.push({ ...stringBox, qtd: Math.ceil(paineis / 12) });

  const instalacao = catalogoProdutos.find(p => p.id === 10);
  itens.push({ ...instalacao, qtd: 1 });

  return itens;
}

export default function Orcamento() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [cliente, setCliente] = useState('');
  const [preFilledFrom, setPreFilledFrom] = useState(null);

  // Pre-fill from kit or simulation
  useEffect(() => {
    if (state.kitSelecionado && itens.length === 0) {
      const kitItens = gerarItensDoKit(state.kitSelecionado);
      setItens(kitItens);
      setPreFilledFrom({ type: 'kit', name: state.kitSelecionado.nome });
    } else if (state.simulacao.resultado && !state.kitSelecionado && itens.length === 0) {
      const simItens = gerarItensDeSimulacao(state.simulacao.resultado);
      if (simItens.length > 0) {
        setItens(simItens);
        setPreFilledFrom({ type: 'simulacao', name: `${state.simulacao.resultado.potenciaKWp} kWp` });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const adicionarItem = (produto) => {
    const existente = itens.find(i => i.id === produto.id);
    if (existente) {
      setItens(itens.map(i =>
        i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i
      ));
    } else {
      setItens([...itens, { ...produto, qtd: 1 }]);
    }
  };

  const atualizarQtd = (id, qtd) => {
    if (qtd <= 0) {
      setItens(itens.filter(i => i.id !== id));
    } else {
      setItens(itens.map(i => i.id === id ? { ...i, qtd } : i));
    }
  };

  const removerItem = (id) => {
    setItens(itens.filter(i => i.id !== id));
  };

  const subtotal = itens.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  const descontoValor = subtotal * (desconto / 100);
  const total = subtotal - descontoValor;

  const salvarOrcamento = () => {
    dispatch({
      type: 'SET_ORCAMENTO',
      payload: { itens, total, desconto },
    });
  };

  const irParaFinanciamento = () => {
    salvarOrcamento();
    navigate('/financiamento');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text-1)',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.88rem',
    outline: 'none',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orçamento</h1>
        <p>Monte orçamentos detalhados para projetos solares</p>
      </div>

      {/* Banner: pre-filled origin */}
      {preFilledFrom && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          background: preFilledFrom.type === 'kit' ? 'var(--gold-dim)' : 'var(--green-dim)',
          border: `1px solid ${preFilledFrom.type === 'kit' ? 'var(--gold-border)' : 'var(--green-border)'}`,
          borderRadius: 'var(--r-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          color: preFilledFrom.type === 'kit' ? 'var(--gold)' : 'var(--green)',
        }}>
          {preFilledFrom.type === 'kit' ? <Sun size={16} /> : <AlertCircle size={16} />}
          <span>
            Orçamento pré-preenchido a partir {preFilledFrom.type === 'kit' ? 'do kit' : 'da simulação'}:{' '}
            <strong>{preFilledFrom.name}</strong>
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Products catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Package size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Catálogo de Produtos</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {catalogoProdutos.map((produto) => (
                <div key={produto.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{produto.nome}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{produto.categoria}</span>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>
                        {formatCurrency(produto.preco)}/{produto.unidade}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => adicionarItem(produto)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: 'var(--gold-dim)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--gold)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card style={{ borderColor: 'var(--gold-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <FileText size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Resumo do Orçamento</h3>
            </div>

            {/* Client */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                Cliente
              </label>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Items */}
            {itens.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {itens.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.nome}
                      </div>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {formatCurrency(item.preco * item.qtd)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <input
                        type="number"
                        min="0"
                        value={item.qtd}
                        onChange={e => atualizarQtd(item.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          padding: '4px 6px',
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border-mid)',
                          borderRadius: '4px',
                          color: 'var(--text-1)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button onClick={() => removerItem(item.id)} style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--coral)',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}>
                Adicione itens do catálogo
              </div>
            )}

            {/* Discount */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={desconto}
                onChange={e => setDesconto(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-2)' }}>Subtotal</span>
                <span className="mono">{formatCurrency(subtotal)}</span>
              </div>
              {desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--green)' }}>Desconto ({desconto}%)</span>
                  <span className="mono" style={{ color: 'var(--green)' }}>-{formatCurrency(descontoValor)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span className="mono" style={{ color: 'var(--gold)' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={salvarOrcamento} style={{ flex: 1 }}>
                <Download size={16} /> Salvar
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                <Send size={16} /> Enviar
              </button>
            </div>

            {/* Navigate to financing */}
            {total > 0 && (
              <button
                className="btn btn-primary"
                onClick={irParaFinanciamento}
                style={{ width: '100%', justifyContent: 'center', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
              >
                <CreditCard size={16} /> Simular Financiamento <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
