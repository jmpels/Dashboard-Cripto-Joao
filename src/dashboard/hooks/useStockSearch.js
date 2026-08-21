import { POPULAR_STOCKS } from "../data/stocks";
import { useYahooAssetSearch } from "./useYahooAssetSearch";

export function useStockSearch() {
  const { search, setSearch, assetsMap, displayedAssets, searchResults, searching, searchError } =
    useYahooAssetSearch({
      quoteType: "EQUITY",
      idPrefix: "stock:",
      popularList: POPULAR_STOCKS,
      errorKey: "errorSearchStocks",
    });

  return {
    search,
    setSearch,
    stocksMap: assetsMap,
    displayedStocks: displayedAssets,
    searchResults,
    searching,
    searchError,
  };
}
