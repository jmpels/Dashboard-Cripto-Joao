import { useEffect, useRef, useState } from "react";
import { fetchJsonCached } from "../utils/apiCache";
import { corsProxyUrls } from "../utils/corsProxy";
import { logoUrlForSymbol } from "../utils/logos";
import { useLanguage } from "../i18n/LanguageContext";

const SEARCH_TTL_MS = 3 * 60 * 1000;

// Pesquisa instrumentos na Yahoo Finance (qualquer bolsa do mundo) à medida que o
// utilizador escreve (com debounce) — partilhado entre ETFs e ações, só muda o
// `quoteType` filtrado e o prefixo do id. A Yahoo não é uma API oficial pública —
// os pedidos passam por proxies CORS, com fallback de cache se falharem.
export function useYahooAssetSearch({ quoteType, idPrefix, popularList, errorKey }) {
  const { t } = useLanguage();
  const buildInitialMap = () => {
    const map = {};
    popularList.forEach((a) => (map[a.id] = a));
    return map;
  };

  const [search, setSearch] = useState("");
  const [assetsMap, setAssetsMap] = useState(buildInitialMap);
  const [searchResults, setSearchResults] = useState(null); // null = mostrar populares
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

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
        const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search.trim())}`;
        const { data } = await fetchJsonCached(corsProxyUrls(yahooUrl), { ttlMs: SEARCH_TTL_MS });
        const results = (data.quotes || [])
          .filter((r) => r.quoteType === quoteType && r.symbol)
          .slice(0, 30)
          .map((r) => ({
            id: `${idPrefix}${r.symbol}`,
            symbol: r.symbol,
            mic: r.exchDisp || r.exchange,
            name: r.longname || r.shortname || r.symbol,
            thumb: logoUrlForSymbol(r.symbol),
          }));
        setSearchResults(results);
        setAssetsMap((m) => {
          const next = { ...m };
          results.forEach((a) => (next[a.id] = a));
          return next;
        });
      } catch {
        setSearchError(t(errorKey));
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const displayedAssets = searchResults !== null ? searchResults : popularList.map((a) => assetsMap[a.id] || a);

  return { search, setSearch, assetsMap, displayedAssets, searchResults, searching, searchError };
}
