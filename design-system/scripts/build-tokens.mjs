// Source of truth for ZeroLatency DS tokens (v2, re-derived from the 200 reference app frames).
// Every value below was sampled or measured from ScreenShotFrames100/ + ScreenShotFrames200/;
// see ../frame-audit.md for the frame, the pixel box and the raw reading behind each one.
// Generates: ../tokens.json (local export), ../contrast-report.md (WCAG table).
// Run: node design-system/scripts/build-tokens.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast } from './color.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..');

// ---- Primitives -------------------------------------------------------------
// gray: the light theme's warm-leaning neutral (sidebar #f6f6f6, row hover #f0f0f0, selected #e8e8e8,
// secondary text #787878, dividers #ededed; the settings nav selection reads slightly warm, #eaebe6).
const gray = {
  0: '#ffffff', 25: '#fbfbfa', 50: '#f6f6f5', 100: '#f0f0ef', 150: '#e8e8e6', 200: '#ededec',
  300: '#d6d5d2', 400: '#a5a4a0', 500: '#85847f', 600: '#65645f', 700: '#4d4c48', 800: '#2f2e2b', 900: '#191918', 950: '#0f0f0e',
};
// ink: the dark theme's neutral (modal #161616, settings nav #1c1c1c, menus #202020, selected nav #262626,
// menu hover #2a2a2a, secondary text #787878, body text read ~#c0c0c0 through video blur).
const ink = {
  50: '#e3e3e1', 100: '#d4d4d2', 200: '#adadaa', 300: '#9a9a97', 400: '#737371', 500: '#4a4a48',
  600: '#383837', 700: '#2c2c2c', 750: '#262626', 800: '#202020', 850: '#1c1c1c', 900: '#161616', 950: '#0e0e0e',
};
// blue: the one action hue (Continue/Save/Send fills #1e77dd·#186dc7·#2277d4, unread dot #3c77d3,
// "Included" chip #e5eef7, focus halo #a0caf2).
const blue = {
  50: '#eef4fb', 100: '#e5eef7', 200: '#c9ddf3', 300: '#8bb6e8', 400: '#5b9ae6', 500: '#2f84e4',
  600: '#1c72d6', 700: '#1966bf', 800: '#155aa8', 900: '#16406f', 950: '#1b2a3c',
};
// Tag palette: chip fills/text sampled from labels, status options and view-template chips; icon inks from the
// coloured view icons in the sidebar. Dark variants follow the same hue with a deep fill and a light ink.
const TAGS = {
  //        light bg   light fg   icon (light) | dark bg    dark fg    icon (dark)
  gray:   ['#efefed', '#37352f', '#8f8e8a', '#373735', '#e3e2df', '#9b9a97'],
  brown:  ['#f4ebe6', '#44291e', '#a0694f', '#4a3328', '#ecd9cf', '#bf8b71'],
  orange: ['#ffede1', '#4f2a0e', '#d9772f', '#5a3515', '#fbd9bd', '#e8914e'],
  yellow: ['#feefcc', '#402c1b', '#c29328', '#56431c', '#f6e2b3', '#d7a93f'],
  green:  ['#dcefdd', '#1c3829', '#4f8a67', '#23432f', '#cbe8d1', '#6aa883'],
  blue:   ['#d7e8f6', '#183347', '#3f86c2', '#1f3a55', '#cde2f5', '#5fa0d6'],
  purple: ['#eee7f7', '#412454', '#8a67ad', '#3d2a52', '#e2d4f2', '#a888c8'],
  pink:   ['#fbe8f1', '#4c2337', '#c0508a', '#522a3d', '#f5d3e3', '#d9719f'],
  red:    ['#ffe1e0', '#5d1715', '#d65b57', '#5b2422', '#fbd2cf', '#e8716c'],
};
const P = { gray, ink, blue };
const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

