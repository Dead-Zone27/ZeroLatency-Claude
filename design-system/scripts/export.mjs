// Builds the docs + the Claude Design System artifact tree from tokens.json and docs.mjs.
// Writes: ../components.md, and <artifactDir>/project/{tokens.json, README.md, components/*/README.md, components/bundle.css, design-system.json}
// Usage: node export.mjs <artifactDir>
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS } from './docs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const art = process.argv[2]; if (!art) throw new Error('usage: node export.mjs <artifactDir>');
const proj = join(art, 'project');
const t = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const contrast = readFileSync(join(root, 'contrast-report.md'), 'utf8');

// ---------- Artifact tokens.json (list shape) ----------
const primUsage = {
  gray: 'Light-theme neutral, sampled from the reference frames (sidebar #f6f6f6, hover #f0f0f0, selected #e8e8e8). Build roles from it; do not use directly in components.',
  ink: 'Dark-theme neutral, sampled from the reference frames (#161616 canvas, #1c1c1c nav, #202020 menus). Build roles from it.',
  blue: 'The single action hue. Use via accent-* and focus-* roles.',
};
const colorTokens = [];
for (const n of Object.keys(t.color.light)) colorTokens.push({ name: n, value: { light: t.color.light[n], dark: t.color.dark[n] }, usage: t.color.usage[n] });
for (const [scale, steps] of Object.entries(t.color.primitive))
  for (const [s, v] of Object.entries(steps)) colorTokens.push({ name: `${scale}-${s}`, value: v, usage: `${primUsage[scale]} Step ${s}.` });

