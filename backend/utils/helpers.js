/**
 * Calcula o total de um orçamento
 */
function calcularTotal(itens, desconto = 0) {
  const subtotal = itens.reduce((acc, item) => {
    return acc + (item.preco * item.qtd);
  }, 0);

  const descontoValor = subtotal * (desconto / 100);
  const total = subtotal - descontoValor;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    desconto: parseFloat(descontoValor.toFixed(2)),
    descontoPercent: desconto,
    total: parseFloat(total.toFixed(2)),
    totalItens: itens.reduce((acc, item) => acc + item.qtd, 0),
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
