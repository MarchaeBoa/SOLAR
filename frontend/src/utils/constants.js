export const TIPOS_TELHADO = [
  { id: 'ceramico', label: 'Cerâmico', fator: 1.0 },
  { id: 'metalico', label: 'Metálico', fator: 1.05 },
  { id: 'fibrocimento', label: 'Fibrocimento', fator: 0.95 },
  { id: 'laje', label: 'Laje', fator: 1.1 },
  { id: 'solo', label: 'Solo', fator: 1.15 },
];

export const IRRADIACAO_MEDIA = {
  norte: 5.5,
  nordeste: 5.8,
  centro_oeste: 5.4,
  sudeste: 4.8,
  sul: 4.3,
};

export const EFICIENCIA_PAINEL = 0.20;
export const CUSTO_KWP = 4500;
export const PRECO_KWH = 0.85;
export const VIDA_UTIL_ANOS = 25;

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/simulacao', label: 'Simulação', icon: 'Zap' },
  { path: '/mapa', label: 'Mapa Solar', icon: 'Map' },
  { path: '/orcamento', label: 'Orçamento', icon: 'FileText' },
];
