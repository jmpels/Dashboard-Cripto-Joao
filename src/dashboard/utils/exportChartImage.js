const COLOR_ATTRS = ["fill", "stroke", "stop-color"];
const VAR_PATTERN = /var\((--[a-zA-Z0-9-]+)\)/g;

// O recharts também desenha pequenos <svg> à parte para os ícones da legenda —
// escolhe sempre o maior <svg> do contentor, que é sempre o gráfico principal
// (um ícone de legenda ampliado para o tamanho da imagem sairia como um
// quadrado sólido de uma cor só).
export function findChartSvg(container) {
  const svgs = Array.from(container?.querySelectorAll("svg") ?? []);
  return svgs.reduce(
    (best, el) => (el.clientWidth * el.clientHeight > (best?.clientWidth ?? 0) * (best?.clientHeight ?? 0) ? el : best),
    null
  );
}

// Substitui var(--token) por cores fixas em toda a árvore do SVG. Necessário porque
// o Safari/iOS não resolve de forma fiável custom properties num SVG usado como
// imagem isolada (fora da página) — sem isto, cores como as linhas dos eixos ou o
// fundo do gráfico saíam inválidas/erradas na imagem exportada.
function inlineThemeColors(svgRoot) {
  const styles = getComputedStyle(document.documentElement);
  const resolve = (value) =>
    value.replace(VAR_PATTERN, (_, name) => styles.getPropertyValue(name).trim() || "currentColor");

  const walk = (el) => {
    COLOR_ATTRS.forEach((attr) => {
      const value = el.getAttribute?.(attr);
      if (value?.includes("var(")) el.setAttribute(attr, resolve(value));
    });
    const styleAttr = el.getAttribute?.("style");
    if (styleAttr?.includes("var(")) el.setAttribute("style", resolve(styleAttr));
    // O clip-path por url(#id) não é fiável em SVGs usados como imagem isolada;
    // removê-lo aqui só tira o recorte fino nas margens, não a forma do gráfico.
    el.removeAttribute?.("clip-path");
    Array.from(el.children ?? []).forEach(walk);
  };
  walk(svgRoot);
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Desenha a legenda (quadradinho de cor + "SYM 12.3%") diretamente em SVG, com
// quebra de linha automática — a legenda do recharts é HTML por fora do <svg>,
// por isso não sai "de borla" ao exportar o gráfico como imagem.
function buildLegendMarkup({ items, x, y, maxWidth, fontSize = 12, rowHeight = 22, textColor }) {
  const charWidth = fontSize * 0.62; // aproximação para fonte monoespaçada (DM Mono)
  const swatchSize = 11;
  const swatchGap = 7;
  const itemGap = 18;

  let cursorX = x;
  let cursorY = y;
  const parts = [];

  items.forEach((item) => {
    const label = `${item.name} ${item.pct.toFixed(1)}%`;
    const itemWidth = swatchSize + swatchGap + label.length * charWidth;

    if (cursorX + itemWidth > x + maxWidth && cursorX > x) {
      cursorX = x;
      cursorY += rowHeight;
    }

    parts.push(
      `<rect x="${cursorX}" y="${cursorY}" width="${swatchSize}" height="${swatchSize}" rx="2" fill="${item.fill}" />` +
        `<text x="${cursorX + swatchSize + swatchGap}" y="${cursorY + swatchSize - 1.5}" ` +
        `font-family="'DM Mono', monospace" font-size="${fontSize}" fill="${textColor}">${escapeXml(label)}</text>`
    );

    cursorX += itemWidth + itemGap;
  });

  return { markup: parts.join(""), height: cursorY - y + rowHeight };
}

// Exporta um elemento <svg> (o gráfico do recharts) como PNG e despoleta a
// descarga no browser. `scale` aumenta a resolução da imagem gerada (retina).
// `legendItems` (opcional) é uma lista [{ name, fill, pct }] desenhada por baixo
// do gráfico, para a imagem final incluir a legenda das moedas.
export async function downloadSvgAsPng(svgEl, filename, { scale = 2, legendItems } = {}) {
  if (!svgEl) return;

  const chartWidth = svgEl.clientWidth || 600;
  const chartHeight = svgEl.clientHeight || 320;
  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text-primary").trim() || "#e6edf3";

  let legendMarkup = "";
  let legendHeight = 0;
  if (legendItems?.length) {
    const legendPaddingX = 20;
    const built = buildLegendMarkup({
      items: legendItems,
      x: legendPaddingX,
      y: chartHeight + 18,
      maxWidth: chartWidth - legendPaddingX * 2,
      textColor,
    });
    legendMarkup = built.markup;
    legendHeight = built.height + 12;
  }

  const width = chartWidth;
  const height = chartHeight + legendHeight;

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  clone.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", styles.getPropertyValue("--bg-surface").trim());
  clone.insertBefore(bgRect, clone.firstChild);

  inlineThemeColors(clone);

  if (legendMarkup) {
    const parsedGroup = new DOMParser()
      .parseFromString(`<svg xmlns="http://www.w3.org/2000/svg"><g>${legendMarkup}</g></svg>`, "image/svg+xml")
      .documentElement.firstChild;
    // importNode em vez de appendChild direto: o nó vem de um document parseado à
    // parte, e alguns motores (Safari incluído) não o adotam de forma fiável sozinhos.
    clone.appendChild(document.importNode(parsedGroup, true));
  }

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const pngUrl = URL.createObjectURL(pngBlob);
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