const radiusUsage = { none: 'Square edges.', xs: 'Checkbox, kbd.', sm: 'Label chips (tags), recipient chips.', md: 'Buttons, inputs, sidebar items, menu items, rows, tooltips, toasts.', lg: 'Hover preview, template art.', xl: 'Menus and popovers, cards.', '2xl': 'Settings modal, composer, product frame, CTA band.', full: 'Status pills, toggles, avatars, unread dot.' };
const shadowUsage = { none: 'Flat.', xs: 'Toggle knob, template mini-window.', sm: 'Secondary button ring (Auto label), option rows, cards, icon tiles.', md: 'Menus, popovers, tooltips, hovered cards.', lg: 'Composer, hover preview, toasts.', xl: 'Settings modal, hero product visual.' };
const weightUsage = { regular: 'Body, read rows, menu items, secondary buttons.', medium: 'View title, current sidebar item, group headings, primary buttons, setting titles.', semibold: 'Unread sender and subject, panel titles, settings pane title.', bold: 'Thread title and marketing headlines.' };
const bpUsage = { sm: 'Small phones baseline (375).', md: 'Tablet / two-column layouts (768).', lg: 'Desktop, 3-column product frame (1280).', xl: 'Wide desktop (1536).' };
const durUsage = { instant: 'State swaps with no motion.', fast: 'Hover fills, row actions appearing; reduced-motion fades.', base: 'Toggles, chevrons.', slow: 'Menus, toasts, side panels entering.', slower: 'Modal scrim (rare).' };
const easeUsage = { standard: 'Default for state changes.', enter: 'Elements appearing (decelerate).', exit: 'Elements leaving (accelerate).', linear: 'Spinners, opacity-only fades.' };
const sizeUsage = {
  'sidebar-width': 'Sidebar column.', 'settings-nav-width': 'Settings modal navigation.', 'panel-width': 'Edit view / Properties side panel.', 'composer-width': 'Floating composer.', 'popover-width': 'Filter, group-by and option menus.', 'modal-max-width': 'Settings modal maximum width.', 'modal-inset': 'Gap between the settings modal and the viewport.',
  'header-height': 'View header and thread-view toolbar.', 'row-height': 'Thread row (Large font setting).', 'row-height-compact': 'Thread row, compact density.', 'nav-item-height': 'Sidebar items.', 'menu-item-height': 'One-line menu items.', 'menu-item-2line-height': 'Menu items with a description.',
  'control-height-sm': 'Small buttons.', 'control-height': 'Buttons, inputs, icon buttons.', 'control-height-lg': 'Large buttons, option rows.', 'chip-height': 'Label chips and status pills.', 'avatar-size': 'Account avatar, monograms.', 'checkbox-size': 'Checkbox box.', 'unread-dot': 'Unread indicator.', 'icon-size': 'Line icons.', 'icon-size-lg': 'Coloured view glyphs.',
};
const fs = t.fontSize;
const st = (name, key, weight, usage, sample, family) => ({ name, fontSize: fs[key].size, lineHeight: fs[key].lineHeight, letterSpacing: fs[key].letterSpacing, fontWeight: weight, usage, sample, ...(family ? { family } : {}) });
const artTokens = {
  name: 'ZeroLatency DS', version: 1,
  color: { themes: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }], tokens: colorTokens },
  type: {
    fonts: [],
    families: { sans: t.font.sans.stack, mono: t.font.mono.stack },
    groups: [
      { name: 'App', family: 'sans', styles: [
        st('thread-title', 'xl', 700, 'Open thread subject.', 'Term sheet redlines'),
        st('pane-title', 'lg', 600, 'Settings section title, empty-state titles.', 'Inbox'),
        st('body', 'base', 400, 'Email body in the thread view and composer.', 'Two open points on the option pool before we can sign.'),
        st('ui', 'md', 400, 'Default UI text: rows, sidebar, menus, inputs, buttons.', 'Can we move Thursday?'),
        st('ui-strong', 'md', 600, 'Unread sender and subject.', 'Priya Raman'),
        st('ui-medium', 'md', 500, 'View title, current sidebar item, group headings, setting titles.', 'Needs you'),
        st('small', 'sm', 400, 'Timestamps, secondary buttons in dense spots, message meta.', '8:38 AM'),
        st('label', 'xs', 500, 'Chips, section labels (Views, Mail), menu section labels.', 'Action required'),
        st('caption', 'xs', 400, 'Descriptions under menu items and settings.', 'Group by people and companies'),
        st('micro', '2xs', 500, 'Tooltip shortcut line, DEFAULT markers (uppercase +0.04em).', 'Ctrl F'),
      ] },
      { name: 'Marketing', family: 'sans', styles: [
        st('display', 'display', 700, 'Hero headline only. Drops to 4xl below 768px.', 'An inbox that sorts itself.'),
        st('h1', '5xl', 700, 'Page titles.', 'Views you define.'),
        st('h2', '4xl', 700, 'Section headings.', 'Your priorities, not folders.'),
        st('h3', '3xl', 700, 'CTA band, pricing figures.', 'Make your first view.'),
        st('h4', '2xl', 700, 'Mobile section headings.', 'Scheduling built in'),
        st('lead', 'lg', 400, 'Section leads.', 'Each view is a filter, a grouping and the properties you care about.'),
      ] },
      { name: 'Mono', family: 'mono', styles: [
        st('mono', 'sm', 400, 'Code blocks and raw IDs only.', 'Report-ID 0a53ac22'),
      ] },
    ],
  },
  spacing: { note: '4px base. Use these steps only.', tokens: Object.entries(t.spacing).map(([k, v]) => ({ name: `space-${k}`, value: v, usage: spaceUsage(k) })) },
  radius: { tokens: Object.entries(t.radius).map(([k, v]) => ({ name: `radius-${k}`, value: v, usage: radiusUsage[k] })) },
  shadow: { note: 'Dark shadows are deeper because surfaces are separated by lightness, not by shadow alone.', tokens: Object.keys(t.shadow.light).map(k => ({ name: `shadow-${k}`, value: { light: t.shadow.light[k], dark: t.shadow.dark[k] }, usage: shadowUsage[k] })) },
  size: { note: 'Component dimensions measured from the reference frames (at the app\'s Large font setting).', tokens: Object.entries(t.size).map(([k, v]) => ({ name: `size-${k}`, value: v, usage: sizeUsage[k] })) },
  fontSize: { note: 'Type scale sizes (same names as the local tokens.css).', tokens: Object.entries(fs).map(([k, v]) => ({ name: `text-${k}`, value: v.size, usage: `Font size for the ${k} step.` })) },
  lineHeight: { tokens: Object.entries(fs).map(([k, v]) => ({ name: `text-${k}--line-height`, value: v.lineHeight, usage: `Line height paired with text-${k}.` })) },
  letterSpacing: { tokens: Object.entries(fs).map(([k, v]) => ({ name: `text-${k}--letter-spacing`, value: v.letterSpacing, usage: `Tracking paired with text-${k}; tighter as size grows.` })) },
  fontWeight: { tokens: Object.entries(t.fontWeight).map(([k, v]) => ({ name: `font-weight-${k}`, value: String(v), usage: weightUsage[k] })) },
  breakpoint: { note: 'Mobile-first min-widths.', tokens: Object.entries(t.breakpoint).map(([k, v]) => ({ name: `breakpoint-${k}`, value: v, usage: bpUsage[k] })) },
  duration: { note: 'Motion durations. Under prefers-reduced-motion everything but opacity fades drops to ~0.', tokens: Object.entries(t.motion.duration).map(([k, v]) => ({ name: `duration-${k}`, value: v, usage: durUsage[k] })) },
  easing: { tokens: Object.entries(t.motion.easing).map(([k, v]) => ({ name: `ease-${k}`, value: v, usage: easeUsage[k] })) },
  zIndex: { tokens: Object.entries(t.zIndex).map(([k, v]) => ({ name: `z-${k}`, value: String(v), usage: `Stacking layer for ${k}.` })) },
};
function spaceUsage(k) {
  const m = { 0: 'Reset.', px: 'Hairline offsets.', 0.5: 'Tight nudges.', 1: 'Chip gaps, icon nudges.', 1.5: 'Menu padding, chip padding, label → control gap.', 2: 'Icon-to-label gap, sidebar padding, row column gap.', 2.5: 'Button padding.', 3: 'List gutter, panel padding.', 4: 'View header inset, card grid gap, section-label top margin.', 5: 'Template grid column gap.', 6: 'Card padding, page gutter.', 8: 'Settings pane padding.', 10: 'Settings pane side padding, footer spacing.', 12: 'Thread body side padding, section head → content.', 16: 'Hero visual offset.', 20: 'Large section spacing.', 24: 'Desktop section padding.' };
  return m[k] || 'Spacing step.';
}

