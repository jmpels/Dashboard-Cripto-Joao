// A Yahoo Finance não permite pedidos diretos do browser (sem cabeçalhos CORS).
// Estes proxies gratuitos acrescentam-nos, mas falham ocasionalmente (são serviços
// de terceiros, não garantidos) — por isso devolvemos vários candidatos, tentados
// por ordem em fetchJsonCached, e o "stale fallback" da cache cobre o resto.
const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export function corsProxyUrls(url) {
  return PROXIES.map((build) => build(url));
}
