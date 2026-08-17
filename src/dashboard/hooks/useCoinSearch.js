import { useEffect, useRef, useState } from "react";
import { POPULAR_COINS } from "../data/coins";
import { fetchJsonCached } from "../utils/apiCache";

const POPULAR_ICONS_TTL_MS = 10 * 60 * 1000; // 10 minutos — logos e rank quase não mudam
const SEARCH_TTL_MS = 3 * 60 * 1000; // 3 minutos — evita repetir a mesma pesquisa

const buildInitialMap = () => {
  const map = {};
  POPULAR_COINS.forEach((c) => (map[c.id] = c));
  return map;
};

// Pesquisa moedas na CoinGecko à medida que o utilizador escreve (com debounce),
// e mantém um mapa id -> coin com tudo o que já foi visto (populares + resultados de pesquisa).
export function useCoinSearch() {
  const [search, setSearch] = useState("");
  const [coinsMap, setCoinsMap] = useState(buildInitialMap);
  const [searchResults, setSearchResults] = useState(null); // null = mostrar populares
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  // Vai buscar os ícones (e o rank) reais das moedas em destaque à CoinGecko assim que o dashboard arranca,
  // em vez de depender de dados estáticos — enquanto não chega, o CoinIcon mostra as iniciais como fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ids = POPULAR_COINS.map((c) => c.id).join(",");
        const { data } = await fetchJsonCached(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${ids}`,
          { ttlMs: POPULAR_ICONS_TTL_MS }
        );
        if (cancelled) return;
        setCoinsMap((m) => {
          const next = { ...m };
          data.forEach((c) => {
            next[c.id] = {
              ...next[c.id],
              thumb: c.image,
              rank: c.market_cap_rank ?? next[c.id]?.rank,
            };
          });
          return next;
        });
      } catch {
        // sem ícones ao arrancar -> mantém-se o fallback de iniciais
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      setSearching(false);
      setSearchError(null);
      return;
    }
    setSearching(true);
    setSearchError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await fetchJsonCached(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(search.trim())}`,
          { ttlMs: SEARCH_TTL_MS }
        );
        const coins = (data.coins || [])
          .sort((a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9))
          .slice(0, 30)
          .map((c) => ({
            id: c.id,
            symbol: c.symbol?.toUpperCase(),
            name: c.name,
            thumb: c.thumb,
            rank: c.market_cap_rank,
          }));
        setSearchResults(coins);
        setCoinsMap((m) => {
          const next = { ...m };
          coins.forEach((c) => (next[c.id] = c));
          return next;
        });
      } catch {
        setSearchError("Não foi possível pesquisar moedas de momento.");
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const displayedCoins =
    searchResults !== null ? searchResults : POPULAR_COINS.map((c) => coinsMap[c.id] || c);

  return { search, setSearch, coinsMap, displayedCoins, searchResults, searching, searchError };
}
