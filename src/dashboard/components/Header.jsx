import { useLanguage } from "../i18n/LanguageContext";

export function Header({ isDashboard, loading, onRefresh, lastUpdated, theme, onToggleTheme }) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <div className="header">
      <div className="header-top">
        <div>
          <div className="logo">⬡ CRYPTFOLIO</div>
          <div className="logo-sub">{t("tagline")}</div>
        </div>
        <div className="header-right">
          <div className="badge">{t("live")}</div>
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label={lang === "pt" ? "Switch to English" : "Mudar para Português"}
            title={lang === "pt" ? "English" : "Português"}
          >
            {lang === "pt" ? "EN" : "PT"}
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? t("enableLightMode") : t("enableDarkMode")}
            title={theme === "dark" ? t("lightMode") : t("darkMode")}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      {isDashboard && (
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => onRefresh(true)} disabled={loading}>
            {loading ? t("refreshing") : t("refreshPrices")}
          </button>
          {lastUpdated && (
            <span className="header-updated">
              {lastUpdated.toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
