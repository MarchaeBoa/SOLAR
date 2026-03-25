const { getDb } = require('../database/setup');

/**
 * Retorna todos os países ativos com dados de pricing.
 */
function getAllCountries() {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, rp.cost_kwp, rp.installation_base, rp.labor_multiplier, rp.tax_percent
    FROM countries c
    LEFT JOIN regional_pricing rp ON c.code = rp.country_code
    WHERE c.active = 1
    ORDER BY c.region, c.name
  `).all();
}

/**
 * Retorna dados de um país pelo código (ex: 'BR', 'US').
 */
function getCountryByCode(code) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, rp.cost_kwp, rp.installation_base, rp.labor_multiplier, rp.tax_percent
    FROM countries c
    LEFT JOIN regional_pricing rp ON c.code = rp.country_code
    WHERE c.code = ? AND c.active = 1
  `).get(code.toUpperCase());
}

/**
 * Retorna países agrupados por região.
 */
function getCountriesByRegion() {
  const countries = getAllCountries();
  const grouped = {};

  const regionNames = {
    south_america: 'América do Sul',
    north_america: 'América do Norte',
    europe: 'Europa',
    africa: 'África',
    asia: 'Ásia',
    oceania: 'Oceania',
    middle_east: 'Oriente Médio',
  };

  for (const country of countries) {
    const region = country.region;
    if (!grouped[region]) {
      grouped[region] = {
        id: region,
        name: regionNames[region] || region,
        countries: [],
      };
    }
    grouped[region].countries.push(country);
  }

  return Object.values(grouped);
}

/**
 * Retorna o custo médio por região (média dos cost_kwp convertidos pelo cost_multiplier).
 */
function getAverageCostByRegion() {
  const db = getDb();
  return db.prepare(`
    SELECT
      c.region,
      COUNT(*) as country_count,
      AVG(rp.cost_kwp) as avg_cost_kwp,
      AVG(c.cost_multiplier) as avg_cost_multiplier,
      AVG(c.energy_tariff) as avg_energy_tariff,
      AVG(c.irradiation_avg) as avg_irradiation,
      AVG(rp.tax_percent) as avg_tax_percent
    FROM countries c
    JOIN regional_pricing rp ON c.code = rp.country_code
    WHERE c.active = 1
    GROUP BY c.region
    ORDER BY c.region
  `).all().map(row => {
    const regionNames = {
      south_america: 'América do Sul',
      north_america: 'América do Norte',
      europe: 'Europa',
      africa: 'África',
      asia: 'Ásia',
      oceania: 'Oceania',
      middle_east: 'Oriente Médio',
    };
    return {
      ...row,
      region_name: regionNames[row.region] || row.region,
      avg_cost_kwp: parseFloat(row.avg_cost_kwp.toFixed(2)),
      avg_cost_multiplier: parseFloat(row.avg_cost_multiplier.toFixed(2)),
      avg_energy_tariff: parseFloat(row.avg_energy_tariff.toFixed(4)),
      avg_irradiation: parseFloat(row.avg_irradiation.toFixed(1)),
      avg_tax_percent: parseFloat(row.avg_tax_percent.toFixed(1)),
    };
  });
}

/**
 * Ajusta o preço de um produto/kit para a região do país.
 * Converte do preço base (BRL) para o preço regional usando cost_multiplier.
 *
 * @param {number} basePriceBRL - Preço base em BRL
 * @param {string} countryCode - Código do país destino
 * @returns {Object} Preço ajustado com informações de moeda
 */
