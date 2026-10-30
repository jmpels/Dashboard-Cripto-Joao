import { StatsRow } from "../components/StatsRow";
import { PortfolioPieChart } from "../components/PortfolioPieChart";
import { PortfolioBarChart } from "../components/PortfolioBarChart";
import { HoldingsTable } from "../components/HoldingsTable";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { useLanguage } from "../i18n/LanguageContext";
import { useEffect, useState } from "react";
import { AddVariantModal } from "../components/AddVariantModal";
import { addPosition, removePosition } from "../utils/positions";
import { AssetHistoryChart } from "../components/AssetHistoryChart";

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
  pieData,
  barDataByPosition,
}) {
  const { t } = useLanguage();

  const [view, setView] = useState("overview"); // "overview" | "history"
  const [showAll, setShowAll] = useState(false);
  const HISTORY_LIMIT = 6;

  const byValue = [...pieData].sort((a, b) => b.value - a.value);
  const visibleHistory = showAll ? byValue : byValue.slice(0, HISTORY_LIMIT);

  // Só mostra o ecrã de loading inteiro na primeira vez; as atualizações
  // automáticas seguintes só mudam o texto do botão de refresh no cabeçalho.
  if (loading && portfolioData.length === 0) {
    return <DashboardSkeleton />;
  }

  const updateQty = (id, qty) =>
    setHoldings((h) => ({ ...h, [id]: { ...h[id], qty } }));

  const removeVariant = (key) => setHoldings((h) => removePosition(h, key));

  const [variantFor, setVariantFor] = useState(null);

  const hasVariants = portfolioData.length > pieData.length;

  const openVariantModal = (id) => {
    if (typeof id !== "string") {
      console.error("onAddVariant expected an asset id string, got:", id);
      return;
    }
    setVariantFor(id);
  };

  const a = portfolioData
    .filter((d) => d.invested > 0)
    .map((d) => ({
      name: d.name, // "BTC #1", "BTC #2" (or just "BTC" if it has one row)
      Investido: +d.invested.toFixed(2),
      Atual: +d.value.toFixed(2),
      fill: d.fill, // same colour for all rows of an asset
    }));

  useEffect(() => {
    console.log(barData);
    console.log(a);
  }, [barData, a]);

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
        coinCount={pieData.length}
      />

      <div className="view-toggle dashboard-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={view === "overview"}
          className={view === "overview" ? "active" : ""}
          onClick={() => setView("overview")}
        >
          {t("tabOverview")}
        </button>
        <button
          role="tab"
          aria-selected={view === "history"}
          className={view === "history" ? "active" : ""}
          onClick={() => setView("history")}
        >
          {t("tabHistory")}
        </button>
      </div>

      {view === "overview" && (
        <>
          <div className="charts-grid">
            <PortfolioPieChart portfolioData={pieData} />
            <PortfolioBarChart
              barData={barData}
              barDataByPosition={barDataByPosition}
              canSplit={hasVariants}
            />
          </div>

          <HoldingsTable
            portfolioData={portfolioData}
            pendingAssets={pendingAssets}
            refreshingByType={refreshingByType}
            holdings={holdings}
            onQtyChange={updateQty}
            onAddVariant={openVariantModal}
            onRemoveVariant={removeVariant}
          />
        </>
      )}

      {view === "history" && (
        <>
          <div className="history-grid">
            {visibleHistory.map((asset) => (
              <AssetHistoryChart
                key={asset.id}
                asset={asset}
                positions={portfolioData.filter((p) => p.assetId === asset.id)}
              />
            ))}
          </div>

          {byValue.length > HISTORY_LIMIT && (
            <button
              className="btn-ghost"
              style={{ marginBottom: 20 }}
              onClick={() => setShowAll((s) => !s)}
            >
              {showAll
                ? t("showLess")
                : t("showAllCount", { count: byValue.length })}
            </button>
          )}
        </>
      )}

      {variantFor && (
        <AddVariantModal
          symbol={
            pieData.find((r) => r.assetId === variantFor)?.name ?? variantFor
          }
          onSubmit={(data) => {
            setHoldings((h) => addPosition(h, variantFor, data));
            setVariantFor(null);
          }}
          onClose={() => setVariantFor(null)}
        />
      )}

      <div
        style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}
      >
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
