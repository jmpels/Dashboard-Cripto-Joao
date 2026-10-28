import { PALETTE } from "../data/palette";
import { getAssetType } from "./assetType";
import { baseId, sortPositionKeys } from "./positions";

export function buildPortfolioData({ selected, holdings, prices, coinsMap }) {
  const keys = sortPositionKeys(Object.keys(holdings), selected).filter(
    (key) =>
      selected.includes(baseId(key)) &&
      prices[baseId(key)] &&
      parseFloat(holdings[key]?.qty) > 0,
  );

  // One colour per ASSET (in sorted order), so all BTC rows share a colour
  const colorIndex = {};
  keys.forEach((key) => {
    const id = baseId(key);
    if (!(id in colorIndex)) colorIndex[id] = Object.keys(colorIndex).length;
  });

  // How many rows each asset has → decides whether we show "#1, #2"
  const rowsPerAsset = {};
  keys.forEach((key) => {
    const id = baseId(key);
    rowsPerAsset[id] = (rowsPerAsset[id] || 0) + 1;
  });
  const counter = {};

  const portfolioData = keys.map((key) => {
    const id = baseId(key);
    const coin = coinsMap[id];
    const price = prices[id]?.eur || 0;
    const change24h = prices[id]?.eur_24h_change ?? null;
    const qty = parseFloat(holdings[key]?.qty) || 0;
    const buyPrice =
      holdings[key]?.buyPrice != null
        ? parseFloat(holdings[key].buyPrice) || 0
        : qty > 0
          ? (parseFloat(holdings[key]?.invested) || 0) / qty
          : 0;

    counter[id] = (counter[id] || 0) + 1;
    const symbol = coin?.symbol || id.toUpperCase();

    return {
      id: key, // position key: unique per row
      assetId: id, // shared by all positions of the asset
      type: getAssetType(id),
      name: rowsPerAsset[id] > 1 ? `${symbol} #${counter[id]}` : symbol,
      symbol,
      fullName: coin?.name || id,
      thumb: coin?.thumb,
      price,
      change24h,
      qty,
      buyPrice,
      invested: buyPrice * qty,
      value: qty * price,
      fill: PALETTE[colorIndex[id] % PALETTE.length],
      pct: 0,
    };
  });

  const totalValue = portfolioData.reduce((s, d) => s + d.value, 0);
  const totalInvested = portfolioData.reduce((s, d) => s + d.invested, 0);
  portfolioData.forEach((d) => {
    d.pct = totalValue > 0 ? (d.value / totalValue) * 100 : 0;
  });

  // One entry per asset (for pie + bar). Keeps the same shape as a table row.
  const byAsset = {};
  portfolioData.forEach((d) => {
    const a = (byAsset[d.assetId] ??= {
      ...d,
      id: d.assetId,
      name: d.symbol,
      qty: 0,
      invested: 0,
      value: 0,
    });
    a.qty += d.qty;
    a.invested += d.invested;
    a.value += d.value;
  });
  const pieData = Object.values(byAsset).map((a) => ({
    ...a,
    buyPrice: a.qty > 0 ? a.invested / a.qty : 0, // weighted average
    pct: totalValue > 0 ? (a.value / totalValue) * 100 : 0,
  }));

  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const toBarData = (rows) =>
    rows
      .filter((d) => d.invested > 0)
      .map((d) => ({
        name: d.name,
        Investido: +d.invested.toFixed(2),
        Atual: +d.value.toFixed(2),
        fill: d.fill,
      }));

  const barData = toBarData(pieData); // one bar pair per asset (totals)
  const barDataByPosition = toBarData(portfolioData); // one bar pair per purchase

  return {
    portfolioData,
    pieData,
    totalValue,
    totalInvested,
    pnl,
    pnlPct,
    barData,
    barDataByPosition,
  };
}
