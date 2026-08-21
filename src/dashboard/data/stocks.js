import { logoUrlForSymbol } from "../utils/logos";

// Ações em destaque mostradas antes de pesquisar — grandes empresas dos EUA e Europa.
// O id é o próprio símbolo da Yahoo Finance, prefixado com "stock:".
const asId = (symbol) => `stock:${symbol}`;

export const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", mic: "US" },
  { symbol: "MSFT", name: "Microsoft Corporation", mic: "US" },
  { symbol: "GOOGL", name: "Alphabet Inc.", mic: "US" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", mic: "US" },
  { symbol: "NVDA", name: "NVIDIA Corporation", mic: "US" },
  { symbol: "META", name: "Meta Platforms, Inc.", mic: "US" },
  { symbol: "TSLA", name: "Tesla, Inc.", mic: "US" },
  { symbol: "ASML.AS", name: "ASML Holding N.V.", mic: "Amsterdam" },
  { symbol: "SAP.DE", name: "SAP SE", mic: "Xetra" },
  { symbol: "MC.PA", name: "LVMH Moët Hennessy Louis Vuitton", mic: "Paris" },
].map((s) => ({ ...s, id: asId(s.symbol), thumb: logoUrlForSymbol(s.symbol) }));
