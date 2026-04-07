import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    name: 'Usuário Solar',
    plano: 'Pro',
  },
  simulacao: {
    localizacao: '',
    areaM2: 0,
    consumoMensal: 0,
    tipoTelhado: 'ceramico',
    resultado: null,
  },
  // Área selecionada no mapa (conecta Mapa → Simulação)
  areaMapa: null,
  // Kit selecionado (conecta Kits → Orçamento/Financiamento)
  kitSelecionado: null,
  dashboard: {
    geracaoHoje: 42.8,
    geracaoMes: 1284,
    economiaTotal: 18420,
    co2Evitado: 2.4,
    eficiencia: 94.2,
    projetosAtivos: 12,
  },
  orcamento: {
    itens: [],
    total: 0,
    desconto: 0,
  },
  sidebarOpen: true,
  mobileMenuOpen: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SIMULACAO':
      return {
        ...state,
        simulacao: { ...state.simulacao, ...action.payload },
      };
    case 'SET_RESULTADO_SIMULACAO':
      return {
        ...state,
        simulacao: { ...state.simulacao, resultado: action.payload },
      };
    case 'SET_AREA_MAPA':
      return {
        ...state,
        areaMapa: action.payload,
      };
    case 'CLEAR_AREA_MAPA':
      return {
        ...state,
        areaMapa: null,
      };
    case 'SET_KIT_SELECIONADO':
      return {
        ...state,
        kitSelecionado: action.payload,
      };
    case 'CLEAR_KIT_SELECIONADO':
      return {
        ...state,
        kitSelecionado: null,
      };
    case 'SET_ORCAMENTO':
      return {
        ...state,
        orcamento: { ...state.orcamento, ...action.payload },
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case 'SET_MOBILE_MENU':
      return {
        ...state,
        mobileMenuOpen: action.payload,
      };
    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        mobileMenuOpen: !state.mobileMenuOpen,
      };
    case 'RESET_SIMULACAO':
      return {
        ...state,
        simulacao: initialState.simulacao,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
