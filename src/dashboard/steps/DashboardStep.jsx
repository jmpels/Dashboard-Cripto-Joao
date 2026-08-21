import { StatsRow } from "../components/StatsRow";
import { PortfolioPieChart } from "../components/PortfolioPieChart";
import { PortfolioBarChart } from "../components/PortfolioBarChart";
import { HoldingsTable } from "../components/HoldingsTable";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { useLanguage } from "../i18n/LanguageContext";

export function DashboardStep({
  loading,
  error,
  portfolioData,
  pendingAssets,
  refreshingByType,
  barData,
  totalValue,
  totalInvested,
  pnl,
  pnlPct,
  holdings,
  setHoldings,
  onEdit,
  onManageCoins,
  onReset,
}) {
  const { t } = useLanguage();
  // Só mostra o ecrã de loading inteiro na primeira vez; as atualizações
  // automáticas seguintes só mudam o texto do botão de refresh no cabeçalho.
  if (loading && portfolioData.length === 0) {
    return <DashboardSkeleton />;
  }

  const updateQty = (id, qty) =>
    setHoldings((h) => ({ ...h, [id]: { ...h[id], qty } }));

  return (
    <>
      {error && (
        <div
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            color: "var(--warning-fg)",
            marginBottom: 16,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <StatsRow
        totalValue={totalValue}
        totalInvested={totalInvested}
        pnl={pnl}
        pnlPct={pnlPct}
        coinCount={portfolioData.length}
      />

      <div className="charts-grid">
        <PortfolioPieChart portfolioData={portfolioData} />
        <PortfolioBarChart barData={barData} />
      </div>

      <HoldingsTable
        portfolioData={portfolioData}
        pendingAssets={pendingAssets}
        refreshingByType={refreshingByType}
        holdings={holdings}
        onQtyChange={updateQty}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn-ghost" onClick={onEdit}>
          {t("editAmounts")}
        </button>
        <button className="btn-ghost" onClick={onManageCoins}>
          {t("manageAssets")}
        </button>
        <button className="btn-ghost" onClick={onReset}>
          {t("resetPortfolio")}
        </button>
      </div>
    </>
  );
}
