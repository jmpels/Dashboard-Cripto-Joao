import { useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieTooltip } from "./ChartTooltips";
import { DownloadIcon } from "./DownloadIcon";
import { downloadSvgAsPng, findChartSvg } from "../utils/exportChartImage";

export function PortfolioPieChart({ portfolioData }) {
  const chartWrapRef = useRef(null);

  const handleDownload = () => {
    const legendItems = portfolioData.map((d) => ({ name: d.name, fill: d.fill, pct: d.pct }));
    downloadSvgAsPng(findChartSvg(chartWrapRef.current), "cryptfolio-distribuicao-portfolio.png", { legendItems });
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">DISTRIBUIÇÃO DO PORTFÓLIO</div>
        {portfolioData.length > 0 && (
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
      {portfolioData.length > 0 ? (
        <div ref={chartWrapRef}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={portfolioData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
              >
                {portfolioData.map((d) => (
                  <Cell key={d.id} fill={d.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">Sem dados suficientes</div>
      )}
    </div>
  );
}
