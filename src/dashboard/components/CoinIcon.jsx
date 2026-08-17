// Ícone da coin (imagem da CoinGecko) com fallback para as iniciais do símbolo.
export function CoinIcon({ coin }) {
  if (coin?.thumb) {
    return (
      <img
        className="coin-icon"
        src={coin.thumb}
        alt={coin.symbol}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }
  return <div className="coin-icon-fallback">{coin?.symbol?.slice(0, 2)}</div>;
}
