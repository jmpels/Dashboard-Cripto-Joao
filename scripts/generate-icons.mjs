// Gera os ícones da app (favicon, PWA, apple-touch-icon) a partir de um hexágono
// desenhado em SVG — mesma forma/cores do logo "⬡ CRYPTFOLIO" do cabeçalho.
// Corre com: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");

const BG = "#0d1117";
const GRAD_FROM = "#F7931A";
const GRAD_TO = "#FFD54A";

function hexagonPoints(cx, cy, r) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}

function buildSvg({ size = 512, hexRadius, cornerRadius = 0, transparent = false }) {
  const cx = size / 2;
  const cy = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${GRAD_FROM}"/>
      <stop offset="100%" stop-color="${GRAD_TO}"/>
    </linearGradient>
  </defs>
  ${transparent ? "" : `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BG}"/>`}
  <polygon points="${hexagonPoints(cx, cy, hexRadius)}" fill="url(#hexGrad)"/>
</svg>`;
}

async function writePng(svg, size, filePath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(filePath);
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  // Ícone normal ("any") — hexágono grande sobre fundo escuro
  const anySvg = buildSvg({ size: 512, hexRadius: 190, cornerRadius: 100 });
  await writePng(anySvg, 512, path.join(iconsDir, "icon-512.png"));
  await writePng(anySvg, 192, path.join(iconsDir, "icon-192.png"));

  // Ícone "maskable" — hexágono mais pequeno, dentro da safe-zone central (Android)
  const maskableSvg = buildSvg({ size: 512, hexRadius: 150 });
  await writePng(maskableSvg, 512, path.join(iconsDir, "icon-maskable-512.png"));

  // Apple touch icon — o iOS já arredonda os cantos sozinho
  const appleSvg = buildSvg({ size: 512, hexRadius: 190 });
  await writePng(appleSvg, 180, path.join(iconsDir, "apple-touch-icon.png"));

  // Favicon PNG (fallback para browsers sem suporte a SVG favicon)
  await writePng(anySvg, 32, path.join(iconsDir, "favicon-32.png"));

  // Favicon SVG (escala perfeita em qualquer tamanho)
  await writeFile(path.join(publicDir, "favicon.svg"), buildSvg({ size: 64, hexRadius: 24, cornerRadius: 14 }));

  console.log("Ícones gerados em", iconsDir, "e public/favicon.svg");
}

main();
