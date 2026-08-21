import { logoUrlForSymbol } from "../utils/logos";

// ETFs em destaque mostrados antes de pesquisar — mercados dos EUA, Europa,
// Reino Unido e Austrália. O id é o próprio símbolo da Yahoo Finance (já inclui
// o sufixo da bolsa, ex: ".DE", ".L"), prefixado com "etf:" para nunca colidir
// com ids de moedas.
const asId = (symbol) => `etf:${symbol}`;

export const POPULAR_ETFS = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", mic: "US" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", mic: "US" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", mic: "US" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", mic: "US" },
  { symbol: "VWCE.DE", name: "Vanguard FTSE All-World UCITS ETF", mic: "Xetra" },
  { symbol: "IWDA.AS", name: "iShares Core MSCI World UCITS ETF", mic: "Amsterdam" },
  { symbol: "SXR8.DE", name: "iShares Core S&P 500 UCITS ETF", mic: "Xetra" },
  { symbol: "VWRL.L", name: "Vanguard FTSE All-World UCITS ETF", mic: "London" },
  { symbol: "VAS.AX", name: "Vanguard Australian Shares Index ETF", mic: "ASX" },
  { symbol: "GLD", name: "SPDR Gold Shares", mic: "US" },
].map((e) => ({ ...e, id: asId(e.symbol), thumb: logoUrlForSymbol(e.symbol) }));
