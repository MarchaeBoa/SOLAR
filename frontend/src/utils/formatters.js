/**
 * Formata valor em reais (BRL)
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separadores
 */
export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('pt-BR', {
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
