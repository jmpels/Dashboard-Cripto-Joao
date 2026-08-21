import { useState } from "react";

// Ícone do ativo (imagem da CoinGecko ou da CDN de logos) com fallback para as
// iniciais do símbolo caso não exista imagem ou a imagem falhe ao carregar.
export function CoinIcon({ coin }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (coin?.thumb && !imgFailed) {
    return (
      <img
        className="coin-icon"
        src={coin.thumb}
        alt={coin.symbol}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <div className="coin-icon-fallback">{coin?.symbol?.slice(0, 2)}</div>;
}
