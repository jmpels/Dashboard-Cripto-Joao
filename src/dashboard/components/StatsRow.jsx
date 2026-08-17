import { fmt } from "../utils/format";

export function StatsRow({ totalValue, totalInvested, pnl, pnlPct, coinCount }) {
  const pnlClass = pnl >= 0 ? "green" : "red";
  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-label">VALOR TOTAL</div>
        <div className="stat-value">{fmt(totalValue)}</div>
      </div>
      {totalInvested > 0 && (
        <>
          <div className="stat-card">
            <div className="stat-label">TOTAL INVESTIDO</div>
            <div className="stat-value">{fmt(totalInvested)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">P&L</div>
            <div className={`stat-value ${pnlClass}`}>
              {pnl >= 0 ? "+" : ""}
              {fmt(pnl)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">RETORNO</div>
            <div className={`stat-value ${pnlClass}`}>
              {pnlPct >= 0 ? "+" : ""}
              {pnlPct.toFixed(1)}%
            </div>
          </div>
        </>
      )}
      <div className="stat-card">
        <div className="stat-label">MOEDAS</div>
        <div className="stat-value">{coinCount}</div>
      </div>
    </div>
  );
}
