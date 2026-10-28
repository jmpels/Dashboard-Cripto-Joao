import { getAssetType } from "./assetType";

const SEP = "::";
const TYPE_ORDER = { crypto: 0, etf: 1, stock: 2 };

export const baseId = (key) => String(key ?? "").split(SEP)[0];
export const isVariant = (key) => String(key ?? "").includes(SEP);
export const newVariantKey = (id) => `${id}${SEP}${Date.now()}`;

export const addPosition = (holdings, id, { qty, buyPrice }) => ({
  ...holdings,
  [newVariantKey(id)]: { qty, buyPrice },
});

export const removePosition = (holdings, key) => {
  const { [key]: _removed, ...rest } = holdings;
  return rest;
};

export const removeAssetPositions = (holdings, id) =>
  Object.fromEntries(Object.entries(holdings).filter(([k]) => baseId(k) !== id));

// Order: coins → ETFs → stocks. Inside a type, follow the order the user
// selected them. Inside an asset, original first, then variants by date.
export const sortPositionKeys = (keys, selected) =>
  [...keys].sort((a, b) => {
    const ia = baseId(a);
    const ib = baseId(b);
    if (ia !== ib) {
      const ta = TYPE_ORDER[getAssetType(ia)] ?? 9;
      const tb = TYPE_ORDER[getAssetType(ib)] ?? 9;
      if (ta !== tb) return ta - tb;
      return selected.indexOf(ia) - selected.indexOf(ib);
    }
    if (!isVariant(a)) return -1;
    if (!isVariant(b)) return 1;
    return a.localeCompare(b); // timestamps, same length
  });

// ex: 
// holdings = {
//   bitcoin:           { qty: "0.5", /* your invested field */ },  // first buy
//   "bitcoin::1730..": { qty: "0.1", /* ... */ },                  // variant
// }
//