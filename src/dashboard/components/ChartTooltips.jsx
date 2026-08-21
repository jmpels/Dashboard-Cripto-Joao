import { fmt } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

const tooltipBoxStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontFamily: "'DM Mono', monospace",
};

export const PieTooltip = ({ active, payload }) => {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBoxStyle}>
      <div style={{ color: d.fill, fontWeight: 700, fontSize: 13 }}>{d.name}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
        {d.pct.toFixed(2)}{t("ofPortfolio")}
      </div>
      <div style={{ color: "var(--text-primary)", fontSize: 12 }}>{fmt(d.value)}</div>
    </div>
  );
};

export const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBoxStyle}>
      <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill, fontSize: 12 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
      {payload.length === 2 && (
        <div
          style={{
            color: payload[1].value >= payload[0].value ? "var(--success)" : "var(--danger)",
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {payload[1].value >= payload[0].value ? "▲" : "▼"}{" "}
          {(((payload[1].value - payload[0].value) / (payload[0].value || 1)) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
};
