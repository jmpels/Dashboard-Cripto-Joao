import { CoinIcon } from "../components/CoinIcon";
import { useLanguage } from "../i18n/LanguageContext";

export function AmountsStep({ selected, coinsMap, holdings, setHoldings, onBack, onContinue }) {
  const { t } = useLanguage();
  const canContinue = selected.some((id) => parseFloat(holdings[id]?.qty) > 0);

  const updateHolding = (id, field, value) =>
    setHoldings((h) => ({ ...h, [id]: { ...h[id], [field]: value } }));

  return (
    <>
      <div className="step-title">{t("amountsTitle")}</div>
      <div className="step-sub">{t("amountsSubtitle")}</div>
      <div className="amount-grid">
        {selected.map((id) => {
          const coin = coinsMap[id];
          return (
            <div className="amount-row" key={id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CoinIcon coin={coin} />
                <div>
                  <div className="amount-label">{coin?.symbol}</div>
                  <div className="amount-sub">{coin?.name}</div>
                </div>
              </div>
              <div>
                <div className="input-label">{t("quantity")}</div>
                <input
                  className="amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder={t("quantityPlaceholder")}
                  value={holdings[id]?.qty || ""}
                  onChange={(e) => updateHolding(id, "qty", e.target.value)}
                />
              </div>
              <div>
                <div className="input-label">{t("buyPriceLabel")}</div>
                <input
                  className="amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder={t("buyPricePlaceholder")}
                  value={holdings[id]?.buyPrice || ""}
                  onChange={(e) => updateHolding(id, "buyPrice", e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-ghost" onClick={onBack}>
          {t("back")}
        </button>
        <button className="btn" onClick={onContinue} disabled={!canContinue}>
          {t("viewDashboard")}
        </button>
      </div>
    </>
  );
}
