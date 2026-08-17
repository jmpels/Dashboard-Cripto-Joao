import { useState } from "react";
import { Header } from "./components/Header";
import { SelectCoinsStep } from "./steps/SelectCoinsStep";
import { AmountsStep } from "./steps/AmountsStep";
import { DashboardStep } from "./steps/DashboardStep";
import { useCoinSearch } from "./hooks/useCoinSearch";
import { usePrices } from "./hooks/usePrices";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useTheme } from "./hooks/useTheme";
import { buildPortfolioData } from "./utils/portfolio";
import "./dashboard.css";

const hasSavedHoldings = (holdings) =>
  Object.values(holdings).some((h) => parseFloat(h?.qty) > 0);

export default function CryptoDashboard() {
  const [selected, setSelected] = useLocalStorageState("cryptfolio:selected", []);
  const [holdings, setHoldings] = useLocalStorageState("cryptfolio:holdings", {});
  const { theme, toggleTheme } = useTheme();

  // Se já havia um portfólio guardado (visita anterior), entra direto no dashboard.
  const [step, setStep] = useState(() =>
    selected.length && hasSavedHoldings(holdings) ? "dashboard" : "select"
  );

  const { search, setSearch, coinsMap, displayedCoins, searchResults, searching, searchError } =
    useCoinSearch();

  const { prices, loading, error, lastUpdated, fetchPrices } = usePrices(selected, {
    active: step === "dashboard",
  });

  const toggleCoin = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const { portfolioData, totalValue, totalInvested, pnl, pnlPct, barData } = buildPortfolioData({
    selected,
    holdings,
    prices,
    coinsMap,
  });

  const resetAll = () => {
    setStep("select");
    setSelected([]);
    setHoldings({});
    setSearch("");
  };

  return (
    <div className="root">
      <Header
        isDashboard={step === "dashboard"}
        loading={loading}
        onRefresh={fetchPrices}
        lastUpdated={lastUpdated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="content">
        <div className="step-transition" key={step}>
          {step === "select" && (
            <SelectCoinsStep
              search={search}
              setSearch={setSearch}
              searching={searching}
              searchError={searchError}
              searchResults={searchResults}
              displayedCoins={displayedCoins}
              selected={selected}
              toggleCoin={toggleCoin}
              onContinue={() => setStep("amounts")}
            />
          )}

          {step === "amounts" && (
            <AmountsStep
              selected={selected}
              coinsMap={coinsMap}
              holdings={holdings}
              setHoldings={setHoldings}
              onBack={() => setStep("select")}
              onContinue={() => setStep("dashboard")}
            />
          )}

          {step === "dashboard" && (
            <DashboardStep
              loading={loading}
              error={error}
              portfolioData={portfolioData}
              barData={barData}
              totalValue={totalValue}
              totalInvested={totalInvested}
              pnl={pnl}
              pnlPct={pnlPct}
              holdings={holdings}
              setHoldings={setHoldings}
              onEdit={() => setStep("amounts")}
              onManageCoins={() => setStep("select")}
              onReset={resetAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}
