import { CoinIcon } from "../components/CoinIcon";

export function AmountsStep({ selected, coinsMap, holdings, setHoldings, onBack, onContinue }) {
  const canContinue = selected.some((id) => parseFloat(holdings[id]?.qty) > 0);

  const updateHolding = (id, field, value) =>
    setHoldings((h) => ({ ...h, [id]: { ...h[id], [field]: value } }));

  return (
    <>
      <div className="step-title">Quantidades & Investimento</div>
      <div className="step-sub">
        Insere a quantidade que tens de cada moeda e, opcionalmente, quanto investiste (em EUR)
      </div>
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
                <div className="input-label">QUANTIDADE</div>
                <input
                  className="amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="ex: 0.5"
                  value={holdings[id]?.qty || ""}
                  onChange={(e) => updateHolding(id, "qty", e.target.value)}
                />
              </div>
              <div>
                <div className="input-label">INVESTIDO (EUR) — opcional</div>
                <input
                  className="amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="ex: 1000"
                  value={holdings[id]?.invested || ""}
                  onChange={(e) => updateHolding(id, "invested", e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-ghost" onClick={onBack}>
          ← VOLTAR
        </button>
        <button className="btn" onClick={onContinue} disabled={!canContinue}>
          VER DASHBOARD →
        </button>
      </div>
    </>
  );
}
