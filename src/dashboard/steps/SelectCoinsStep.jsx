import { CoinCard } from "../components/CoinCard";

export function SelectCoinsStep({
  search,
  setSearch,
  searching,
  searchError,
  searchResults,
  displayedCoins,
  selected,
  toggleCoin,
  onContinue,
}) {
  return (
    <>
      <div className="step-title">Seleciona as tuas criptomoedas</div>
      <div className="step-sub">
        Pesquisa entre todas as moedas listadas na CoinGecko — ou escolhe uma das principais abaixo.
      </div>
      <input
        className="search-box"
        placeholder="🔍 Pesquisar qualquer moeda (ex: pepe, jupiter, render...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="search-status">
        {searching && "A pesquisar moedas..."}
        {!searching && searchError && searchError}
        {!searching && !searchError && searchResults !== null && `${searchResults.length} resultado(s)`}
        {!searching && searchResults === null && "A mostrar as principais moedas por capitalização"}
      </div>
      <div className="coin-grid">
        {displayedCoins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            selected={selected.includes(coin.id)}
            onToggle={() => toggleCoin(coin.id)}
          />
        ))}
        {searchResults !== null && !searching && searchResults.length === 0 && !searchError && (
          <div className="empty-state">Nenhuma moeda encontrada para "{search}"</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn" disabled={!selected.length} onClick={onContinue}>
          CONTINUAR →
        </button>
        {selected.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {selected.length} moeda{selected.length > 1 ? "s" : ""} selecionada
            {selected.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </>
  );
}