function adjustPrice(basePriceBRL, countryCode) {
  const country = getCountryByCode(countryCode);
  if (!country) {
    return {
      error: `País não encontrado: ${countryCode}`,
    };
  }

  const adjustedPrice = basePriceBRL * country.cost_multiplier;
  const taxAmount = adjustedPrice * (country.tax_percent / 100);
  const totalPrice = adjustedPrice + taxAmount;

  return {
    original_price_brl: basePriceBRL,
    adjusted_price: parseFloat(adjustedPrice.toFixed(2)),
    tax_percent: country.tax_percent,
    tax_amount: parseFloat(taxAmount.toFixed(2)),
    total_price: parseFloat(totalPrice.toFixed(2)),
    currency: {
      code: country.currency_code,
      symbol: country.currency_symbol,
      name: country.currency_name,
    },
    country: {
      code: country.code,
      name: country.name,
      name_local: country.name_local,
      locale: country.locale,
    },
    formatted: formatCurrencyValue(totalPrice, country.currency_code, country.locale),
  };
}

/**
 * Ajusta preços de um array de kits para a região.
 */
function adjustKitPrices(kits, countryCode) {
  const country = getCountryByCode(countryCode);
  if (!country) {
    return { error: `País não encontrado: ${countryCode}` };
  }

  return kits.map(kit => {
    const adjustedPreco = kit.preco * country.cost_multiplier;
    const taxAmount = adjustedPreco * (country.tax_percent / 100);
    const totalPreco = adjustedPreco + taxAmount;

    const adjustedEconomia = kit.economia_mensal_estimada * country.cost_multiplier;

    return {
      ...kit,
      preco_original_brl: kit.preco,
      preco: parseFloat(totalPreco.toFixed(2)),
      preco_sem_imposto: parseFloat(adjustedPreco.toFixed(2)),
      imposto_percent: country.tax_percent,
      imposto_valor: parseFloat(taxAmount.toFixed(2)),
      economia_mensal_estimada: parseFloat(adjustedEconomia.toFixed(2)),
      moeda: {
        code: country.currency_code,
        symbol: country.currency_symbol,
        name: country.currency_name,
        locale: country.locale,
      },
      preco_formatado: formatCurrencyValue(totalPreco, country.currency_code, country.locale),
      economia_formatada: formatCurrencyValue(adjustedEconomia, country.currency_code, country.locale),
    };
  });
}

/**
 * Ajusta preços do catálogo de produtos para a região.
 */
function adjustProductPrices(products, countryCode) {
  const country = getCountryByCode(countryCode);
  if (!country) {
    return { error: `País não encontrado: ${countryCode}` };
  }

  return products.map(product => {
    const adjustedPreco = product.preco * country.cost_multiplier;
    return {
      ...product,
      preco_original_brl: product.preco,
      preco: parseFloat(adjustedPreco.toFixed(2)),
      moeda: {
        code: country.currency_code,
        symbol: country.currency_symbol,
        locale: country.locale,
      },
      preco_formatado: formatCurrencyValue(adjustedPreco, country.currency_code, country.locale),
    };
  });
}

/**
 * Calcula simulação ajustada para a região.
 */
function getRegionalSimulationParams(countryCode) {
  const country = getCountryByCode(countryCode);
  if (!country) {
    return null;
  }

  return {
    country_code: country.code,
    country_name: country.name_local,
    cost_kwp: country.cost_kwp,
    energy_tariff: country.energy_tariff,
    irradiation_avg: country.irradiation_avg,
    cost_multiplier: country.cost_multiplier,
    labor_multiplier: country.labor_multiplier,
    installation_base: country.installation_base,
    tax_percent: country.tax_percent,
    currency: {
      code: country.currency_code,
      symbol: country.currency_symbol,
      name: country.currency_name,
      locale: country.locale,
    },
  };
}

/**
 * Formata valor monetário de acordo com a moeda e locale.
 */
function formatCurrencyValue(value, currencyCode, locale) {
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  } catch {
    // Fallback: try locale-aware number formatting at minimum
    try {
      const formatted = new Intl.NumberFormat(locale || 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `${currencyCode} ${formatted}`;
    } catch {
      return `${currencyCode} ${Number(value).toFixed(2)}`;
    }
  }
}

module.exports = {
  getAllCountries,
  getCountryByCode,
  getCountriesByRegion,
  getAverageCostByRegion,
  adjustPrice,
  adjustKitPrices,
  adjustProductPrices,
  getRegionalSimulationParams,
  formatCurrencyValue,
};
