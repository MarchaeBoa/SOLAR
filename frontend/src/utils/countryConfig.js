/**
 * Configuração global por país.
 * Cada país define: tarifa de energia, radiação solar, moeda, idioma,
 * custo por kWp, e multiplicadores regionais.
 */

const COUNTRY_CONFIGS = {
  BR: {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    language: 'pt',
    currency: 'BRL',
    energy_tariff: 0.85,       // R$/kWh
    irradiation_avg: 5.2,      // kWh/m²/dia
    cost_kwp: 4500,            // R$/kWp
    cost_multiplier: 1.0,
    tax_percent: 0,
    installation_base: 3500,
    labor_multiplier: 1.0,
    panel_efficiency: 0.20,
    lifespan_years: 25,
    co2_factor: 0.084,         // kg CO₂/kWh evitado
    regions: [
      { id: 'norte', irradiation: 5.5 },
      { id: 'nordeste', irradiation: 5.8 },
      { id: 'centro_oeste', irradiation: 5.4 },
      { id: 'sudeste', irradiation: 4.8 },
      { id: 'sul', irradiation: 4.3 },
    ],
  },

  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    language: 'en',
    currency: 'USD',
    energy_tariff: 0.16,       // $/kWh
    irradiation_avg: 4.5,      // kWh/m²/dia
    cost_kwp: 1100,            // $/kWp
    cost_multiplier: 0.24,
    tax_percent: 8,
    installation_base: 800,
    labor_multiplier: 1.4,
    panel_efficiency: 0.21,
    lifespan_years: 25,
    co2_factor: 0.42,
    regions: [
      { id: 'southwest', irradiation: 5.8 },
      { id: 'southeast', irradiation: 4.8 },
      { id: 'midwest', irradiation: 4.2 },
      { id: 'northeast', irradiation: 3.8 },
      { id: 'west', irradiation: 5.2 },
    ],
  },

  ES: {
    code: 'ES',
    name: 'España',
    flag: '🇪🇸',
    language: 'es',
    currency: 'EUR',
    energy_tariff: 0.24,       // €/kWh
    irradiation_avg: 4.6,      // kWh/m²/dia
    cost_kwp: 1200,            // €/kWp
    cost_multiplier: 0.22,
    tax_percent: 21,
    installation_base: 700,
    labor_multiplier: 1.2,
    panel_efficiency: 0.21,
    lifespan_years: 25,
    co2_factor: 0.29,
    regions: [
      { id: 'andalucia', irradiation: 5.4 },
      { id: 'castilla', irradiation: 4.8 },
      { id: 'cataluna', irradiation: 4.3 },
      { id: 'galicia', irradiation: 3.6 },
      { id: 'canarias', irradiation: 5.6 },
    ],
  },

  MX: {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    language: 'es',
    currency: 'USD',
    energy_tariff: 0.09,
    irradiation_avg: 5.5,
    cost_kwp: 950,
    cost_multiplier: 0.21,
    tax_percent: 16,
    installation_base: 600,
    labor_multiplier: 0.8,
    panel_efficiency: 0.20,
    lifespan_years: 25,
    co2_factor: 0.45,
    regions: [
      { id: 'norte', irradiation: 6.0 },
      { id: 'centro', irradiation: 5.2 },
      { id: 'sur', irradiation: 5.0 },
    ],
  },

  DE: {
    code: 'DE',
    name: 'Deutschland',
    flag: '🇩🇪',
    language: 'en',
    currency: 'EUR',
    energy_tariff: 0.35,
    irradiation_avg: 3.0,
    cost_kwp: 1400,
    cost_multiplier: 0.25,
    tax_percent: 19,
    installation_base: 900,
    labor_multiplier: 1.6,
    panel_efficiency: 0.21,
    lifespan_years: 25,
    co2_factor: 0.38,
    regions: [
      { id: 'bayern', irradiation: 3.4 },
      { id: 'nrw', irradiation: 2.8 },
      { id: 'niedersachsen', irradiation: 2.6 },
    ],
  },

  AR: {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    language: 'es',
    currency: 'USD',
    energy_tariff: 0.05,
    irradiation_avg: 4.8,
    cost_kwp: 900,
    cost_multiplier: 0.20,
    tax_percent: 21,
    installation_base: 500,
    labor_multiplier: 0.7,
    panel_efficiency: 0.20,
    lifespan_years: 25,
    co2_factor: 0.36,
    regions: [
      { id: 'noroeste', irradiation: 5.8 },
      { id: 'cuyo', irradiation: 5.4 },
      { id: 'pampa', irradiation: 4.5 },
      { id: 'patagonia', irradiation: 3.8 },
    ],
  },

  PT: {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    language: 'pt',
    currency: 'EUR',
    energy_tariff: 0.22,
    irradiation_avg: 4.8,
    cost_kwp: 1150,
    cost_multiplier: 0.21,
    tax_percent: 23,
    installation_base: 650,
    labor_multiplier: 1.1,
    panel_efficiency: 0.21,
    lifespan_years: 25,
    co2_factor: 0.25,
    regions: [
      { id: 'algarve', irradiation: 5.4 },
      { id: 'alentejo', irradiation: 5.1 },
      { id: 'lisboa', irradiation: 4.8 },
      { id: 'norte', irradiation: 4.2 },
    ],
  },

  CO: {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    language: 'es',
    currency: 'USD',
    energy_tariff: 0.06,
    irradiation_avg: 4.5,
    cost_kwp: 850,
    cost_multiplier: 0.19,
    tax_percent: 19,
    installation_base: 450,
    labor_multiplier: 0.7,
    panel_efficiency: 0.20,
    lifespan_years: 25,
    co2_factor: 0.20,
    regions: [
      { id: 'caribe', irradiation: 5.5 },
      { id: 'andina', irradiation: 4.2 },
      { id: 'pacifico', irradiation: 3.8 },
    ],
  },

  CL: {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    language: 'es',
    currency: 'USD',
    energy_tariff: 0.13,
    irradiation_avg: 5.5,
    cost_kwp: 950,
    cost_multiplier: 0.21,
    tax_percent: 19,
    installation_base: 550,
    labor_multiplier: 0.9,
    panel_efficiency: 0.21,
    lifespan_years: 25,
    co2_factor: 0.35,
    regions: [
      { id: 'atacama', irradiation: 7.5 },
      { id: 'central', irradiation: 5.0 },
      { id: 'sur', irradiation: 3.5 },
    ],
  },
};

/**
 * Retorna configuração de um país pelo código.
 */
export function getCountryConfig(code) {
  return COUNTRY_CONFIGS[code] || COUNTRY_CONFIGS.BR;
}

/**
 * Lista todos os países configurados.
 */
export function getAllCountries() {
  return Object.values(COUNTRY_CONFIGS);
}

/**
 * Retorna os parâmetros de simulação para um país.
 */
export function getSimulationParams(countryCode) {
  const config = getCountryConfig(countryCode);
  return {
    energy_tariff: config.energy_tariff,
    irradiation_avg: config.irradiation_avg,
    cost_kwp: config.cost_kwp,
    panel_efficiency: config.panel_efficiency,
    lifespan_years: config.lifespan_years,
    co2_factor: config.co2_factor,
    tax_percent: config.tax_percent,
    regions: config.regions,
  };
}

export default COUNTRY_CONFIGS;