// ---- Role tokens: [name, light, dark, usage] --------------------------------
const roles = [
  ['bg', gray[0], ink[900], 'Main canvas: thread list, open thread, side panels, settings content. Measured #ffffff / #161616.'],
  ['bg-sidebar', gray[50], ink[850], 'Sidebar, settings navigation, onboarding left pane. Measured #f6f6f6 / #1c1c1c.'],
  ['surface-raised', gray[0], ink[800], 'Floating layers: menus, popovers, composer, modal, hover preview (always with a shadow). Dark measured #202020.'],
  ['surface-input', gray[50], ink[750], 'Filled text fields (Filter by…, view name, property name). No border until focus. Measured #f6f6f6.'],
  ['surface-hover', gray[100], ink[750], 'Hover fill for rows, menu items, sidebar items and icon buttons. Measured #f0f0f0 / #262626–#2a2a2a.'],
  ['surface-selected', gray[150], ink[700], 'Selected sidebar item, active settings section, open thread row. Measured #e8e8e8 / #262626.'],
  ['surface-tooltip', '#1b1b1a', ink[600], 'Tooltip body (dark in both themes). Measured #10110e–#181914.'],
  ['border', gray[200], ink[700], 'Hairlines: group-heading rules, panel edges, menu section dividers. Decorative (not a control boundary).'],
  ['border-strong', gray[500], ink[400], 'Control outlines that must be seen: checkbox box, radio ring, secondary button edge. Meets 3:1.'],
  ['text', gray[900], ink[100], 'Primary text: senders, subjects, menu labels, headings, email body. On every bg/surface role.'],
  ['text-muted', gray[700], ink[200], 'Sidebar item labels, read-row senders in dense views, secondary menu text.'],
  ['text-subtle', gray[600], ink[300], 'Timestamps, counts, section labels ("Views", "Mail"), descriptions, account email. Still AA on every ground.'],
  ['text-placeholder', gray[400], ink[400], 'Placeholders, "Draft saved", "(Gmail)" hints, thread counts next to a sender. Source value: below 4.5:1 by design, never for content the user must read.'],
  ['text-disabled', gray[300], ink[500], 'Disabled labels only (WCAG-exempt).'],
  ['text-on-tooltip', gray[0], ink[50], 'Tooltip title.'],
  ['text-on-tooltip-muted', gray[400], ink[200], 'Tooltip shortcut line ("Control F"). Measured #81827d.'],
  ['accent', blue[600], blue[600], 'Primary buttons (Send, Save, Continue), unread dot, active toolbar icon, checked checkbox. Measured #1e77dd·#186dc7 (nudged to #1c72d6 so white labels pass 4.5:1).'],
  ['accent-hover', blue[700], blue[700], 'Hover of accent fills.'],
  ['accent-active', blue[800], blue[800], 'Pressed accent fills and the split-button divider.'],
  ['accent-fg', gray[0], gray[0], 'Text and icons on accent fills.'],
  ['accent-subtle', blue[100], blue[950], 'Selected option tint ("Included"), AI label chip, focused option row.'],
  ['accent-text', blue[800], blue[400], 'Accent-coloured text: links, "Included", active filter icon.'],
  ['accent-border', blue[300], blue[900], 'Outline of a selected option card (onboarding "Included" rows). Decorative; paired with text.'],
  ['focus-ring', blue[600], blue[400], 'Focus-visible outline (2px solid), and the 1px border of a focused input. Meets 3:1.'],
  ['focus-halo', alpha(blue[600], 0.28), alpha(blue[400], 0.35), 'Soft 3px halo around a focused input, outside the 1px focus-ring border. Decorative.'],
  ['overlay', alpha('#0f0f0f', 0.6), alpha('#000000', 0.5), 'Scrim behind the settings modal and template gallery. Measured: white dims to #626262.'],
  ['danger', '#d44c47', '#e5635e', 'Destructive icon/text (Delete view, Trash). Pair with a word.'],
  ['danger-text', '#b8322d', '#f08c88', 'Destructive labels on bg or raised surfaces.'],
  ['danger-subtle', TAGS.red[0], TAGS.red[3], 'Destructive button hover tint; error field message ground.'],
];
for (const [name, [lb, lf, li, db, df, di]] of Object.entries(TAGS)) {
  const hue = name[0].toUpperCase() + name.slice(1);
  roles.push([`tag-${name}-bg`, lb, db, `${hue} label chip / status pill fill.`]);
  roles.push([`tag-${name}-fg`, lf, df, `Text on tag-${name}-bg.`]);
  roles.push([`icon-${name}`, li, di, `${hue} glyph: view icons, status dots, template icons. Decorative, always next to a text label.`]);
}
const light = {}, dark = {}, usage = {};
for (const [n, l, d, u] of roles) { light[n] = l; dark[n] = d; usage[n] = u; }

