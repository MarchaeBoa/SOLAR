/**
 * Formata valor monetário com suporte a múltiplas moedas.
 * @param {number} value - Valor a formatar
 * @param {string} [currencyCode='BRL'] - Código da moeda (ISO 4217)
 * @param {string} [locale='pt-BR'] - Locale para formatação
 */
export function formatCurrency(value, currencyCode = 'BRL', locale = 'pt-BR') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  } catch {
    return `${currencyCode} ${Number(value).toFixed(2)}`;
  }
}

/**
 * Formata valor usando dados de moeda do contexto regional.
 * @param {number} value - Valor a formatar
 * @param {Object} moeda - Objeto com { code, locale }
 */
export function formatRegionalCurrency(value, moeda) {
  if (!moeda || !moeda.code) {
    return formatCurrency(value);
  }
  return formatCurrency(value, moeda.code, moeda.locale || 'en-US');
}

/**
 * Formata número com separadores
 */
export function formatNumber(value, decimals = 0, locale = 'pt-BR') {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata potência em kWh/MWh
 */
export function formatEnergy(kwh) {
  if (kwh >= 1000) {
    return `${formatNumber(kwh / 1000, 1)} MWh`;
  }
  return `${formatNumber(kwh, 1)} kWh`;
}

/**
 * Formata porcentagem
 */
export function formatPercent(value) {
  return `${formatNumber(value, 1)}%`;
}
