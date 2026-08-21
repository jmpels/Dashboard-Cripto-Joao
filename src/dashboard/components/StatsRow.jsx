import { fmt } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

export function StatsRow({ totalValue, totalInvested, pnl, pnlPct, coinCount }) {
  const { t } = useLanguage();
  const pnlClass = pnl >= 0 ? "green" : "red";
  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-label">{t("statTotalValue")}</div>
        <div className="stat-value">{fmt(totalValue)}</div>
      </div>
      {totalInvested > 0 && (
        <>
          <div className="stat-card">
            <div className="stat-label">{t("statTotalInvested")}</div>
            <div className="stat-value">{fmt(totalInvested)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t("statPnl")}</div>
            <div className={`stat-value ${pnlClass}`}>
              {pnl >= 0 ? "+" : ""}
              {fmt(pnl)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t("statReturn")}</div>
            <div className={`stat-value ${pnlClass}`}>
              {pnlPct >= 0 ? "+" : ""}
              {pnlPct.toFixed(1)}%
            </div>
          </div>
        </>
      )}
      <div className="stat-card">
        <div className="stat-label">{t("statAssets")}</div>
        <div className="stat-value">{coinCount}</div>
      </div>
    </div>
  );
}