// ---- Contrast pairs: [fg, bg, kind]  kind: text (4.5) | ui (3) --------------
const grounds = ['bg', 'bg-sidebar', 'surface-raised', 'surface-input', 'surface-hover', 'surface-selected'];
const pairs = [
  ...['text', 'text-muted', 'text-subtle'].flatMap(f => grounds.map(b => [f, b, 'text'])),
  ['text-on-tooltip', 'surface-tooltip', 'text'], ['text-on-tooltip-muted', 'surface-tooltip', 'text'],
  ['accent-fg', 'accent', 'text'], ['accent-fg', 'accent-hover', 'text'], ['accent-fg', 'accent-active', 'text'],
  ...['bg', 'bg-sidebar', 'surface-raised', 'accent-subtle', 'surface-hover'].map(b => ['accent-text', b, 'text']),
  ['text', 'accent-subtle', 'text'],
  ...Object.keys(TAGS).map(t => [`tag-${t}-fg`, `tag-${t}-bg`, 'text']),
  ['danger-text', 'bg', 'text'], ['danger-text', 'surface-raised', 'text'], ['danger-text', 'danger-subtle', 'text'],
  ...['bg', 'bg-sidebar', 'surface-raised', 'surface-input', 'surface-hover'].map(b => ['focus-ring', b, 'ui']),
  ...['bg', 'bg-sidebar', 'surface-raised', 'surface-hover'].map(b => ['border-strong', b, 'ui']),
  ['accent', 'bg', 'ui'], ['accent', 'surface-hover', 'ui'], ['danger', 'bg', 'ui'],
];
const rows = []; let fails = 0;
for (const [f, b, kind] of pairs) {
  const min = kind === 'text' ? 4.5 : 3;
  for (const [tn, t] of [['light', light], ['dark', dark]]) {
    const r = contrast(t[f].slice(0, 7), t[b].slice(0, 7));
    const ok = r >= min; if (!ok) fails++;
    rows.push({ theme: tn, fg: f, bg: b, kind, min, ratio: r, fgHex: t[f], bgHex: t[b], ok });
  }
}
// Informational only: the source's own low-contrast values, reported so nobody mistakes them for body text.
const info = [
  ['text-placeholder', 'bg'], ['text-placeholder', 'surface-input'],
  ...Object.keys(TAGS).map(t => [`icon-${t}`, 'bg']),
];
const kindLabel = { text: 'normal text', ui: 'UI / large' };
let md = `| Theme | Foreground | Background | Use | Min | Ratio | Result |\n|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${r.theme} | \`${r.fg}\` ${r.fgHex} | \`${r.bg}\` ${r.bgHex} | ${kindLabel[r.kind]} | ${r.min}:1 | ${r.ratio.toFixed(2)}:1 | ${r.ok ? 'PASS' : 'FAIL'} |\n`;
md += `\n${rows.length} pairs checked, ${rows.length - fails} pass, ${fails} fail.\n`;
md += `\nExempt by design (source values kept exact, never used for text the user must read): \`text-placeholder\` (placeholders and hints), \`text-disabled\`, \`border\` (decorative hairline), \`accent-border\`, \`focus-halo\`, and the \`icon-*\` inks (decorative glyphs that always sit next to a text label). For reference:\n\n| Theme | Foreground | Background | Ratio |\n|---|---|---|---|\n`;
for (const [f, b] of info) for (const [tn, t] of [['light', light], ['dark', dark]]) md += `| ${tn} | \`${f}\` ${t[f]} | \`${b}\` ${t[b]} | ${contrast(t[f], t[b]).toFixed(2)}:1 |\n`;
writeFileSync(join(out, 'contrast-report.md'), md);
console.log(`${rows.length} pairs checked, ${rows.length - fails} pass, ${fails} fail.`);
if (fails) { rows.filter(r => !r.ok).forEach(r => console.log('FAIL', r.theme, r.fg, 'on', r.bg, r.ratio.toFixed(2))); process.exitCode = 1; }

