// Generates the static, animated SVGs used by README.md, in dark and light variants.
//   node scripts/build-assets.mjs
// Output: assets/<name>-dark.svg and assets/<name>-light.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { THEMES, baseStyle, svg, esc, monoWidth, sansWidth, wrap } from "./theme.mjs";

const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const write = (name, theme, content) => writeFileSync(new URL(`${name}-${theme}.svg`, OUT), content);
const pct = (n) => `${+n.toFixed(3)}%`;

/* ------------------------------------------------------------------ hero */
const TYPED = [
  "I build Shopify products that feel fast and useful.",
  "React + Laravel + Shopify is my happy place.",
  "I turn repetitive workflows into automation.",
  "AI is most useful when it ships real work.",
];

function hero(t) {
  const W = 1200, H = 420, gap = 24, cx = 950, cy = 205;
  const base = [];
  const rings = new Map();
  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      base.push(`<circle cx="${x}" cy="${y}" r="1.5"/>`);
      const d = Math.hypot(x - cx, y - cy);
      if (d < 470) {
        const ring = Math.floor(d / 28);
        if (!rings.has(ring)) rings.set(ring, []);
        rings.get(ring).push(`<circle cx="${x}" cy="${y}" r="1.9"/>`);
      }
    }
  }
  const ripple = [...rings.entries()]
    .map(([r, c]) => `<g class="rp" style="animation-delay:${(r * 0.16).toFixed(2)}s">${c.join("")}</g>`)
    .join("\n    ");

  // Typing headline: each line is revealed through a clip rect that steps one character at a time.
  const size = 21, cw = size * 0.6, x0 = 92, ty = 296, C = 26, S = C / TYPED.length;
  let typeCss = "", typeSvg = "", clips = "";
  TYPED.forEach((line, i) => {
    const L = line.length, w = L * cw + 6;
    const s0 = i * S, s1 = s0 + L * 0.055, s2 = s1 + 2.3, s3 = s2 + 0.75, end = (i + 1) * S - 0.2;
    const p = (s) => pct((s / C) * 100);
    typeCss += `
    @keyframes k${i}{0%{transform:translateX(0)} ${p(s0)}{transform:translateX(0);animation-timing-function:steps(${L},end)} ${p(s1)}{transform:translateX(${w}px)} ${p(s2)}{transform:translateX(${w}px);animation-timing-function:steps(${L},end)} ${p(s3)}{transform:translateX(0)} 100%{transform:translateX(0)}}
    @keyframes q${i}{0%{opacity:0} ${p(Math.max(s0 - 0.01, 0))}{opacity:0} ${p(s0)}{opacity:1} ${p(end)}{opacity:1} ${p(end + 0.01)}{opacity:0} 100%{opacity:0}}
    .k${i}{animation:k${i} ${C}s linear infinite}
    .q${i}{animation:k${i} ${C}s linear infinite,q${i} ${C}s linear infinite}`;
    clips += `<clipPath id="c${i}"><rect class="k${i}" x="${x0 - w}" y="${ty - 24}" width="${w}" height="34"/></clipPath>`;
    typeSvg += `
    <text class="mono text" x="${x0}" y="${ty}" font-size="${size}" textLength="${(L * cw).toFixed(1)}" lengthAdjust="spacingAndGlyphs" clip-path="url(#c${i})">${esc(line)}</text>
    <g class="q${i}" opacity="0"><rect class="blink" x="${x0 + 1}" y="${ty - 19}" width="11" height="24" rx="1" fill="${t.mint}"/></g>`;
  });

  const style = `${baseStyle(t)}
    .rp{opacity:0;animation:rp 4.8s ease-in-out infinite}
    @keyframes rp{0%,100%{opacity:0}18%{opacity:.95}45%{opacity:0}}
    .glow{animation:glow 4.8s ease-in-out infinite}
    @keyframes glow{0%,100%{opacity:.55}20%{opacity:1}}
    .blink{animation:blink 1s steps(1,end) infinite}
    @keyframes blink{0%,55%{opacity:1}56%,100%{opacity:0}}${typeCss}`;

  const body = `  <defs>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
    <linearGradient id="fade" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset=".72" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
    <radialGradient id="halo" cx="${cx}" cy="${cy}" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${t.mint}" stop-opacity=".22"/><stop offset="1" stop-color="${t.mint}" stop-opacity="0"/>
    </radialGradient>
    ${clips}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    <circle class="glow" cx="${cx}" cy="${cy}" r="300" fill="url(#halo)"/>
    <g mask="url(#m)">
    <g fill="${t.dot}">${base.join("")}</g>
    <g fill="${t.mint}">
    ${ripple}
    </g>
    </g>
    <circle cx="${cx}" cy="${cy}" r="5" fill="${t.mint}"/>
    <circle cx="${cx}" cy="${cy}" r="5" stroke="${t.mint}" stroke-width="1.5">
      <animate attributeName="r" values="5;46" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite"/>
    </circle>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" stroke="${t.line}"/>
  <text class="mono mint" x="64" y="88" font-size="14" letter-spacing="3.5" font-weight="600">GITHUB PROFILE  /  LAHORE, PAKISTAN</text>
  <text class="mono muted" x="${W - 48}" y="88" font-size="14" text-anchor="end" letter-spacing=".5">wajahatalinaqvi.github.io ↗</text>
  <text class="sans text" x="62" y="176" font-size="70" font-weight="700" letter-spacing="-2">Wajahat Naqvi</text>
  <text class="sans muted" x="64" y="224" font-size="28" font-weight="500" letter-spacing="-.3">Shopify Full-Stack Developer</text>
  <text class="mono mint" x="64" y="${ty}" font-size="${size}" font-weight="700">›</text>${typeSvg}
  <text class="mono muted" x="64" y="366" font-size="13" letter-spacing="2.5">SHOPIFY · REACT / NEXT.JS · LARAVEL · APIs · AUTOMATION · AI</text>`;
  return svg(W, H, body, style, "Wajahat Naqvi, Shopify Full-Stack Developer in Lahore, Pakistan");
}

