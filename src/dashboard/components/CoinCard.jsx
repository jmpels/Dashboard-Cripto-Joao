import { CoinIcon } from "./CoinIcon";

export function CoinCard({ coin, selected, onToggle }) {
  return (
    <div className={`coin-card ${selected ? "active" : ""}`} onClick={onToggle}>
      <CoinIcon coin={coin} />
      <div style={{ minWidth: 0 }}>
        <div className="coin-symbol">{coin.symbol}</div>
        <div className="coin-name">{coin.name}</div>
        {coin.rank && <div className="coin-rank">#{coin.rank} market cap</div>}
      </div>
      <div className={`check ${selected ? "on" : ""}`}>{selected ? "✓" : ""}</div>
    </div>
  );
}
