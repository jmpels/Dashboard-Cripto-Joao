import { CoinIcon } from "./CoinIcon";
import { useLanguage } from "../i18n/LanguageContext";

export function CoinCard({ coin, selected, onToggle }) {
  const { t } = useLanguage();
  return (
    <div className={`coin-card ${selected ? "active" : ""}`} onClick={onToggle}>
      <CoinIcon coin={coin} />
      <div style={{ minWidth: 0 }}>
        <div className="coin-symbol">{coin.symbol}</div>
        <div className="coin-name">{coin.name}</div>
        {coin.rank && <div className="coin-rank">#{coin.rank} {t("marketCap")}</div>}
        {coin.mic && <div className="coin-rank">{coin.mic}</div>}
      </div>
      <div className={`check ${selected ? "on" : ""}`}>{selected ? "✓" : ""}</div>
    </div>
  );
}
