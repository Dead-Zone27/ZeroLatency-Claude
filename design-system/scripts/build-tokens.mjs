// Source of truth for ZeroLatency DS tokens.
// Generates: ../tokens.json (local export), ../contrast-report.md (WCAG table).
// Run: node design-system/scripts/build-tokens.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { oklchToHex, contrast } from './color.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..');
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function scale(Ls, Cs, H) {
  const o = {};
  STEPS.forEach((s, i) => (o[s] = oklchToHex(Ls[i], Cs[i], H)));
  return o;
}
// Neutral: "mineral" — a slight cool bias toward the accent's hue (H 210), never pure gray.
const neutral = { 0: '#ffffff', ...scale(
  [0.985, 0.962, 0.915, 0.8, 0.64, 0.525, 0.455, 0.385, 0.3, 0.228, 0.17],
  [0.004, 0.006, 0.009, 0.012, 0.016, 0.017, 0.017, 0.016, 0.014, 0.012, 0.010], 210) };
// Accent "Slipstream": a clear, cool teal-cyan. One accent only.
const accent = scale(
  [0.975, 0.945, 0.895, 0.835, 0.765, 0.67, 0.54, 0.465, 0.405, 0.335, 0.255],
  [0.022, 0.042, 0.07, 0.1, 0.12, 0.122, 0.107, 0.092, 0.078, 0.064, 0.05], 196);
const semL = [0.975, 0.945, 0.895, 0.83, 0.75, 0.66, 0.53, 0.465, 0.405, 0.335, 0.255];
const semC = (m) => [0.02, 0.045, 0.08, 0.12, 0.15, 0.16, 0.15, 0.13, 0.11, 0.09, 0.06].map(c => c * m);
const success = scale(semL, semC(0.95), 152);
const warning = scale([0.98, 0.955, 0.915, 0.86, 0.8, 0.73, 0.555, 0.48, 0.42, 0.35, 0.265], semC(1.05), 72);
const error = scale(semL, semC(1.25), 25);
const info = scale(semL, semC(1.0), 255);

const P = { neutral, accent, success, warning, error, info };
const ref = (s) => { const [k, n] = s.split('.'); const v = P[k][n]; if (!v) throw new Error('bad ref ' + s); return v; };
const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

// Role tokens: [name, lightRef, darkRef, usage]
const roles = [
  ['bg', 'neutral.0', 'neutral.950', 'Page background (marketing canvas, app list pane in light).'],
  ['bg-subtle', 'neutral.50', 'neutral.900', 'Tinted zones: app sidebar, alternating page sections, footer.'],
  ['surface', 'neutral.0', 'neutral.900', 'Cards, inputs, list pane, table body.'],
  ['surface-raised', 'neutral.0', 'neutral.800', 'Modals, popovers, toasts, menus (pair with a shadow).'],
  ['surface-sunken', 'neutral.100', 'neutral.950', 'Wells: code, screenshot frame backdrop, track of a toggle.'],
  ['surface-hover', 'neutral.100', 'neutral.800', 'Hover fill for rows, ghost buttons, nav items.'],
  ['surface-selected', 'accent.50', 'accent.950', 'Selected inbox row or active nav item fill.'],
  ['surface-inverse', 'neutral.900', 'neutral.50', 'Inverse blocks: CTA band, tooltips, keyboard hints.'],
  ['border', 'neutral.200', 'neutral.800', 'Hairline dividers and card outlines (decorative, not a control boundary).'],
  ['border-strong', 'neutral.400', 'neutral.400', 'Control boundaries: input, select, checkbox, secondary button. Meets 3:1.'],
  ['text', 'neutral.900', 'neutral.50', 'Primary text and headings on every bg/surface role.'],
  ['text-muted', 'neutral.600', 'neutral.200', 'Secondary text: subheads, descriptions, read inbox rows.'],
  ['text-subtle', 'neutral.500', 'neutral.300', 'Tertiary text: timestamps, counts, captions, placeholders. Still AA.'],
  ['text-disabled', 'neutral.300', 'neutral.600', 'Disabled labels only (WCAG-exempt); never for real content.'],
  ['text-inverse', 'neutral.50', 'neutral.900', 'Text on surface-inverse.'],
  ['accent', 'accent.600', 'accent.400', 'Primary action fill, unread dot, links in UI, selected indicator.'],
  ['accent-hover', 'accent.700', 'accent.300', 'Hover state of accent fills.'],
  ['accent-active', 'accent.800', 'accent.200', 'Pressed state of accent fills.'],
  ['accent-fg', 'neutral.0', 'accent.950', 'Text/icons on accent, accent-hover and accent-active.'],
  ['accent-subtle', 'accent.50', 'accent.950', 'AI-label chip fill, selected row, info callouts in brand voice.'],
  ['accent-subtle-hover', 'accent.100', 'accent.900', 'Hover of accent-subtle fills.'],
  ['accent-text', 'accent.700', 'accent.300', 'Accent-colored text: links, AI labels, active tab label.'],
  ['accent-border', 'accent.300', 'accent.700', 'Outline of AI chips and selected cards (decorative).'],
  ['focus-ring', 'accent.600', 'accent.400', 'Focus-visible ring, 2px solid with 2px offset. Meets 3:1 on every bg/surface.'],
  ['surface-emphasis', 'neutral.900', 'accent.950', 'High-emphasis band (closing CTA). Deep ink in light, deep teal in dark.'],
  ['text-on-emphasis', 'neutral.50', 'neutral.50', 'Text on surface-emphasis.'],
  ['focus-ring-emphasis', 'accent.300', 'accent.300', 'Focus ring for controls sitting on surface-emphasis. Meets 3:1 there.'],
  ['success', 'success.600', 'success.400', 'Success icon/fill.'],
  ['success-fg', 'neutral.0', 'success.950', 'Text on success fill.'],
  ['success-text', 'success.700', 'success.300', 'Success text on bg/surface/success-subtle.'],
  ['success-subtle', 'success.50', 'success.950', 'Success badge/toast tint.'],
  ['success-border', 'success.200', 'success.800', 'Success outline (decorative).'],
  ['warning', 'warning.600', 'warning.400', 'Warning icon/fill.'],
  ['warning-fg', 'neutral.0', 'warning.950', 'Text on warning fill.'],
  ['warning-text', 'warning.800', 'warning.300', 'Warning text on bg/surface/warning-subtle.'],
  ['warning-subtle', 'warning.50', 'warning.950', 'Warning badge/toast tint.'],
  ['warning-border', 'warning.200', 'warning.800', 'Warning outline (decorative).'],
  ['error', 'error.600', 'error.400', 'Error icon, destructive button fill, invalid input border.'],
  ['error-hover', 'error.700', 'error.300', 'Hover of destructive fill.'],
  ['error-fg', 'neutral.0', 'error.950', 'Text on error fill.'],
  ['error-text', 'error.700', 'error.300', 'Error text: field messages, destructive ghost labels.'],
  ['error-subtle', 'error.50', 'error.950', 'Error badge/toast tint.'],
  ['error-border', 'error.200', 'error.800', 'Error outline (decorative).'],
  ['info', 'info.600', 'info.400', 'Info icon/fill.'],
  ['info-fg', 'neutral.0', 'info.950', 'Text on info fill.'],
  ['info-text', 'info.700', 'info.300', 'Info text on bg/surface/info-subtle.'],
  ['info-subtle', 'info.50', 'info.950', 'Info badge/toast tint.'],
  ['info-border', 'info.200', 'info.800', 'Info outline (decorative).'],
];
const light = {}, dark = {}, usage = {};
for (const [n, l, d, u] of roles) { light[n] = ref(l); dark[n] = ref(d); usage[n] = u; }
light.overlay = alpha(neutral[950], 0.44); dark.overlay = alpha('#000000', 0.64);
usage.overlay = 'Modal scrim behind dialogs.';

