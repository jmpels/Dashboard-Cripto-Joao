// CDN gratuito e sem chave da Financial Modeling Prep — funciona tanto para
// ações como para ETFs (testado com tickers dos EUA e europeus). Símbolos sem
// logo aqui devolvem 404, tratado no CoinIcon com fallback para as iniciais.
export function logoUrlForSymbol(symbol) {
  return `https://images.financialmodelingprep.com/symbol/${symbol}.png`;
}
