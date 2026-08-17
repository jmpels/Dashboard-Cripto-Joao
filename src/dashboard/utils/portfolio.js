import { PALETTE } from "../data/palette";

// Junta coins selecionadas + preços + quantidades numa lista pronta para os gráficos/tabela.
export function buildPortfolioData({ selected, holdings, prices, coinsMap }) {
  const portfolioData = selected
    .filter((id) => prices[id] && holdings[id]?.qty > 0)
    .map((id, i) => {
      const coin = coinsMap[id];
      const price = prices[id]?.eur || 0;
      const change24h = prices[id]?.eur_24h_change ?? null;
      const qty = parseFloat(holdings[id]?.qty) || 0;
      const invested = parseFloat(holdings[id]?.invested) || 0;
      const currentValue = qty * price;
      return {
        id,
        name: coin?.symbol || id.toUpperCase(),
        fullName: coin?.name || id,
        price,
        change24h,
        qty,
        invested,
        value: currentValue,
        fill: PALETTE[i % PALETTE.length],
        pct: 0,
      };
    });

  const totalValue = portfolioData.reduce((s, d) => s + d.value, 0);
  const totalInvested = portfolioData.reduce((s, d) => s + d.invested, 0);
  portfolioData.forEach((d) => {
    d.pct = totalValue > 0 ? (d.value / totalValue) * 100 : 0;
  });

  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const barData = portfolioData
    .filter((d) => d.invested > 0)
    .map((d) => ({
      name: d.name,
      Investido: +d.invested.toFixed(2),
      Atual: +d.value.toFixed(2),
      fill: d.fill,
    }));

  return { portfolioData, totalValue, totalInvested, pnl, pnlPct, barData };
}
