// Em Portugal o símbolo do euro vem depois do valor, com vírgula decimal (ex: "1.234,56 €").
export const fmt = (n) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(2).replace(".", ",")} M €`
    : n >= 1e3
    ? `${(n / 1e3).toFixed(2).replace(".", ",")} K €`
    : `${n.toFixed(2).replace(".", ",")} €`;

export const fmtPrice = (n) =>
  n >= 1
    ? `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} €`
    : `${n.toPrecision(4).replace(".", ",")} €`;