mkdirSync(proj, { recursive: true });
writeFileSync(join(proj, 'tokens.json'), JSON.stringify(artTokens, null, 2) + '\n');

// ---------- Component READMEs + components.md ----------
const section = (c, h = '##') => `${h} ${c.name}

${c.summary}

- **Anatomy:** ${c.anatomy}
- **Variants:** ${c.variants}
- **States:** ${c.states}
- **Tokens:** ${c.tokens}
- **Accessibility:** ${c.a11y}
- **Do:** ${c.do}
- **Don't:** ${c.dont}
`;
for (const c of COMPONENTS) {
  const dir = join(proj, 'components', c.name); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'README.md'), section(c, '#') + `\nClasses: see \`components/bundle.css\` (\`zl-\` prefix). The consumer provides the content (labels, data) and wires behaviour (focus management, state).\n`);
}
const comps = COMPONENTS.filter(c => c.kind === 'component'), pats = COMPONENTS.filter(c => c.kind === 'pattern');
let md = `# ZeroLatency DS — components and patterns

Reference for the Next.js + Tailwind build. Tokens: \`tokens.json\` → \`handoff/tokens.css\` (generated). Reference styles: \`handoff/components.css\` (\`zl-*\` classes). Live previews: the Design System artifact (see \`design-system-link.txt\`) and \`handoff/previews/*/preview.html\`.

**Shared rules**
- Source: every size, colour and behaviour here was measured from the 200 reference app frames (\`ScreenShotFrames100/\`, \`ScreenShotFrames200/\`); see \`frame-audit.md\`. Names, copy, icons and data are ZeroLatency's own.
- Focus-visible everywhere: \`outline: 2px solid var(--focus-ring); outline-offset: 2px\` (rows, menu and sidebar items: inset, offset -2px). Inputs show a 1px \`focus-ring\` border plus a 3px \`focus-halo\`.
- Motion: hover fills \`duration-fast\`; menus/panels enter \`duration-slow\` + \`ease-enter\`. Under \`prefers-reduced-motion: reduce\` only opacity fades remain.
- Colour carries meaning only together with text or a distinct glyph shape. Blue means "act" or "on"; everything else is gray plus soft label inks.
- Touch targets ≥ 44px on mobile (pad rows; use lg/xl controls).

**Contents**
- Components (${comps.length}): ${comps.map(c => c.name).join(', ')}
- Patterns (${pats.length}): ${pats.map(c => c.name).join(', ')}

---

# Components

${comps.map(c => section(c)).join('\n')}
---

# Page patterns

${pats.map(c => section(c)).join('\n')}
---

# Contrast (WCAG 2.x)

Generated by \`node design-system/scripts/build-tokens.mjs\` (writes \`contrast-report.md\`; the script exits non-zero if any pair fails). Normal text needs ≥ 4.5:1; UI parts (control borders, focus rings, icons) and large text need ≥ 3:1.

Script output:

\`\`\`
$ node design-system/scripts/build-tokens.mjs
${contrast.trim().split('\n').pop()}
wrote tokens.json
\`\`\`

${contrast}`;
writeFileSync(join(root, 'components.md'), md);

// ---------- bundle.css ----------
mkdirSync(join(proj, 'components'), { recursive: true });
writeFileSync(join(proj, 'components', 'bundle.css'), readFileSync(join(root, 'handoff', 'components.css'), 'utf8'));
console.log('export done');
