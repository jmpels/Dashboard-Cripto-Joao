import { useState } from "react";
import { CoinCard } from "../components/CoinCard";
import { useLanguage } from "../i18n/LanguageContext";

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

export function SelectCoinsStep({ coinSearch, etfSearch, stockSearch, selected, toggleCoin, onContinue }) {
  const { t } = useLanguage();
  const [assetType, setAssetType] = useState("crypto");

  const TYPES = {
    crypto: { label: t("typeCrypto"), placeholder: t("placeholderCrypto") },
    etf: { label: t("typeEtf"), placeholder: t("placeholderEtf") },
    stock: { label: t("typeStock"), placeholder: t("placeholderStock") },
  };

  const active = { crypto: coinSearch, etf: etfSearch, stock: stockSearch }[assetType];
  const { search, setSearch, searching, searchError, searchResults } = active;
  const displayedAssets =
    assetType === "crypto" ? coinSearch.displayedCoins : assetType === "etf" ? etfSearch.displayedEtfs : stockSearch.displayedStocks;
  const { placeholder } = TYPES[assetType];
  const typeKey = capitalize(assetType); // "Crypto" | "Etf" | "Stock" — bate certo com os nomes das chaves de tradução

  return (
    <>
      <div className="step-title">{t("selectTitle")}</div>
      <div className="step-sub">{t("selectSubtitle")}</div>

      <div className="asset-type-tabs">
        {Object.entries(TYPES).map(([type, { label }]) => (
          <button
            key={type}
            className={`asset-type-tab ${assetType === type ? "active" : ""}`}
            onClick={() => setAssetType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        className="search-box"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="search-status">
        {searching && (
          <span className="search-status-loading">
            <span className="spin-icon">⟳</span> {t(`searching${typeKey}`)}
          </span>
        )}
        {!searching && searchError && searchError}
        {!searching && !searchError && searchResults !== null && t("searchResultsCount", { count: searchResults.length })}
        {!searching && searchResults === null && t(`showingPopular${typeKey}`)}
      </div>
      <div className="coin-grid">
        {displayedAssets.map((asset) => (
          <CoinCard
            key={asset.id}
            coin={asset}
            selected={selected.includes(asset.id)}
            onToggle={() => toggleCoin(asset.id)}
          />
        ))}
        {searchResults !== null && !searching && searchResults.length === 0 && !searchError && (
          <div className="empty-state">{t(`noneFound${typeKey}`, { query: search })}</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn" disabled={!selected.length} onClick={onContinue}>
          {t("continue")}
        </button>
        {selected.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {t("assetsSelected", { count: selected.length, s: selected.length > 1 ? "s" : "" })}
          </span>
        )}
      </div>
    </>
  );
}