/* ------------------------------------------------------------ build loop */
const LOOP = [
  ["SHOPIFY", "apps · themes"],
  ["REACT / NEXT", "interfaces"],
  ["LARAVEL / API", "APIs · data"],
  ["AUTOMATION", "queues · webhooks"],
  ["AI", "agents · workflows"],
];

function buildLoop(t) {
  const W = 1200, H = 260, y = 96, x0 = 140, x1 = 1060, span = x1 - x0, D = 7;
  const travelEnd = 0.7; // fraction of the cycle the comet spends travelling
  const nodes = LOOP.map(([label, sub], i) => {
    const x = x0 + (span / (LOOP.length - 1)) * i;
    const reach = (0.04 + ((x - x0) / span) * (travelEnd - 0.04)) * D;
    return `  <g transform="translate(${x} ${y})">
    <circle r="34" fill="${t.bg}" stroke="${t.line}" stroke-width="2"/>
    <circle class="lit" style="animation-delay:${reach.toFixed(2)}s" r="34" stroke="${t.mint}" stroke-width="2.5"/>
    <circle class="halo" style="animation-delay:${reach.toFixed(2)}s" r="34" stroke="${t.mint}" stroke-width="2"/>
    <circle r="7" fill="${t.mint}"/>
    <text class="mono text" y="70" font-size="15" font-weight="700" text-anchor="middle" letter-spacing="1.5">${esc(label)}</text>
    <text class="sans muted" y="94" font-size="14" text-anchor="middle">${esc(sub)}</text>
  </g>`;
  }).join("\n");

  const style = `${baseStyle(t)}
    .comet{animation:travel ${D}s linear infinite}
    @keyframes travel{0%{transform:translateX(0);opacity:0}4%{transform:translateX(0);opacity:1}${travelEnd * 100}%{transform:translateX(${span}px);opacity:1}${travelEnd * 100 + 8}%,100%{transform:translateX(${span}px);opacity:0}}
    .trail{stroke-dasharray:${span};stroke-dashoffset:${span};animation:trail ${D}s linear infinite}
    @keyframes trail{0%,4%{stroke-dashoffset:${span};opacity:1}${travelEnd * 100}%{stroke-dashoffset:0;opacity:1}${travelEnd * 100 + 12}%,100%{stroke-dashoffset:0;opacity:0}}
    .lit{opacity:0;animation:lit ${D}s ease-out infinite}
    @keyframes lit{0%{opacity:1}55%{opacity:.15}100%{opacity:0}}
    .halo{opacity:0;transform-box:fill-box;transform-origin:center;animation:halo ${D}s ease-out infinite}
    @keyframes halo{0%{opacity:.7;transform:scale(1)}14%{opacity:0;transform:scale(1.6)}100%{opacity:0;transform:scale(1.6)}}`;

  const body = `  <defs>
    <linearGradient id="tr" x1="${x0}" y1="0" x2="${x1}" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="${t.mint}" stop-opacity=".15"/><stop offset="1" stop-color="${t.mint}"/>
    </linearGradient>
    <radialGradient id="cg"><stop stop-color="${t.mint}" stop-opacity=".55"/><stop offset="1" stop-color="${t.mint}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.bg}" stroke="${t.line}"/>
  <text class="mono faint" x="32" y="36" font-size="12" letter-spacing="3">MY BUILD LOOP</text>
  <text class="mono faint" x="${W - 32}" y="36" font-size="12" letter-spacing="3" text-anchor="end">LOOPS FOREVER</text>
  <path d="M${x0} ${y}H${x1}" stroke="${t.line}" stroke-width="2" stroke-dasharray="4 8"/>
  <path class="trail" d="M${x0} ${y}H${x1}" stroke="url(#tr)" stroke-width="2.5"/>
${nodes}
  <g class="comet"><circle cx="${x0}" cy="${y}" r="22" fill="url(#cg)"/><circle cx="${x0}" cy="${y}" r="5" fill="${t.mint}"/></g>
  <text class="mono muted" x="${W / 2}" y="${H - 24}" font-size="14" text-anchor="middle" letter-spacing=".5">idea → UX → frontend → API → data → automation → ship</text>`;
  return svg(W, H, body, style, "Build loop: Shopify, React / Next, Laravel / API, Automation, AI");
}

