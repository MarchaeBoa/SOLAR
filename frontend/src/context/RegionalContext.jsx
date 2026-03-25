import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { formatCurrency } from '../utils/formatters';
import { convertCurrency, getCurrencyInfo } from '../utils/currencyConverter';

const RegionalContext = createContext();

const initialState = {
  country: {
    code: 'BR',
    name: 'Brazil',
    name_local: 'Brasil',
    region: 'south_america',
    locale: 'pt-BR',
  },
  currency: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
  },
  pricing: {
    cost_kwp: 4500,
    energy_tariff: 0.85,
    cost_multiplier: 1.0,
    tax_percent: 0,
    installation_base: 3500,
    labor_multiplier: 1.0,
    irradiation_avg: 5.2,
  },
  displayCurrency: 'BRL',
  countries: [],
  regions: [],
  averageCosts: [],
  loading: false,
  error: null,
};

function regionalReducer(state, action) {
  switch (action.type) {
    case 'SET_COUNTRY':
      return {
        ...state,
        country: action.payload.country,
        currency: action.payload.currency,
        pricing: action.payload.pricing,
      };
    case 'SET_COUNTRIES':
      return { ...state, countries: action.payload };
    case 'SET_REGIONS':
      return { ...state, regions: action.payload };
    case 'SET_AVERAGE_COSTS':
      return { ...state, averageCosts: action.payload };
    case 'SET_DISPLAY_CURRENCY':
      return { ...state, displayCurrency: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function RegionalProvider({ children }) {
  const [state, dispatch] = useReducer(regionalReducer, initialState);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchCountries = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/regional/countries`, { headers: getAuthHeaders() });
      const data = await res.json();
      dispatch({ type: 'SET_COUNTRIES', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [API_BASE, getAuthHeaders]);

  const fetchRegions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/regional/regions`, { headers: getAuthHeaders() });
      const data = await res.json();
      dispatch({ type: 'SET_REGIONS', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [API_BASE, getAuthHeaders]);

  const fetchAverageCosts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/regional/average-cost`, { headers: getAuthHeaders() });
      const data = await res.json();
      dispatch({ type: 'SET_AVERAGE_COSTS', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [API_BASE, getAuthHeaders]);

  const selectCountry = useCallback(async (countryCode) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/regional/simulation-params/${countryCode}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.error) {
        dispatch({ type: 'SET_ERROR', payload: data.error });
        return;
      }
      dispatch({
        type: 'SET_COUNTRY',
        payload: {
          country: {
            code: data.country_code,
            name_local: data.country_name,
            locale: data.currency.locale,
          },
          currency: data.currency,
          pricing: {
            cost_kwp: data.cost_kwp,
            energy_tariff: data.energy_tariff,
            cost_multiplier: data.cost_multiplier,
            tax_percent: data.tax_percent,
            installation_base: data.installation_base,
            labor_multiplier: data.labor_multiplier,
            irradiation_avg: data.irradiation_avg,
          },
        },
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [API_BASE, getAuthHeaders]);

  const setDisplayCurrency = useCallback((code) => {
    dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: code });
  }, []);

  const convertToDisplay = useCallback((valueBRL) => {
    return convertCurrency(valueBRL, 'BRL', state.displayCurrency);
  }, [state.displayCurrency]);

  const formatPrice = useCallback((value) => {
    const info = getCurrencyInfo(state.displayCurrency);
    const converted = convertCurrency(value, state.currency.code, state.displayCurrency);
    return formatCurrency(converted, info.code, info.locale);
  }, [state.currency.code, state.displayCurrency]);

  const adjustPrice = useCallback((basePriceBRL) => {
    const adjusted = basePriceBRL * state.pricing.cost_multiplier;
    const tax = adjusted * (state.pricing.tax_percent / 100);
    return {
      price: parseFloat((adjusted + tax).toFixed(2)),
      priceBeforeTax: parseFloat(adjusted.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      formatted: formatCurrency(adjusted + tax, state.currency.code, state.country.locale),
    };
  }, [state.pricing, state.currency.code, state.country.locale]);

  const value = {
    ...state,
    fetchCountries,
    fetchRegions,
    fetchAverageCosts,
    selectCountry,
    setDisplayCurrency,
    convertToDisplay,
    formatPrice,
    adjustPrice,
  };

  return (
    <RegionalContext.Provider value={value}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegional() {
  const context = useContext(RegionalContext);
  if (!context) {
    throw new Error('useRegional deve ser usado dentro de um RegionalProvider');
  }
  return context;
}

export default RegionalContext;
