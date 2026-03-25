/**
 * Calcula o total de um orçamento
 */
function calcularTotal(itens, desconto = 0) {
  // Validate each item has required properties
  for (const item of itens) {
    if (item.preco == null || item.qtd == null || isNaN(item.preco) || isNaN(item.qtd)) {
      return {
        error: 'Cada item deve ter "preco" e "qtd" como valores numéricos.',
        subtotal: 0,
        desconto: 0,
        descontoPercent: 0,
        total: 0,
        totalItens: 0,
      };
    }
    if (item.qtd < 0 || item.preco < 0) {
      return {
        error: 'Preço e quantidade devem ser valores positivos.',
        subtotal: 0,
        desconto: 0,
        descontoPercent: 0,
        total: 0,
        totalItens: 0,
      };
    }
  }

  const descontoSafe = Math.max(0, Math.min(100, parseFloat(desconto) || 0));

  const subtotal = itens.reduce((acc, item) => {
    return acc + (parseFloat(item.preco) * parseFloat(item.qtd));
  }, 0);

  const descontoValor = subtotal * (descontoSafe / 100);
  const total = subtotal - descontoValor;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    desconto: parseFloat(descontoValor.toFixed(2)),
    descontoPercent: descontoSafe,
    total: parseFloat(total.toFixed(2)),
    totalItens: itens.reduce((acc, item) => acc + parseFloat(item.qtd), 0),
  };
}

/**
 * Formata data para pt-BR
 */
function formatarData(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

module.exports = {
  calcularTotal,
  formatarData,
};