/* --------------------------------------------------------- project cards */
const PROJECTS = [
  {
    slug: "linkedin-pro-agent",
    n: "01", lang: "PYTHON", title: "LinkedIn Pro Agent",
    desc: "Researches verified tech stories, scores them, prepares LinkedIn + X content and previews, and keeps final publishing under human approval.",
    stack: ["Python", "GitHub Actions", "Playwright", "LinkedIn API"],
  },
  {
    slug: "shopify-wishlist-api",
    n: "02", lang: "NODE.JS", title: "Shopify Customer Wishlist API",
    desc: "A lightweight wishlist backend that stores customer wishlists in Shopify metafields and resolves saved products through the Admin API.",
    stack: ["Node.js", "Express", "Shopify Admin API", "Liquid"],
  },
  {
    slug: "quickdebugger",
    n: "03", lang: "JAVASCRIPT", title: "quickdebugger",
    desc: "A small developer utility that wraps async functions and surfaces execution time, memory usage and error traces while you debug.",
    stack: ["JavaScript", "Node.js", "React-friendly"],
  },
  {
    slug: "djordanmedia-v2",
    n: "04", lang: "LIQUID", title: "DjordanMedia v2",
    desc: "Shopify theme development with custom Liquid sections, snippets, templates, assets and storefront UX.",
    stack: ["Shopify Liquid", "JavaScript", "CSS", "Theme architecture"],
  },
];

