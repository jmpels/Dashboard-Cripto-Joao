import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarTooltip } from "./ChartTooltips";
import { DownloadIcon } from "./DownloadIcon";
import { downloadSvgAsPng, findChartSvg } from "../utils/exportChartImage";

export function PortfolioBarChart({ barData }) {
  const chartWrapRef = useRef(null);

  const handleDownload = () => {
    downloadSvgAsPng(findChartSvg(chartWrapRef.current), "cryptfolio-investido-vs-atual.png");
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">INVESTIDO vs ATUAL (EUR)</div>
        {barData.length > 0 && (
          <button
            className="chart-download-btn"
            onClick={handleDownload}
            aria-label="Guardar imagem do gráfico"
            title="Guardar imagem"
          >
            <DownloadIcon />
          </button>
        )}
      </div>
      {barData.length > 0 ? (
        <div ref={chartWrapRef}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--bg-surface-2)" }} />
              <Bar dataKey="Investido" fill="var(--border)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Atual" radius={[4, 4, 0, 0]}>
                {barData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">
          Insere valores investidos
          <br />
          para ver a comparação
        </div>
      )}
    </div>
  );
}
