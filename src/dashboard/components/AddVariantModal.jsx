import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export function AddVariantModal({ symbol, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [qty, setQty] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const q = parseFloat(qty);
  const p = parseFloat(buyPrice);
  const valid = q > 0 && buyPrice !== "" && p >= 0;
  const total = valid ? q * p : null;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => valid && onSubmit({ qty, buyPrice });
  const onEnter = (e) => e.key === "Enter" && submit();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t("addVariantTitle")}</div>
            <h3 className="modal-title">{symbol}</h3>
          </div>
          <button
            type="button"
            className="icon-btn modal-close"
            onClick={onClose}
            aria-label={t("cancel")}
          >
            ×
          </button>
        </div>

        <label className="modal-field">
          <span>{t("quantity")}</span>
          <div className="modal-input">
            <input
              type="number" min="0" step="any" placeholder="0.00"
              value={qty} autoFocus
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={onEnter}
            />
          </div>
        </label>

        <label className="modal-field">
          <span>{t("buyPriceUnit")}</span>
          <div className="modal-input">
            <input
              type="number" min="0" step="any" placeholder="0.00"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              onKeyDown={onEnter}
            />
            <span className="modal-suffix">€</span>
          </div>
        </label>

        <div className="modal-total">
          <span>{t("totalPaid")}</span>
          <strong>
            {total == null
              ? "—"
              : total.toLocaleString(undefined, { style: "currency", currency: "EUR" })}
          </strong>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className="modal-primary"
            disabled={!valid}
            onClick={submit}
          >
            {t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}