export function Header({ isDashboard, loading, onRefresh, lastUpdated, theme, onToggleTheme }) {
  return (
    <div className="header">
      <div className="header-top">
        <div>
          <div className="logo">⬡ CRYPTFOLIO</div>
          <div className="logo-sub">PORTFOLIO TRACKER</div>
        </div>
        <div className="header-right">
          <div className="badge">● LIVE</div>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      {isDashboard && (
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => onRefresh(true)} disabled={loading}>
            {loading ? "⟳ A ATUALIZAR..." : "⟳ ATUALIZAR PREÇOS"}
          </button>
          {lastUpdated && (
            <span className="header-updated">{lastUpdated.toLocaleTimeString("pt-PT")}</span>
          )}
        </div>
      )}
    </div>
  );
}
