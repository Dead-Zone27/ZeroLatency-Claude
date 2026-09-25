// Generates handoff/tokens.css FROM tokens.json (never edit tokens.css by hand).
// Run: node design-system/scripts/gen-css.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const esc = (k) => String(k).replace('.', '\\.');
const block = (sel, obj, ind = '  ') => `${sel} {\n${Object.entries(obj).map(([k, v]) => `${ind}--${k}: ${v};`).join('\n')}\n}\n`;

const prim = {};
for (const [scale, steps] of Object.entries(t.color.primitive)) for (const [s, v] of Object.entries(steps)) prim[`${scale}-${s}`] = v;
const themeVars = (th) => ({ ...th, ...Object.fromEntries(Object.entries(t.shadow[th === t.color.light ? 'light' : 'dark']).map(([k, v]) => [`shadow-${k}`, v])) });
const lightVars = themeVars(t.color.light), darkVars = themeVars(t.color.dark);

const statics = {};
statics['font-sans'] = t.font.sans.stack; statics['font-mono'] = t.font.mono.stack;
for (const [k, v] of Object.entries(t.fontSize)) { statics[`text-${k}`] = v.size; statics[`text-${k}--line-height`] = v.lineHeight; statics[`text-${k}--letter-spacing`] = v.letterSpacing; }
for (const [k, v] of Object.entries(t.fontWeight)) statics[`font-weight-${k}`] = v;
for (const [k, v] of Object.entries(t.spacing)) statics[`space-${esc(k)}`] = v;
for (const [k, v] of Object.entries(t.radius)) statics[`radius-${k}`] = v;
for (const [k, v] of Object.entries(t.size)) statics[`size-${k}`] = v;
for (const [k, v] of Object.entries(t.breakpoint)) statics[`breakpoint-${k}`] = v;
for (const [k, v] of Object.entries(t.motion.duration)) statics[`duration-${k}`] = v;
for (const [k, v] of Object.entries(t.motion.easing)) statics[`ease-${k}`] = v;
for (const [k, v] of Object.entries(t.zIndex)) statics[`z-${k}`] = v;

let css = `/* ZeroLatency DS tokens — GENERATED from tokens.json by scripts/gen-css.mjs. Do not edit by hand. */\n\n`;
css += block(':root', { ...prim, ...statics });
css += `\n/* Light theme (default) */\n` + block(':root,\n[data-theme="light"],\n.light', lightVars);
css += `\n/* Dark theme: explicit opt-in via attribute or class */\n` + block('[data-theme="dark"],\n.dark', darkVars);
css += `\n/* Dark theme: follow the OS when no explicit theme is set */\n@media (prefers-color-scheme: dark) {\n` +
  block('  :root:not([data-theme="light"]):not(.light)', darkVars, '    ').replace(/\n}\n$/, '\n  }\n') + `}\n`;
css += `\n:root { color-scheme: light; }\n[data-theme="dark"], .dark { color-scheme: dark; }\n`;
css += `\n/* Reduced motion: ${t.motion.reducedMotion} */\n@media (prefers-reduced-motion: reduce) {\n  :root { --duration-base: 0.01ms; --duration-slow: 0.01ms; --duration-slower: 0.01ms; }\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n  }\n  .zl-fade, [data-motion="fade"] { transition: opacity var(--duration-fast) linear !important; }\n}\n`;
mkdirSync(join(root, 'handoff'), { recursive: true });
writeFileSync(join(root, 'handoff', 'tokens.css'), css);
console.log('wrote handoff/tokens.css', css.length, 'bytes');

// ---- Tailwind v4 bridge: handoff/tailwind-theme.css ----
// Colors: `@theme inline` → utilities use var(--role) directly, so [data-theme]/.dark on ANY element switches them.
// Static scales: plain `@theme` with the SAME names and values as tokens.css (Tailwind v4 naming), so there is no cycle.
// Shadows: Tailwind inlines shadow values, so they are exposed as elevation-* utilities that read the themed var(--shadow-*).
const rename = (n) => n === 'text' ? 'fg' : n.startsWith('text-') ? n.replace(/^text-/, 'fg-') : n;
let tw = `/* ZeroLatency DS → Tailwind v4 bridge — GENERATED from tokens.json by scripts/gen-css.mjs. Do not edit.\n   Import order: tailwindcss, tokens.css, this file. Text roles are renamed fg-* (text-fg, text-fg-muted, text-fg-subtle …) to avoid "text-text". */\n`;
tw += `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *, .dark, .dark *));\n\n@theme inline {\n  --color-*: initial;\n  --color-white: #ffffff;\n  --color-black: #000000;\n  --color-transparent: transparent;\n  --color-current: currentColor;\n`;
for (const n of Object.keys(t.color.light)) tw += `  --color-${rename(n)}: var(--${n});\n`;
for (const [scale, steps] of Object.entries(t.color.primitive)) for (const s of Object.keys(steps)) tw += `  --color-${scale}-${s}: var(--${scale}-${s});\n`;
tw += `}\n\n@theme {\n  --font-sans: ${t.font.sans.stack};\n  --font-mono: ${t.font.mono.stack};\n`;
for (const [k, v] of Object.entries(t.fontSize)) tw += `  --text-${k}: ${v.size};\n  --text-${k}--line-height: ${v.lineHeight};\n  --text-${k}--letter-spacing: ${v.letterSpacing};\n`;
for (const [k, v] of Object.entries(t.fontWeight)) tw += `  --font-weight-${k}: ${v};\n`;
tw += `  --spacing: 4px; /* 4px base: p-4 = 16px, gap-6 = 24px */\n  --radius-*: initial;\n`;
for (const [k, v] of Object.entries(t.radius)) tw += `  --radius-${k}: ${v};\n`;
for (const [k, v] of Object.entries(t.size)) tw += `  --size-${k}: ${v};\n`;
tw += `  --shadow-*: initial; /* use elevation-* utilities below: they read the themed --shadow-* vars */\n`;
tw += `  --breakpoint-*: initial;\n`;
for (const [k, v] of Object.entries(t.breakpoint)) tw += `  --breakpoint-${k}: ${v};\n`;
tw += `  --ease-*: initial;\n`;
for (const [k, v] of Object.entries(t.motion.easing)) if (k !== 'linear') tw += `  --ease-${k}: ${v};\n`;
tw += `}\n\n/* Elevation (theme-aware): elevation-none|xs|sm|md|lg|xl */\n`;
for (const k of Object.keys(t.shadow.light)) tw += `@utility elevation-${k} { box-shadow: var(--shadow-${k}); }\n`;
writeFileSync(join(root, 'handoff', 'tailwind-theme.css'), tw);
console.log('wrote handoff/tailwind-theme.css');
