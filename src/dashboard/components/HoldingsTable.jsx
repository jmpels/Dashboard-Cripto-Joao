import { useEffect, useState } from "react";
import { fmt, fmtPrice } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";
import { CoinIcon } from "./CoinIcon";

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

export function HoldingsTable({ portfolioData, pendingAssets = [], refreshingByType = {}, holdings, onQtyChange }) {
  const { t } = useLanguage();
  const [sortKey, setSortKey] = useState("value");
  const [sortDir, setSortDir] = useState("desc");

  const SORT_OPTIONS = [
    { key: "value", label: t("sortValue") },
    { key: "name", label: t("sortName") },
    { key: "pnl", label: t("sortPnl") },
    { key: "pct", label: t("sortPct") },
    { key: "price", label: t("sortPrice") },
    { key: "change24h", label: t("sortChange24h") },
  ];

  const ASSET_TYPE_LABEL = { crypto: t("typeCryptoBadge"), etf: t("typeEtfBadge"), stock: t("typeStockBadge") };

  const sortedData = [...portfolioData].sort((a, b) => {
    const va = sortValue(a, sortKey);
    const vb = sortValue(b, sortKey);
    const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">{t("breakdownTitle")}</div>
        <div className="sort-controls">
          <select
            className="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label={t("sortBy")}
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
            aria-label={sortDir === "asc" ? t("sortAsc") : t("sortDesc")}
            title={sortDir === "asc" ? t("ascending") : t("descending")}
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      {(pendingAssets.length > 0 || refreshingByType.crypto || refreshingByType.etf || refreshingByType.stock) && (
        <div className="search-status-loading" style={{ marginBottom: 12, fontSize: 11 }}>
          <span className="spin-icon">⟳</span> {t("breakdownLoadingNotice")}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t("colAsset")}</th>
              <th>{t("colPrice")}</th>
              <th>{t("col24h")}</th>
              <th>{t("colQuantity")}</th>
              <th>{t("colCurrentValue")}</th>
              <th>{t("colInvested")}</th>
              <th>P&L</th>
              <th>{t("colPct")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d) => {
              const coinPnl = d.invested > 0 ? d.value - d.invested : null;
              const coinPnlPct = d.invested > 0 ? ((d.value - d.invested) / d.invested) * 100 : null;
              return (
                <tr key={d.id}>
                  <td className="asset-cell" data-label={t("colAsset")}>
                    <CoinIcon coin={{ thumb: d.thumb, symbol: d.name }} />
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginLeft: 8 }}>{d.name}</span>
                    <span className={`type-badge type-badge-${d.type}`}>{ASSET_TYPE_LABEL[d.type]}</span>
                    <div style={{ color: "var(--text-secondary)", marginLeft: 14 }}>{d.fullName}</div>
                  </td>
                  <td className="mono" data-label={t("colPrice")}>
                    {fmtPrice(d.price)}
                    {refreshingByType[d.type] && (
                      <span className="spin-icon" style={{ marginLeft: 6 }} title={t("refreshingAsset")}>
                        ⟳
                      </span>
                    )}
                  </td>
                  <td className="mono" data-label={t("col24h")}>
                    {d.change24h !== null ? (
                      <span className={d.change24h >= 0 ? "pnl-pos" : "pnl-neg"}>
                        {d.change24h >= 0 ? "▲" : "▼"} {Math.abs(d.change24h).toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-tertiary)" }}>—</span>
                    )}
                  </td>
                  <td className="mono" data-label={t("colQuantity")}>
                    <EditableQtyCell
                      id={d.id}
                      value={holdings[d.id]?.qty ?? String(d.qty)}
                      onCommit={onQtyChange}
                    />
                  </td>
                  <td className="mono" data-label={t("colCurrentValue")}>
                    {fmt(d.value)}
                  </td>
                  <td className="mono" data-label={t("colInvested")}>
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
                  <td className="mono" data-label={t("colPct")}>
                    {d.pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            {pendingAssets.map((a) => (
              <tr key={a.id} className="pending-row" aria-busy="true">
                <td className="asset-cell" data-label={t("colAsset")}>
                  <CoinIcon coin={a} />
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginLeft: 8 }}>
                    {a.symbol}
                  </span>
                  <span className={`type-badge type-badge-${a.type}`}>{ASSET_TYPE_LABEL[a.type]}</span>
                  <div style={{ color: "var(--text-tertiary)", marginLeft: 14 }}>{t("loadingAsset")}</div>
                </td>
                <td className="mono" data-label={t("colPrice")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label={t("col24h")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label={t("colQuantity")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label={t("colCurrentValue")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label={t("colInvested")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label="P&L">
                  <span className="skeleton-block skeleton-cell" />
                </td>
                <td className="mono" data-label={t("colPct")}>
                  <span className="skeleton-block skeleton-cell" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
