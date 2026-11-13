// Builds the "GitHub signal" card from public GitHub data. No third-party stats service involved.
//   node scripts/signal.mjs [outDir]        (GITHUB_TOKEN is optional; it only raises rate limits)
// Output: <outDir>/signal-dark.svg and <outDir>/signal-light.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { THEMES, baseStyle, svg, esc } from "./theme.mjs";

const USER = process.env.PROFILE_USER || "wajahatalinaqvi";
const OUT = resolve(process.argv[2] || "dist");
const TOKEN = process.env.GITHUB_TOKEN;
const headers = { "User-Agent": "profile-signal", Accept: "application/vnd.github+json" };
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

async function get(url, json = true) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return json ? res.json() : res.text();
}

// Daily contribution counts for the last year, oldest first.
async function contributions() {
  if (TOKEN) {
    const query = `query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { u: USER } }),
    });
    const body = await res.json();
    const weeks = body?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (weeks) return weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount }));
    console.warn("GraphQL calendar unavailable, falling back to the public calendar page");
  }
  const html = await get(`https://github.com/users/${USER}/contributions`, false);
  const ids = new Map();
  for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"/g)) ids.set(m[2], m[1]);
  const days = [];
  for (const m of html.matchAll(/for="([^"]+)"[^>]*>\s*(No|\d[\d,]*) contributions? on/g)) {
    const date = ids.get(m[1]);
    if (date) days.push({ date, count: m[2] === "No" ? 0 : Number(m[2].replace(/,/g, "")) });
  }
  if (!days.length) throw new Error("Could not read the contribution calendar");
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today may simply not have started yet
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { current, longest };
}

async function languages() {
  const repos = (await get(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner`)).filter(
    (r) => !r.fork && !r.archived,
  );
  const totals = {};
  for (const r of repos) {
    const langs = await get(r.languages_url);
    for (const [k, v] of Object.entries(langs)) totals[k] = (totals[k] || 0) + v;
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6).map(([name, v]) => ({ name, share: v / sum }));
  const rest = sorted.slice(6).reduce((a, [, v]) => a + v, 0);
  if (rest > 0) top.push({ name: "Other", share: rest / sum });
  return { repos: repos.length, top };
}

const fmt = (n) => n.toLocaleString("en-US");

function card(t, s) {
  const W = 1200, H = 360;
  const tiles = [
    [fmt(s.total), "CONTRIBUTIONS", "last 12 months"],
    [fmt(s.active), "ACTIVE DAYS", "last 12 months"],
    [`${s.current}d`, "CURRENT STREAK", "consecutive days"],
    [`${s.longest}d`, "LONGEST STREAK", "last 12 months"],
  ];
  const tileSvg = tiles.map(([v, label, sub], i) => {
    const x = 32 + (i % 2) * 262, y = 74 + Math.floor(i / 2) * 128;
    return `<g class="in" style="animation-delay:${(0.15 * i).toFixed(2)}s" transform="translate(${x} ${y})">
    <rect width="246" height="112" rx="14" fill="${t.panel}" stroke="${t.line}"/>
    <text class="mono mint" x="20" y="30" font-size="11.5" letter-spacing="2" font-weight="600">${label}</text>
    <text class="sans text" x="20" y="76" font-size="40" font-weight="700" letter-spacing="-1">${esc(v)}</text>
    <text class="sans muted" x="20" y="98" font-size="13">${sub}</text>
  </g>`;
  }).join("\n  ");

  // Language breakdown: one stacked bar plus a legend, shaded in mint steps instead of rainbow colours.
  const bx = 600, bw = 568;
  const shades = [1, 0.78, 0.6, 0.45, 0.33, 0.24, 0.16];
  let acc = 0;
  const segs = s.langs.map((l, i) => {
    const w = Math.max(l.share * bw, 2);
    const r = `<rect x="${(bx + acc).toFixed(1)}" y="96" width="${w.toFixed(1)}" height="14" fill="${t.mint}" fill-opacity="${shades[i]}"/>`;
    acc += l.share * bw;
    return r;
  }).join("");
  const legend = s.langs.map((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = bx + col * 290, y = 150 + row * 40;
    const p = (l.share * 100).toFixed(1) + "%";
    return `<g class="in" style="animation-delay:${(0.4 + 0.08 * i).toFixed(2)}s" transform="translate(${x} ${y})">
    <rect width="12" height="12" rx="3" y="-11" fill="${t.mint}" fill-opacity="${shades[i]}"/>
    <text class="sans text" x="22" y="0" font-size="16" font-weight="500">${esc(l.name)}</text>
    <text class="mono muted" x="270" y="0" font-size="14" text-anchor="end">${p}</text>
  </g>`;
  }).join("\n  ");

  const style = `${baseStyle(t)}
    .in{opacity:0;animation:in .7s ease-out forwards}
    @keyframes in{from{opacity:0}to{opacity:1}}
    .bar{transform-box:fill-box;transform-origin:left;animation:grow 1.4s cubic-bezier(.2,.8,.2,1) .3s both}
    @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    .live{animation:live 2s ease-in-out infinite}
    @keyframes live{0%,100%{opacity:1}50%{opacity:.2}}`;

  const body = `  <defs><clipPath id="bar"><rect x="${bx}" y="96" width="${bw}" height="14" rx="7"/></clipPath></defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.bg}" stroke="${t.line}"/>
  <circle class="live" cx="38" cy="40" r="4" fill="${t.mint}"/>
  <text class="mono muted" x="52" y="45" font-size="12.5" letter-spacing="2.5">GITHUB SIGNAL · @${esc(USER.toUpperCase())}</text>
  <text class="mono faint" x="${W - 32}" y="45" font-size="12" text-anchor="end" letter-spacing="1">updated ${s.updated} · rebuilt daily by GitHub Actions</text>
  ${tileSvg}
  <text class="mono mint" x="${bx}" y="82" font-size="11.5" letter-spacing="2" font-weight="600">LANGUAGES · ${s.repos} PUBLIC REPOS</text>
  <rect x="${bx}" y="96" width="${bw}" height="14" rx="7" fill="${t.panel}" stroke="${t.line}"/>
  <g clip-path="url(#bar)"><g class="bar">${segs}</g></g>
  ${legend}`;
  return svg(W, H, body, style, `GitHub signal for ${USER}: ${tiles.map((x) => `${x[0]} ${x[1].toLowerCase()}`).join(", ")}; top languages ${s.langs.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(", ")}`);
}

const days = await contributions();
const { current, longest } = streaks(days);
const lang = await languages();
const stats = {
  total: days.reduce((a, d) => a + d.count, 0),
  active: days.filter((d) => d.count > 0).length,
  current,
  longest,
  repos: lang.repos,
  langs: lang.top,
  updated: new Date().toISOString().slice(0, 10),
};
console.log(JSON.stringify({ ...stats, langs: stats.langs.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`) }));
mkdirSync(OUT, { recursive: true });
for (const [name, t] of Object.entries(THEMES)) writeFileSync(resolve(OUT, `signal-${name}.svg`), card(t, stats));
