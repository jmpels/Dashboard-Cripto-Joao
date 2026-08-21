import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { SelectCoinsStep } from "./steps/SelectCoinsStep";
import { AmountsStep } from "./steps/AmountsStep";
import { DashboardStep } from "./steps/DashboardStep";
import { useCoinSearch } from "./hooks/useCoinSearch";
import { usePrices } from "./hooks/usePrices";
import { useEtfSearch } from "./hooks/useEtfSearch";
import { useStockSearch } from "./hooks/useStockSearch";
import { useYahooPrices } from "./hooks/useYahooPrices";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useTheme } from "./hooks/useTheme";
import { buildPortfolioData } from "./utils/portfolio";
import { getAssetType } from "./utils/assetType";
import "./dashboard.css";

// ETFs e ações vêm ambos da Yahoo Finance e partilham o mesmo hook de preços —
// só a moeda (CoinGecko) tem uma fonte de dados própria.
const isYahooId = (id) => getAssetType(id) !== "crypto";

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

  const coinSearch = useCoinSearch();
  const etfSearch = useEtfSearch();
  const stockSearch = useStockSearch();
  // assetsMap junta moedas, ETFs e ações num só sítio — o resto do código trata
  // tudo como "ativos" genéricos, sem precisar de saber o tipo de cada um.
  const assetsMap = { ...coinSearch.coinsMap, ...etfSearch.etfsMap, ...stockSearch.stocksMap };

  const isDashboardActive = step === "dashboard";
  // useMemo: sem isto, cada render criava arrays novos e os hooks de preços
  // (que dependem da identidade de `selected`) disparavam pedidos repetidos.
  const selectedCoins = useMemo(() => selected.filter((id) => !isYahooId(id)), [selected]);
  const selectedYahooAssets = useMemo(() => selected.filter(isYahooId), [selected]);

  const cryptoPrices = usePrices(selectedCoins, { active: isDashboardActive });
  const yahooPrices = useYahooPrices(selectedYahooAssets, { active: isDashboardActive });

  const prices = { ...cryptoPrices.prices, ...yahooPrices.prices };
  const loading = cryptoPrices.loading || yahooPrices.loading;
  const error = cryptoPrices.error || yahooPrices.error;
  const lastUpdated = [cryptoPrices.lastUpdated, yahooPrices.lastUpdated]
    .filter(Boolean)
    .sort((a, b) => b - a)[0] ?? null;
  const fetchPrices = (force) => {
    cryptoPrices.fetchPrices(force);
    yahooPrices.fetchPrices(force);
  };

  const toggleCoin = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const { portfolioData, totalValue, totalInvested, pnl, pnlPct, barData } = buildPortfolioData({
    selected,
    holdings,
    prices,
    coinsMap: assetsMap,
  });

  // Ativos já escolhidos (com quantidade definida) cujo preço ainda não chegou —
  // mostrados na tabela como linhas "a carregar" em vez de simplesmente não aparecerem.
  const pendingAssets = selected
    .filter((id) => (parseFloat(holdings[id]?.qty) || 0) > 0 && !prices[id])
    .map((id) => ({ ...assetsMap[id], id, type: getAssetType(id) }));

  const resetAll = () => {
    setStep("select");
    setSelected([]);
    setHoldings({});
    coinSearch.setSearch("");
    etfSearch.setSearch("");
    stockSearch.setSearch("");
  };

  return (
    <div className="root">
      <Header
        isDashboard={isDashboardActive}
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
              coinSearch={coinSearch}
              etfSearch={etfSearch}
              stockSearch={stockSearch}
              selected={selected}
              toggleCoin={toggleCoin}
              onContinue={() => setStep("amounts")}
            />
          )}

          {step === "amounts" && (
            <AmountsStep
              selected={selected}
              coinsMap={assetsMap}
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
              pendingAssets={pendingAssets}
              refreshingByType={{ crypto: cryptoPrices.loading, etf: yahooPrices.loading, stock: yahooPrices.loading }}
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