// ---- Contrast pairs: [fg, bg[], kind]  kind: text (4.5) | large (3) | ui (3)
const surfaces = ['bg', 'bg-subtle', 'surface', 'surface-raised', 'surface-sunken', 'surface-hover'];
const pairs = [
  ...['text', 'text-muted', 'text-subtle'].flatMap(f => surfaces.map(b => [f, b, 'text'])),
  ['text', 'surface-selected', 'text'], ['text-muted', 'surface-selected', 'text'], ['text-subtle', 'surface-selected', 'text'],
  ['text-inverse', 'surface-inverse', 'text'],
  ['accent-fg', 'accent', 'text'], ['accent-fg', 'accent-hover', 'text'], ['accent-fg', 'accent-active', 'text'],
  ...['bg', 'bg-subtle', 'surface', 'surface-raised', 'accent-subtle', 'accent-subtle-hover', 'surface-selected'].map(b => ['accent-text', b, 'text']),
  ...['success', 'warning', 'error', 'info'].flatMap(s => [
    [`${s}-text`, `${s}-subtle`, 'text'], [`${s}-text`, 'surface', 'text'], [`${s}-text`, 'bg-subtle', 'text'], [`${s}-fg`, s, 'text'],
    [s, 'surface', 'ui'],
  ]),
  ['error-fg', 'error-hover', 'text'],
  ...surfaces.map(b => ['border-strong', b, 'ui']),
  ...surfaces.concat(['surface-selected']).map(b => ['focus-ring', b, 'ui']),
  ['text-on-emphasis', 'surface-emphasis', 'text'], ['focus-ring-emphasis', 'surface-emphasis', 'ui'], ['accent', 'surface-emphasis', 'ui'],
  ['accent', 'surface', 'ui'], ['accent', 'bg-subtle', 'ui'], ['accent', 'surface-selected', 'ui'],
];
const rows = []; let fails = 0;
for (const [f, b, kind] of pairs) {
  const min = kind === 'text' ? 4.5 : 3;
  for (const [tn, t] of [['light', light], ['dark', dark]]) {
    const r = contrast(t[f], t[b]);
    const ok = r >= min; if (!ok) fails++;
    rows.push({ theme: tn, fg: f, bg: b, kind, min, ratio: r, fgHex: t[f], bgHex: t[b], ok });
  }
}
const kindLabel = { text: 'normal text', ui: 'UI / large' };
let md = `| Theme | Foreground | Background | Use | Min | Ratio | Result |\n|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${r.theme} | \`${r.fg}\` ${r.fgHex} | \`${r.bg}\` ${r.bgHex} | ${kindLabel[r.kind]} | ${r.min}:1 | ${r.ratio.toFixed(2)}:1 | ${r.ok ? 'PASS' : 'FAIL'} |\n`;
md += `\n${rows.length} pairs checked, ${rows.length - fails} pass, ${fails} fail. Exempt by design: \`text-disabled\` (disabled controls), \`border\` (decorative hairline), \`*-border\` tints (decorative; each is paired with text or an icon that passes).\n`;
writeFileSync(join(out, 'contrast-report.md'), md);
console.log(md.split('\n').slice(-2).join('\n'));
if (fails) { rows.filter(r => !r.ok).forEach(r => console.log('FAIL', r.theme, r.fg, 'on', r.bg, r.ratio.toFixed(2))); process.exitCode = 1; }

