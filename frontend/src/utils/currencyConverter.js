/**
 * Serviço de conversão de moedas (mock).
 * Taxas fixas para simulação — em produção, integrar com API real.
 */

// Taxas de câmbio mock (base: BRL)
const EXCHANGE_RATES = {
  BRL: 1.0,
  USD: 0.18,   // 1 BRL ≈ 0.18 USD
  EUR: 0.17,   // 1 BRL ≈ 0.17 EUR
};

export const SUPPORTED_CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', flag: '🇪🇺' },
];

/**
 * Converte valor de uma moeda para outra.
 * @param {number} value - Valor a converter
 * @param {string} from - Código da moeda de origem (ex: 'BRL')
 * @param {string} to - Código da moeda de destino (ex: 'USD')
 * @returns {number} Valor convertido
 */
export function convertCurrency(value, from = 'BRL', to = 'BRL') {
  if (from === to) return value;
  const rateFrom = EXCHANGE_RATES[from];
  const rateTo = EXCHANGE_RATES[to];
  if (!rateFrom || !rateTo) return value;
  // Converte para BRL primeiro, depois para moeda destino
  const inBRL = value / rateFrom;
  return inBRL * rateTo;
}

/**
 * Retorna a taxa de câmbio entre duas moedas.
 */
export function getExchangeRate(from, to) {
  if (from === to) return 1;
  const rateFrom = EXCHANGE_RATES[from];
  const rateTo = EXCHANGE_RATES[to];
  if (!rateFrom || !rateTo) return 1;
  return rateTo / rateFrom;
}

/**
 * Retorna informações de uma moeda suportada.
 */
export function getCurrencyInfo(code) {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
}