// ---- Everything else --------------------------------------------------------
const lightShadow = (a) => `rgba(15, 15, 15, ${a})`;
const shadow = {
  light: {
    none: 'none',
    xs: `0 1px 2px ${lightShadow(0.06)}`,
    sm: `0 0 0 1px ${lightShadow(0.08)}, 0 1px 2px ${lightShadow(0.06)}`,
    md: `0 0 0 1px ${lightShadow(0.05)}, 0 3px 6px ${lightShadow(0.08)}, 0 9px 24px ${lightShadow(0.14)}`,
    lg: `0 0 0 1px ${lightShadow(0.05)}, 0 5px 10px ${lightShadow(0.08)}, 0 15px 40px ${lightShadow(0.18)}`,
    xl: `0 0 0 1px ${lightShadow(0.05)}, 0 16px 48px ${lightShadow(0.24)}`,
  },
  dark: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
    sm: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 0 0 1px rgba(255, 255, 255, 0.07), 0 3px 6px rgba(0, 0, 0, 0.3), 0 9px 24px rgba(0, 0, 0, 0.5)',
    lg: '0 0 0 1px rgba(255, 255, 255, 0.07), 0 5px 10px rgba(0, 0, 0, 0.35), 0 15px 40px rgba(0, 0, 0, 0.6)',
    xl: '0 0 0 1px rgba(255, 255, 255, 0.07), 0 16px 48px rgba(0, 0, 0, 0.7)',
  },
};
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", ui-sans-serif, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const tokens = {
  $meta: { name: 'ZeroLatency DS', version: '2.0.0', generatedBy: 'design-system/scripts/build-tokens.mjs',
    source: '200 reference frames of the app (ScreenShotFrames100/, ScreenShotFrames200/); measurements in design-system/frame-audit.md',
    note: 'Role tokens are the public API; primitives are for building roles only. Colors in hex (8-digit = alpha).' },
  color: { primitive: P, tags: TAGS, light, dark, usage },
  font: {
    sans: { family: 'System UI', stack: SANS, license: 'System fonts (no files shipped)', usage: 'All UI and marketing text. Renders SF Pro on Apple devices and Segoe UI on Windows, as in the reference frames.' },
    mono: { family: 'System mono', stack: MONO, license: 'System fonts (no files shipped)', usage: 'Keyboard shortcuts, code blocks, raw IDs.' },
  },
  // App sizes are as measured at the app's "Large" font setting (the one the frames were recorded at).
  fontSize: {
    '2xs': { size: '11px', lineHeight: '14px', letterSpacing: '0.01em' },
    xs: { size: '12px', lineHeight: '16px', letterSpacing: '0' },
    sm: { size: '13px', lineHeight: '18px', letterSpacing: '0' },
    md: { size: '14px', lineHeight: '20px', letterSpacing: '0' },
    base: { size: '16px', lineHeight: '24px', letterSpacing: '0' },
    lg: { size: '18px', lineHeight: '24px', letterSpacing: '-0.005em' },
    xl: { size: '22px', lineHeight: '28px', letterSpacing: '-0.01em' },
    '2xl': { size: '28px', lineHeight: '34px', letterSpacing: '-0.015em' },
    '3xl': { size: '36px', lineHeight: '42px', letterSpacing: '-0.02em' },
    '4xl': { size: '44px', lineHeight: '50px', letterSpacing: '-0.025em' },
    '5xl': { size: '56px', lineHeight: '60px', letterSpacing: '-0.03em' },
    display: { size: '72px', lineHeight: '76px', letterSpacing: '-0.035em' },
  },
  fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  spacing: { 0: '0px', px: '1px', 0.5: '2px', 1: '4px', 1.5: '6px', 2: '8px', 2.5: '10px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px', 24: '96px' },
  radius: { none: '0px', xs: '3px', sm: '4px', md: '6px', lg: '8px', xl: '10px', '2xl': '12px', full: '9999px' },
  size: {
    'sidebar-width': '240px', 'settings-nav-width': '250px', 'panel-width': '400px', 'composer-width': '600px', 'popover-width': '300px', 'modal-max-width': '1050px', 'modal-inset': '32px',
    'header-height': '44px', 'row-height': '38px', 'row-height-compact': '32px', 'nav-item-height': '30px', 'menu-item-height': '28px', 'menu-item-2line-height': '44px',
    'control-height-sm': '24px', 'control-height': '28px', 'control-height-lg': '32px', 'chip-height': '20px', 'avatar-size': '20px', 'checkbox-size': '14px', 'unread-dot': '6px', 'icon-size': '16px', 'icon-size-lg': '18px',
  },
  shadow,
  breakpoint: { sm: '375px', md: '768px', lg: '1280px', xl: '1536px' },
  motion: {
    duration: { instant: '0ms', fast: '100ms', base: '150ms', slow: '200ms', slower: '300ms' },
    easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', enter: 'cubic-bezier(0, 0, 0.2, 1)', exit: 'cubic-bezier(0.4, 0, 1, 1)', linear: 'linear' },
    reducedMotion: 'Under prefers-reduced-motion: reduce, all transitions/animations drop to 0.01ms except opacity fades (kept at duration.fast). No transform-based movement.',
  },
  zIndex: { base: 0, raised: 1, sticky: 100, sidebar: 200, panel: 250, dropdown: 300, overlay: 400, modal: 500, toast: 600, tooltip: 700 },
};
writeFileSync(join(out, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
console.log('wrote tokens.json');