function card(p, t, i) {
  const W = 440, H = 220, pad = 28;
  const lines = wrap(p.desc, 50).slice(0, 3);
  let cx = pad;
  const chips = [];
  for (const s of p.stack) {
    const w = monoWidth(s, 11) + 20;
    if (cx + w > W - pad) break;
    chips.push(`<g transform="translate(${cx} 172)"><rect width="${w}" height="24" rx="12" fill="${t.bg}" stroke="${t.line}"/><text class="mono muted" x="${w / 2}" y="16" font-size="11" text-anchor="middle">${esc(s)}</text></g>`);
    cx += w + 6;
  }
  const style = `${baseStyle(t)}
    .scan{animation:scan 5s ease-in-out infinite;animation-delay:${i * 0.6}s}
    @keyframes scan{0%{transform:translateX(-160px)}60%,100%{transform:translateX(${W + 20}px)}}
    .pulse{animation:pulse 2.4s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}`;
  const body = `  <defs>
    <clipPath id="cl"><rect width="${W}" height="${H}" rx="16"/></clipPath>
    <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${t.mint}" stop-opacity="0"/><stop offset=".5" stop-color="${t.mint}"/><stop offset="1" stop-color="${t.mint}" stop-opacity="0"/></linearGradient>
  </defs>
  <g clip-path="url(#cl)">
    <rect width="${W}" height="${H}" fill="${t.panel}"/>
    <rect class="scan" y="0" width="160" height="2" fill="url(#sg)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" stroke="${t.line}"/>
  <circle class="pulse" cx="${pad + 3}" cy="36" r="3.5" fill="${t.mint}"/>
  <text class="mono mint" x="${pad + 14}" y="40" font-size="11.5" letter-spacing="2" font-weight="600">${p.n}  ·  ${esc(p.lang)}</text>
  <text class="mono muted" x="${W - pad}" y="40" font-size="11.5" letter-spacing="1.5" text-anchor="end">VIEW REPO ↗</text>
  <text class="sans text" x="${pad}" y="80" font-size="22" font-weight="700" letter-spacing="-.4">${esc(p.title)}</text>
  ${lines.map((l, k) => `<text class="sans muted" x="${pad}" y="${110 + k * 20}" font-size="14.5">${esc(l)}</text>`).join("\n  ")}
  ${chips.join("\n  ")}`;
  return svg(W, H, body, style, `${p.title}: ${p.desc}`);
}

/* ----------------------------------------------------------- stack chips */
const TOOLS = ["Shopify", "Liquid", "Polaris", "GraphQL", "REST APIs", "GitHub Actions", "AI workflows"];
function chips(t) {
  const size = 15, h = 40, gap = 10;
  const widths = TOOLS.map((s) => monoWidth(s, size) + 46);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (TOOLS.length - 1);
  const W = Math.ceil(total) + 4, H = h + 4;
  let x = 2;
  const items = TOOLS.map((s, i) => {
    const w = widths[i];
    const g = `<g transform="translate(${x} 2)"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${t.panel}" stroke="${t.line}"/><circle class="d" style="animation-delay:${(i * 0.35).toFixed(2)}s" cx="20" cy="${h / 2}" r="4" fill="${t.mint}"/><text class="mono text" x="32" y="${h / 2 + 5}" font-size="${size}">${esc(s)}</text></g>`;
    x += w + gap;
    return g;
  }).join("\n  ");
  const style = `${baseStyle(t)}
    .d{animation:d 2.45s ease-in-out infinite}
    @keyframes d{0%,100%{opacity:.3}30%{opacity:1}}`;
  return svg(W, H, "  " + items, style, `Also in the toolbox: ${TOOLS.join(", ")}`);
}

/* -------------------------------------------------------------- terminal */
const STEPS = [
  "Understand the business problem.",
  "Make the UX feel obvious.",
  "Keep the architecture maintainable.",
  "Automate repetitive work.",
  "Measure what actually matters.",
  "Ship — then improve.",
];
function terminal(t) {
  const W = 1200, H = 400, C = 16;
  const at = (k) => 0.9 + k * 0.75; // seconds at which line k appears
  let css = "";
  const rows = STEPS.map((s, k) => {
    const a = (at(k) / C) * 100;
    css += `
    @keyframes l${k}{0%,${pct(a)}{opacity:0;transform:translateY(6px)}${pct(a + 2.5)},90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(0)}}
    .l${k}{opacity:0;animation:l${k} ${C}s ease-out infinite}`;
    const y = 150 + k * 36;
    return `<g class="l${k}"><text class="mono mint" x="56" y="${y}" font-size="18" font-weight="700">${String(k + 1).padStart(2, "0")}</text><text class="mono text" x="100" y="${y}" font-size="18">${esc(s)}</text></g>`;
  }).join("\n  ");
  const endA = (at(STEPS.length) / C) * 100;
  css += `
    @keyframes lp{0%,${pct(endA)}{opacity:0}${pct(endA + 1)},90%{opacity:1}95%,100%{opacity:0}}
    .lp{opacity:0;animation:lp ${C}s linear infinite}
    .blink{animation:blink 1s steps(1,end) infinite}
    @keyframes blink{0%,55%{opacity:1}56%,100%{opacity:0}}`;
  const yEnd = 150 + STEPS.length * 36 + 8;
  const body = `  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.panel}" stroke="${t.line}"/>
  <path d="M1 46H${W - 1}" stroke="${t.line}"/>
  <circle cx="30" cy="23" r="6" fill="${t.faint}"/><circle cx="52" cy="23" r="6" fill="${t.faint}"/><circle cx="74" cy="23" r="6" fill="${t.mint}"/>
  <text class="mono muted" x="${W / 2}" y="28" font-size="13" text-anchor="middle">wajahat@lahore: ~/how-i-build</text>
  <text class="mono" x="56" y="98" font-size="18"><tspan class="mint" font-weight="700">$</tspan><tspan class="text"> cat build-process.txt</tspan></text>
  ${rows}
  <g class="lp"><text class="mono mint" x="56" y="${yEnd}" font-size="18" font-weight="700">$</text><rect class="blink" x="78" y="${yEnd - 17}" width="11" height="22" fill="${t.mint}"/></g>`;
  return svg(W, H, body, `${baseStyle(t)}${css}`, "How I build: " + STEPS.map((s, k) => `${k + 1}. ${s}`).join(" "));
}

