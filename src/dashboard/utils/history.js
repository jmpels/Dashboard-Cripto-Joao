import { getAssetType } from "./assetType";
import { fetchJsonCached } from "./apiCache";


export const RANGES = {
  "15D": { days: 15, yahoo: "1mo", ttlMs: 30 * 60 * 1000 },
  "1M": { days: 30, yahoo: "1mo", ttlMs: 30 * 60 * 1000 },
  "6M": { days: 180, yahoo: "6mo", ttlMs: 6 * 60 * 60 * 1000 },
  "1Y": { days: 365, yahoo: "1y", ttlMs: 6 * 60 * 60 * 1000 },
};

async function fetchCrypto(id, { days, ttlMs }) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=${days}`;
  const { data } = await fetchJsonCached(url, { ttlMs });
  return {
    currency: "EUR",
    points: data.prices.map(([t, price]) => ({ t, price })),
  };
}


// Remove o prefixo do id ("etf:" ou "stock:") — o resto é o símbolo da Yahoo.
const symbolFromId = (id) => id.slice(id.indexOf(":") + 1);

async function fetchYahoo(id, { days, yahoo, ttlMs }) {
  const symbol = symbolFromId(id);
  const url = `/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=${yahoo}&interval=1d`;
  const { data } = await fetchJsonCached(url, { ttlMs });

  const r = data.chart.result[0];
  const closes = r.indicators.quote[0].close;
  const since = Date.now() - days * 86400000;
  const points = r.timestamp
    .map((ts, i) => ({ t: ts * 1000, price: closes[i] }))
    .filter((p) => p.price != null && p.t >= since);
  return { currency: r.meta.currency, points };
}

export function fetchHistory(id, rangeKey) {
  const cfg = RANGES[rangeKey];
  return getAssetType(id) === "crypto"
    ? fetchCrypto(id, cfg)
    : fetchYahoo(id, cfg);
}
