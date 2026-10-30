import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../i18n/LanguageContext";
import { useAssetHistory } from "../hooks/useAssetHistory";
import { RANGES } from "../utils/history";
import { fmtPrice } from "../utils/format";

const fmtDate = (t, range) =>
  new Date(t).toLocaleDateString(
    undefined,
    range === "1Y" || range === "6M"
      ? { month: "short", year: "2-digit" }
      : { day: "numeric", month: "short" },
  );

export function AssetHistoryChart({ asset, positions }) {
  const { t } = useLanguage();
  const [range, setRange] = useState("1M");
  const { points, currency, loading, error } = useAssetHistory(
    asset.assetId ?? asset.id,
    range,
  );

  const first = points[0]?.price;
  const last = points[points.length - 1]?.price;
  const change = first && last ? ((last - first) / first) * 100 : null;
  const up = change == null || change >= 0;
  const color = up ? "#22c55e" : "#ef4444";
  const gradId = `grad-${asset.id}`;

  return (
    <div className="chart-card history-card">
      <div className="chart-header history-header">
        <div className="history-title">
          <strong>{asset.name}</strong>
          <span className="history-sub">{asset.fullName}</span>
        </div>

        <div className="chart-header-actions">
          {change != null && (
            <span className={up ? "pnl-pos" : "pnl-neg"}>
              {up ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
            </span>
          )}
          <div className="view-toggle" role="group">
            {Object.keys(RANGES).map((r) => (
              <button
                key={r}
                className={r === range ? "active" : ""}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 200 }}>
        {loading && points.length === 0 ? (
          <div className="empty-state">
            <span className="spin-icon">⟳</span> {t("loadingHistory")}
          </div>
        ) : error ? (
          <div className="empty-state">{t("historyError")}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => fmtDate(v, range)}
                minTickGap={40}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                width={52}
                tickFormatter={(v) =>
                  v >= 1000
                    ? `${(v / 1000).toFixed(1)}K`
                    : v.toFixed(v < 1 ? 3 : 0)
                }
                tick={{
                  fill: "var(--text-tertiary)",
                  fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [fmtPrice(v), t("colPrice")]}
                labelFormatter={(v) => new Date(v).toLocaleString()}
                cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
                  padding: "8px 10px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                }}
                labelStyle={{ color: "var(--text-secondary)", marginBottom: 4 }}
                itemStyle={{
                  color: "var(--text-primary, var(--text))",
                  padding: 0,
                }}
              />
              {currency === "EUR" &&
                positions
                  .filter((p) => p.buyPrice > 0)
                  .map((p) => (
                    <ReferenceLine
                      key={p.id}
                      y={p.buyPrice}
                      stroke="var(--text-tertiary)"
                      strokeDasharray="4 4"
                      label={{
                        value: p.name,
                        fill: "var(--text-tertiary)",
                        fontSize: 10,
                        position: "insideTopRight",
                      }}
                    />
                  ))}
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
