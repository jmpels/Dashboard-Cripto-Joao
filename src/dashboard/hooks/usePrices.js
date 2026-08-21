import { useCallback, useEffect, useState } from "react";
import { fetchJsonCached } from "../utils/apiCache";
import { useLanguage } from "../i18n/LanguageContext";

const PRICES_TTL_MS = 60 * 1000; // 1 minuto

// Vai buscar os preços em EUR (+ variação 24h) das coins selecionadas à CoinGecko,
// com cache de 1 minuto e atualização automática enquanto `active` for true.
// Se a API falhar, usa valores simulados para o dashboard nunca ficar vazio.
export function usePrices(selected, { active }) {
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
      try {
        const ids = selected.join(",");
        const { data, timestamp } = await fetchJsonCached(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`,
          { ttlMs: PRICES_TTL_MS, force }
        );
        if (!Object.keys(data).length) throw new Error("empty");
        setPrices(data);
        setLastUpdated(new Date(timestamp));
      } catch {
        setError(t("errorPricesCrypto"));
        const mock = {};
        selected.forEach((id) => {
          mock[id] = { eur: Math.random() * 1000 + 10, eur_24h_change: Math.random() * 10 - 5 };
        });
        setPrices(mock);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    },
    // `t` fica de fora de propósito: incluí-la recriava fetchPrices a cada troca de
    // idioma/render, o que voltava a disparar pedidos repetidos (o mesmo bug do useMemo
    // em CryptoDashboard.jsx). O texto de erro só atualiza no próximo fetch, é aceitável.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected]
  );

  useEffect(() => {
    if (active) fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fetchPrices]);

  // Atualização automática: enquanto o dashboard estiver ativo, volta a pedir os
  // preços a cada minuto (a cache trata de não bater na API antes disso).
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => fetchPrices(), PRICES_TTL_MS);
    return () => clearInterval(id);
  }, [active, fetchPrices]);

  return { prices, loading, error, lastUpdated, fetchPrices };
}
