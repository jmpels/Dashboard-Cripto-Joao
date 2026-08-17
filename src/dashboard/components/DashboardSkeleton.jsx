// Placeholder mostrado apenas no primeiro carregamento do dashboard, para o
// utilizador ver logo a estrutura em vez de um ecrã vazio a piscar "a carregar".
export function DashboardSkeleton() {
  return (
    <div>
      <div className="stats-row">
        {[0, 1, 2, 3].map((i) => (
          <div className="stat-card" key={i}>
            <div className="skeleton-block" style={{ width: "60%", height: 10, marginBottom: 10 }} />
            <div className="skeleton-block" style={{ width: "80%", height: 22 }} />
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <div className="skeleton-block" style={{ width: 160, height: 12, marginBottom: 16 }} />
          <div className="skeleton-block" style={{ width: 200, height: 200, borderRadius: "50%", margin: "0 auto" }} />
        </div>
        <div className="chart-card">
          <div className="skeleton-block" style={{ width: 160, height: 12, marginBottom: 16 }} />
          <div className="skeleton-block" style={{ width: "100%", height: 200 }} />
        </div>
      </div>
      <div className="chart-card">
        <div className="skeleton-block" style={{ width: 160, height: 12, marginBottom: 16 }} />
        {[0, 1, 2].map((i) => (
          <div className="skeleton-block" key={i} style={{ width: "100%", height: 36, marginBottom: 8 }} />
        ))}
      </div>
    </div>
  );
}
