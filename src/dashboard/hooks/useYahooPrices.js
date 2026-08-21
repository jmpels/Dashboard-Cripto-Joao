import { useCallback, useEffect, useState } from "react";
import { fetchJsonCached } from "../utils/apiCache";
import { corsProxyUrls } from "../utils/corsProxy";
import { useLanguage } from "../i18n/LanguageContext";

const TWELVE_DATA_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const QUOTES_TTL_MS = 60 * 1000;
const FX_TTL_MS = 5 * 60 * 1000; // câmbio muda pouco de minuto a minuto

// Remove o prefixo do id ("etf:" ou "stock:") — o resto é o símbolo da Yahoo.
const symbolFromId = (id) => id.slice(id.indexOf(":") + 1);

async function fetchFxRate(currency, force) {
  if (currency === "EUR") return 1;
  const { data } = await fetchJsonCached(
    `https://api.twelvedata.com/exchange_rate?symbol=${currency}/EUR&apikey=${TWELVE_DATA_KEY}`,
    { ttlMs: FX_TTL_MS, force }
  );
  return data?.rate ?? 1;
}

// Uma cotação de cada vez — feito assim (em vez de um pedido só com tudo) porque a
// Yahoo Finance não permite pedidos direto do browser: passam por proxies CORS
// gratuitos que falham de vez em quando, e isolar por símbolo evita que um ativo
// problemático arraste os restantes consigo (ver Promise.allSettled em useYahooPrices).
async function fetchOneQuote(id, force) {
  const symbol = symbolFromId(id);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const { data } = await fetchJsonCached(corsProxyUrls(yahooUrl), { ttlMs: QUOTES_TTL_MS, force });
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") throw new Error("sem cotação");

  // Algumas bolsas do Reino Unido reportam em pence (GBp/GBX) em vez de libras.
  const divisor = meta.currency === "GBp" || meta.currency === "GBX" ? 100 : 1;
  const currency = divisor === 100 ? "GBP" : meta.currency;
  const price = meta.regularMarketPrice / divisor;
  const previousClose = (meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice) / divisor;

  const rate = await fetchFxRate(currency, force);
  return {
    eur: price * rate,
    eur_24h_change: previousClose ? ((price - previousClose) / previousClose) * 100 : null,
  };
}

// Vai buscar cotações de ETFs e ações selecionados (qualquer bolsa do mundo, via
// Yahoo Finance) e converte para EUR com câmbio em tempo real. Cada ativo é
// independente: se um falhar, os outros continuam a atualizar-se normalmente.
export function useYahooPrices(selected, { active }) {
  const { t } = useLanguage();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPrices = useCallback(
    async (force = false) => {
      if (!selected.length) return;
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled(selected.map((id) => fetchOneQuote(id, force)));
      const next = {};
      let anyFailed = false;
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[selected[i]] = r.value;
        else anyFailed = true;
      });

      if (Object.keys(next).length) {
        setPrices((prev) => ({ ...prev, ...next }));
        setLastUpdated(new Date());
        setError(anyFailed ? t("errorPricesYahooPartial") : null);
      } else {
        setError(t("errorPricesYahoo"));
        const mock = {};
        selected.forEach((id) => {
          mock[id] = { eur: Math.random() * 400 + 50, eur_24h_change: Math.random() * 4 - 2 };
        });
        setPrices(mock);
        setLastUpdated(new Date());
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected]
  );

  useEffect(() => {
    if (active) fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fetchPrices]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => fetchPrices(), QUOTES_TTL_MS);
    return () => clearInterval(id);
  }, [active, fetchPrices]);

  return { prices, loading, error, lastUpdated, fetchPrices };
}
