// Shared visual tokens for every generated SVG, matched to wajahatalinaqvi.github.io:
// dark ink (#0b0f14) with a mint accent (#63e6be), Geist-like sans and a mono for labels.

export const THEMES = {
  dark: {
    bg: "#0b0f14",
    panel: "#0f151c",
    line: "#1c2631",
    text: "#e6edf3",
    muted: "#8b98a5",
    faint: "#3a4654",
    dot: "#243140",
    mint: "#63e6be",
    mintText: "#63e6be",
    onMint: "#0b0f14",
  },
  light: {
    bg: "#ffffff",
    panel: "#f6f8fa",
    line: "#d8dee4",
    text: "#0b0f14",
    muted: "#57606a",
    faint: "#afb8c1",
    dot: "#d0d7de",
    mint: "#20c997",
    mintText: "#087f5b",
    onMint: "#0b0f14",
  },
};

export const SANS =
  "'Geist','Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
export const MONO =
  "'Geist Mono','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const baseStyle = (t) => `
    .sans{font-family:${SANS}}
    .mono{font-family:${MONO}}
    .text{fill:${t.text}} .muted{fill:${t.muted}} .faint{fill:${t.faint}} .mint{fill:${t.mintText}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

export const svg = (w, h, body, style, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <style>${style}
  </style>
${body}
</svg>
`;

// Rough character widths used to lay out text without a browser.
export const monoWidth = (s, size) => s.length * size * 0.6;
export const sansWidth = (s, size) => s.length * size * 0.53;

export const wrap = (text, max) => {
  const lines = [];
  let cur = "";
  for (const word of text.split(" ")) {
    if ((cur + " " + word).trim().length > max) {
      lines.push(cur.trim());
      cur = word;
    } else cur += " " + word;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
};
