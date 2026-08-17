import { useEffect, useState } from "react";
import { fmt, fmtPrice } from "../utils/format";

// Input isolado com o seu próprio rascunho: só escreve em `holdings` (via onCommit)
// ao sair do campo. Assim, limpar o valor para escrever um novo (ex: "2" -> "2.5")
// não faz a linha desaparecer a meio da edição (a tabela só mostra coins com qty > 0).
function EditableQtyCell({ id, value, onCommit }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <input
      className="qty-edit-input"
      type="number"
      min="0"
      step="any"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => onCommit(id, draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
      }}
    />
  );
}

const SORT_OPTIONS = [
  { key: "value", label: "Valor atual" },
  { key: "name", label: "Nome" },
  { key: "pnl", label: "P&L" },
  { key: "pct", label: "% Portfólio" },
  { key: "price", label: "Preço" },
  { key: "change24h", label: "24h" },
];

function sortValue(d, key) {
  switch (key) {
    case "name":
      return d.name;
    case "pnl":
      return d.invested > 0 ? d.value - d.invested : -Infinity;
    case "pct":
      return d.pct;
    case "price":
      return d.price;
    case "change24h":
      return d.change24h ?? -Infinity;
    default:
      return d.value;
  }
}

export function HoldingsTable({ portfolioData, holdings, onQtyChange }) {
  const [sortKey, setSortKey] = useState("value");
  const [sortDir, setSortDir] = useState("desc");

  const sortedData = [...portfolioData].sort((a, b) => {
    const va = sortValue(a, sortKey);
    const vb = sortValue(b, sortKey);
    const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">BREAKDOWN POR MOEDA</div>
        <div className="sort-controls">
          <select
            className="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Ordenar por"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            className="chart-download-btn"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={sortDir === "asc" ? "Ordem ascendente" : "Ordem descendente"}
            title={sortDir === "asc" ? "Ascendente" : "Descendente"}
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>MOEDA</th>
              <th>PREÇO</th>
              <th>24H</th>
              <th>QUANTIDADE</th>
              <th>VALOR ATUAL</th>
              <th>INVESTIDO</th>
              <th>P&L</th>
              <th>% PORTFÓLIO</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d) => {
              const coinPnl = d.invested > 0 ? d.value - d.invested : null;
              const coinPnlPct = d.invested > 0 ? ((d.value - d.invested) / d.invested) * 100 : null;
              return (
                <tr key={d.id}>
                  <td data-label="MOEDA">
                    <span className="dot" style={{ background: d.fill }} />
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{d.name}</span>
                    <div style={{ color: "var(--text-secondary)", marginLeft: 14 }}>{d.fullName}</div>
                  </td>
                  <td className="mono" data-label="PREÇO">
                    {fmtPrice(d.price)}
                  </td>
                  <td className="mono" data-label="24H">
                    {d.change24h !== null ? (
                      <span className={d.change24h >= 0 ? "pnl-pos" : "pnl-neg"}>
                        {d.change24h >= 0 ? "▲" : "▼"} {Math.abs(d.change24h).toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-tertiary)" }}>—</span>
                    )}
                  </td>
                  <td className="mono" data-label="QUANTIDADE">
                    <EditableQtyCell
                      id={d.id}
                      value={holdings[d.id]?.qty ?? String(d.qty)}
                      onCommit={onQtyChange}
                    />
                  </td>
                  <td className="mono" data-label="VALOR ATUAL">
                    {fmt(d.value)}
                  </td>
                  <td className="mono" data-label="INVESTIDO">
                    {d.invested > 0 ? fmt(d.invested) : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </td>
                  <td className="mono" data-label="P&L">
                    {coinPnl !== null ? (
                      <span className={coinPnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                        {coinPnl >= 0 ? "+" : ""}
                        {fmt(coinPnl)}{" "}
                        <span>
                          ({coinPnlPct >= 0 ? "+" : ""}
                          {coinPnlPct.toFixed(1)}%)
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-tertiary)" }}>—</span>
                    )}
                  </td>
                  <td className="mono" data-label="% PORTFÓLIO">
                    {d.pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