// ---- Everything else
const shadowColor = (a, dk) => (dk ? `rgba(0, 0, 0, ${a})` : `rgba(12, 18, 22, ${a})`);
const mkShadows = (dk) => ({
  none: 'none',
  xs: `0 1px 2px ${shadowColor(dk ? 0.4 : 0.06, dk)}`,
  sm: `0 1px 2px ${shadowColor(dk ? 0.4 : 0.06, dk)}, 0 1px 3px ${shadowColor(dk ? 0.3 : 0.08, dk)}`,
  md: `0 4px 12px -2px ${shadowColor(dk ? 0.5 : 0.08, dk)}, 0 2px 4px -2px ${shadowColor(dk ? 0.4 : 0.06, dk)}`,
  lg: `0 12px 32px -8px ${shadowColor(dk ? 0.6 : 0.14, dk)}, 0 4px 8px -4px ${shadowColor(dk ? 0.4 : 0.06, dk)}`,
  xl: `0 24px 64px -16px ${shadowColor(dk ? 0.7 : 0.22, dk)}, 0 8px 16px -8px ${shadowColor(dk ? 0.5 : 0.08, dk)}`,
});
const tokens = {
  $meta: { name: 'ZeroLatency DS', version: '1.0.0', generatedBy: 'design-system/scripts/build-tokens.mjs',
    note: 'Role tokens are the public API; primitives are for building roles only. Colors in hex (8-digit = alpha).' },
  color: {
    primitive: P,
    light, dark,
    usage,
  },
  font: {
    sans: { family: 'Instrument Sans Variable', stack: '"Instrument Sans Variable", "Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', npm: '@fontsource-variable/instrument-sans', license: 'OFL-1.1', usage: 'All UI and marketing text, headings included.' },
    mono: { family: 'IBM Plex Mono', stack: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', npm: '@fontsource/ibm-plex-mono', weights: [400, 500], license: 'OFL-1.1', usage: 'Keyboard shortcuts, timestamps in dense tables, code, latency figures.' },
  },
  fontSize: {
    xs: { size: '12px', lineHeight: '16px', letterSpacing: '0.01em' },
    sm: { size: '14px', lineHeight: '20px', letterSpacing: '0' },
    base: { size: '16px', lineHeight: '24px', letterSpacing: '0' },
    lg: { size: '18px', lineHeight: '28px', letterSpacing: '-0.005em' },
    xl: { size: '20px', lineHeight: '28px', letterSpacing: '-0.01em' },
    '2xl': { size: '24px', lineHeight: '32px', letterSpacing: '-0.015em' },
    '3xl': { size: '30px', lineHeight: '36px', letterSpacing: '-0.02em' },
    '4xl': { size: '36px', lineHeight: '40px', letterSpacing: '-0.025em' },
    '5xl': { size: '48px', lineHeight: '52px', letterSpacing: '-0.03em' },
    '6xl': { size: '60px', lineHeight: '62px', letterSpacing: '-0.035em' },
    display: { size: '76px', lineHeight: '76px', letterSpacing: '-0.04em' },
  },
  fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  spacing: { 0: '0px', px: '1px', 0.5: '2px', 1: '4px', 1.5: '6px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px', 24: '96px', 32: '128px' },
  radius: { none: '0px', xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', full: '9999px' },
  shadow: { light: mkShadows(false), dark: mkShadows(true) },
  breakpoint: { sm: '375px', md: '768px', lg: '1280px', xl: '1536px' },
  motion: {
    duration: { instant: '0ms', fast: '100ms', base: '160ms', slow: '240ms', slower: '360ms' },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      enter: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      exit: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      linear: 'linear',
    },
    reducedMotion: 'Under prefers-reduced-motion: reduce, all transitions/animations drop to 0.01ms except opacity fades (kept at duration.fast). No transform-based movement.',
  },
  zIndex: { base: 0, raised: 1, sticky: 100, nav: 200, dropdown: 300, overlay: 400, modal: 500, toast: 600, tooltip: 700 },
};
writeFileSync(join(out, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
console.log('wrote tokens.json');
