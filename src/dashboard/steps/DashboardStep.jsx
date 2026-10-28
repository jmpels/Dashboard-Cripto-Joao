import { StatsRow } from "../components/StatsRow";
import { PortfolioPieChart } from "../components/PortfolioPieChart";
import { PortfolioBarChart } from "../components/PortfolioBarChart";
import { HoldingsTable } from "../components/HoldingsTable";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { useLanguage } from "../i18n/LanguageContext";
import { useEffect, useState } from "react";
import { AddVariantModal } from "../components/AddVariantModal";
import { addPosition, removePosition } from "../utils/positions";


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
