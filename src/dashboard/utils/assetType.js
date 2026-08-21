// Deriva o tipo de ativo a partir do id: "etf:..." e "stock:..." vêm da Yahoo
// Finance, tudo o resto é uma moeda (ids da CoinGecko, sem prefixo).
export function getAssetType(id) {
  if (id.startsWith("etf:")) return "etf";
  if (id.startsWith("stock:")) return "stock";
  return "crypto";
}