/* --------------------------------------------------------------- buttons */
const BUTTONS = [
  { slug: "btn-portfolio", label: "View portfolio", glyph: "↗", primary: true },
  { slug: "btn-projects", label: "Projects", glyph: "{ }" },
  { slug: "btn-linkedin", label: "LinkedIn", glyph: "in" },
  { slug: "btn-email", label: "Email", glyph: "@" },
];
function button(b, t) {
  const size = 19, H = 60;
  const W = Math.round(sansWidth(b.label, size) + monoWidth(b.glyph, 15) + 76);
  const fill = b.primary ? t.mint : t.panel;
  const stroke = b.primary ? t.mint : t.line;
  const txt = b.primary ? t.onMint : t.text;
  const glyphColor = b.primary ? t.onMint : t.mintText;
  const style = `${baseStyle(t)}
    .sh{animation:sh 4.5s ease-in-out infinite}
    @keyframes sh{0%,55%{transform:translateX(-120px)}100%{transform:translateX(${W + 40}px)}}`;
  const shine = b.primary
    ? `<g clip-path="url(#bc)"><rect class="sh" x="0" y="0" width="70" height="${H}" fill="url(#bs)" transform="skewX(-20)"/></g>`
    : "";
  const body = `  <defs>
    <clipPath id="bc"><rect width="${W}" height="${H}" rx="12"/></clipPath>
    <linearGradient id="bs" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="11.5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  ${shine}
  <text class="mono" x="26" y="${H / 2 + 5.5}" font-size="15" font-weight="700" fill="${glyphColor}">${esc(b.glyph)}</text>
  <text class="sans" x="${34 + monoWidth(b.glyph, 15)}" y="${H / 2 + 6.5}" font-size="${size}" font-weight="600" fill="${txt}">${esc(b.label)}</text>`;
  return svg(W, H, body, style, b.label);
}

/* --------------------------------------------------------------- divider */
function divider(t) {
  const W = 1200, H = 24;
  const style = `${baseStyle(t)}
    .run{animation:run 7s ease-in-out infinite}
    @keyframes run{0%{transform:translateX(-220px)}100%{transform:translateX(${W + 20}px)}}`;
  const body = `  <defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${t.mint}" stop-opacity="0"/><stop offset=".5" stop-color="${t.mint}"/><stop offset="1" stop-color="${t.mint}" stop-opacity="0"/></linearGradient></defs>
  <path d="M0 12H${W}" stroke="${t.line}"/>
  <rect class="run" y="11" width="200" height="2" fill="url(#dg)"/>
  <rect x="${W / 2 - 5}" y="7" width="10" height="10" transform="rotate(45 ${W / 2} 12)" fill="${t.bg}" stroke="${t.mint}" stroke-width="1.5"/>`;
  return svg(W, H, body, style, "Section divider");
}

for (const [name, t] of Object.entries(THEMES)) {
  write("hero", name, hero(t));
  write("build-loop", name, buildLoop(t));
  PROJECTS.forEach((p, i) => write(`card-${p.slug}`, name, card(p, t, i)));
  write("stack-tools", name, chips(t));
  write("how-i-build", name, terminal(t));
  BUTTONS.forEach((b) => write(b.slug, name, button(b, t)));
  write("divider", name, divider(t));
}
console.log("assets written");
