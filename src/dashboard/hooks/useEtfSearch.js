import { POPULAR_ETFS } from "../data/etfs";
import { useYahooAssetSearch } from "./useYahooAssetSearch";

export function useEtfSearch() {
  const { search, setSearch, assetsMap, displayedAssets, searchResults, searching, searchError } =
    useYahooAssetSearch({
      quoteType: "ETF",
      idPrefix: "etf:",
      popularList: POPULAR_ETFS,
      errorKey: "errorSearchEtfs",
    });

  return {
    search,
    setSearch,
    etfsMap: assetsMap,
    displayedEtfs: displayedAssets,
    searchResults,
    searching,
    searchError,
  };
}
