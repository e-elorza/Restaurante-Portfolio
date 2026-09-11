/**
 * Gera as imagens de demonstração usadas pelo `npm run db:seed`.
 *
 * As imagens são composições abstratas criadas localmente (sem depender de
 * nenhum serviço externo) e gravadas em `public/demo`. Elas existem apenas para
 * que o projeto tenha uma aparência completa antes do restaurante enviar as
 * fotos reais pelo painel (Admin > Mídia).
 *
 * Uso: node scripts/generate-demo-assets.mjs
 * Requer `sharp` (já disponível como dependência do Next.js).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "demo");

const PALETTES = {
  ember: ["#7C2D12", "#D2551A", "#FBBF24"],
  charcoal: ["#171412", "#43382F", "#C2410C"],
  olive: ["#33361C", "#6B7A2F", "#D9E06B"],
  wine: ["#3F0716", "#9F1239", "#F9A8D4"],
  amber: ["#6B2E0A", "#D97706", "#FDE68A"],
  night: ["#0C0A09", "#2B2724", "#A8A29E"],
  clay: ["#4A2415", "#A8613C", "#F5D0A9"],
  smoke: ["#1C1917", "#57534E", "#E7E5E4"],
};

const PALETTE_NAMES = Object.keys(PALETTES);

/** Gerador determinístico simples — a mesma chave produz sempre a mesma arte. */
function rng(seedText) {
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Composição abstrata inspirada em um prato visto de cima. */
function composition(width, height, random, accent) {
  const cx = width * (0.36 + random() * 0.28);
  const cy = height * (0.34 + random() * 0.24);
  const r = Math.min(width, height) * (0.24 + random() * 0.12);
  const rotation = Math.round(random() * 40 - 20);
  const layers = 3 + Math.floor(random() * 3);

  const strata = Array.from({ length: layers }, (_, index) => {
    const w = r * (1.15 - index * 0.1 - random() * 0.08);
    const h = r * (0.14 + random() * 0.08);
    const y = cy - r * 0.34 + index * (r * 0.26);
    return `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFFFFF" fill-opacity="${(0.24 - index * 0.035).toFixed(3)}"/>`;
  }).join("");

  const arcRadius = r * (1.35 + random() * 0.35);
  const arcOpacity = (0.18 + random() * 0.2).toFixed(2);

  return `
  <g transform="rotate(${rotation} ${cx} ${cy})">
    <circle cx="${cx}" cy="${cy}" r="${r * 1.26}" fill="#FFFFFF" fill-opacity="0.045"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" fill-opacity="0.07"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="${Math.max(1, r * 0.014)}"/>
    ${strata}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${arcRadius}" fill="none" stroke="${accent}" stroke-opacity="${arcOpacity}" stroke-width="${Math.max(1, r * 0.03)}" stroke-dasharray="${r * 1.9} ${r * 3.4}" transform="rotate(${rotation + 120} ${cx} ${cy})"/>`;
}

function svg({ width, height, palette, seed = "", motif = "plate" }) {
  const [from, to, accent] = PALETTES[palette] ?? PALETTES.ember;
  const random = rng(`${seed}:${palette}:${width}x${height}`);
  const angle = Math.round(random() * 90);

  const mark = () => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.16;
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.38" stroke-width="${r * 0.06}"/>
      <path d="M ${cx - r * 0.42} ${cy + r * 0.14} q ${r * 0.42} ${-r * 0.64} ${r * 0.84} 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="${r * 0.09}" stroke-linecap="round"/>
      <line x1="${cx - r * 0.42}" y1="${cy + r * 0.42}" x2="${cx + r * 0.42}" y2="${cy + r * 0.42}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="${r * 0.09}" stroke-linecap="round"/>
    </g>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${Math.round(25 + random() * 50)}%" cy="${Math.round(20 + random() * 40)}%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="48%" r="76%">
      <stop offset="52%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
    </radialGradient>
    <pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="1" height="7" fill="#FFFFFF" fill-opacity="0.028"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  ${motif === "plate" ? composition(width, height, random, accent) : ""}
  ${motif === "mark" ? mark() : ""}
  <rect width="${width}" height="${height}" fill="url(#grain)"/>
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>
</svg>`;
}

async function render(name, options) {
  const file = path.join(OUT_DIR, `${name}.jpg`);
  await sharp(Buffer.from(svg({ seed: name, ...options })), { density: 110 })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(file);
  return file;
}

async function renderPng(name, options) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await sharp(Buffer.from(svg({ seed: name, ...options })), { density: 110 })
    .png({ palette: true, quality: 80, compressionLevel: 9 })
    .toFile(file);
  return file;
}

/** Logotipo em SVG (texto puro) — fica nítido em qualquer tamanho. */
function logoSvg(color = "#FFFFFF") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="140" viewBox="0 0 520 140">
  <g fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round">
    <circle cx="66" cy="70" r="40" stroke-opacity="0.55"/>
    <path d="M 44 76 q 22 -34 44 0" stroke-opacity="0.95"/>
    <line x1="44" y1="92" x2="88" y2="92" stroke-opacity="0.8"/>
  </g>
  <text x="126" y="66" font-family="Georgia, 'Times New Roman', serif" font-size="42" fill="${color}">Brasa &amp; Bordo</text>
  <text x="128" y="100" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="5" fill="${color}" fill-opacity="0.7">COZINHA DE FOGO</text>
</svg>`;
}

const PRODUCTS = [
  "produto-brasa-classico",
  "produto-duplo-defumado",
  "produto-cheddar-lento",
  "produto-horta-grelhada",
  "produto-picanha-bordo",
  "produto-frango-crocante",
  "produto-combo-brasa",
  "produto-combo-familia",
  "produto-batata-rustica",
  "produto-aneis-cebola",
  "produto-salada-defumada",
  "produto-limonada-brasa",
  "produto-refri-artesanal",
  "produto-cerveja-lager",
  "produto-brownie-fogo",
  "produto-pudim-defumado",
];

const CATEGORIES = [
  ["categoria-hamburgueres", "ember"],
  ["categoria-entradas", "olive"],
  ["categoria-combos", "clay"],
  ["categoria-acompanhamentos", "amber"],
  ["categoria-bebidas", "smoke"],
  ["categoria-sobremesas", "wine"],
];

const COVERS = [
  ["capa-cardapio", "clay"],
  ["capa-delivery", "ember"],
  ["capa-eventos", "wine"],
  ["capa-unidades", "smoke"],
  ["capa-contato", "olive"],
  ["home-banner", "ember"],
];

const LOCATIONS = ["unidade-centro", "unidade-jardins", "unidade-praia"];
const EVENTS = ["evento-noite-brasa", "evento-festival-burger", "evento-musica-quintal"];
const DELIVERY = [
  ["delivery-app-um", "ember"],
  ["delivery-app-dois", "olive"],
  ["delivery-app-tres", "smoke"],
  ["delivery-app-quatro", "wine"],
];

/** Distribui as paletas para que produtos vizinhos não fiquem iguais. */
const paletteFor = (index) => PALETTE_NAMES[(index * 3 + 1) % PALETTE_NAMES.length];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let count = 0;

  for (const [index, name] of PRODUCTS.entries()) {
    await render(name, { width: 1100, height: 825, palette: paletteFor(index) });
    count += 1;
  }
  for (const [name, palette] of CATEGORIES) {
    await render(name, { width: 1100, height: 825, palette });
    count += 1;
  }
  for (const [name, palette] of COVERS) {
    await render(name, { width: 1800, height: 820, palette });
    count += 1;
  }
  for (const [index, name] of LOCATIONS.entries()) {
    await render(name, { width: 1100, height: 825, palette: paletteFor(index + 2) });
    count += 1;
  }
  for (const [index, name] of EVENTS.entries()) {
    await render(name, { width: 1100, height: 825, palette: paletteFor(index + 5) });
    count += 1;
  }
  for (const [name, palette] of DELIVERY) {
    await renderPng(name, { width: 220, height: 220, palette, motif: "mark" });
    count += 1;
  }

  await render("home-destaque", { width: 2000, height: 1200, palette: "clay" });
  await render("home-destaque-celular", { width: 1000, height: 1400, palette: "clay" });
  await render("home-sobre", { width: 1100, height: 1300, palette: "clay" });
  await render("home-video-capa", { width: 1600, height: 900, palette: "night" });
  await render("rodape-imagem", { width: 1800, height: 620, palette: "night" });
  await render("imagem-compartilhamento", { width: 1200, height: 630, palette: "ember", motif: "mark" });
  count += 6;

  for (let i = 1; i <= 6; i += 1) {
    await render(`galeria-${i}`, { width: 820, height: 820, palette: paletteFor(i + 1) });
    count += 1;
  }

  await writeFile(path.join(OUT_DIR, "logo.svg"), logoSvg("#FFFFFF"), "utf8");
  await writeFile(path.join(OUT_DIR, "logo-escura.svg"), logoSvg("#1C1917"), "utf8");

  await sharp(Buffer.from(svg({ width: 512, height: 512, palette: "ember", motif: "mark", seed: "favicon" })), {
    density: 110,
  })
    .png({ palette: true, quality: 80, compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "favicon.png"));

  console.log(`✔ ${count + 3} arquivos gerados em public/demo`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
