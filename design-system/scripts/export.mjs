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
  neutral: 'Mineral neutral (slight cool bias toward the accent hue). Build roles from it; do not use directly in components.',
  accent: 'Slipstream accent scale. Use via accent-* roles.',
  success: 'Success scale. Use via success-* roles.', warning: 'Warning scale. Use via warning-* roles.',
  error: 'Error scale. Use via error-* roles.', info: 'Info scale. Use via info-* roles.',
};
const colorTokens = [];
for (const n of Object.keys(t.color.light)) colorTokens.push({ name: n, value: { light: t.color.light[n], dark: t.color.dark[n] }, usage: t.color.usage[n] });
for (const [scale, steps] of Object.entries(t.color.primitive))
  for (const [s, v] of Object.entries(steps)) colorTokens.push({ name: `${scale}-${s}`, value: v, usage: `${primUsage[scale]} Step ${s}.` });

const radiusUsage = { none: 'Square edges (tables, full-bleed).', xs: 'Checkbox, kbd, focus corners.', sm: 'Small buttons, inbox rows.', md: 'Buttons, inputs, selects, icon tiles.', lg: 'Cards, toasts.', xl: 'Modals, product frame.', '2xl': 'CTA band.', full: 'Badges, toggles, avatars.' };
const shadowUsage = { none: 'Flat.', xs: 'Toggle knob.', sm: 'Hovered interactive card, segmented selection.', md: 'Raised card, popover.', lg: 'Toast, featured plan.', xl: 'Modal, product frame.' };
const weightUsage = { regular: 'Body, read rows.', medium: 'Labels, buttons, nav.', semibold: 'Headings, unread rows, titles.', bold: 'Rare emphasis in long copy.' };
const bpUsage = { sm: 'Small phones baseline (375).', md: 'Tablet / two-column layouts (768).', lg: 'Desktop, 3-column product frame (1280).', xl: 'Wide desktop (1536).' };
const durUsage = { instant: 'State swaps with no motion.', fast: 'Hover, press, color changes; reduced-motion fades.', base: 'Toggles, chevrons, small moves.', slow: 'Modal/toast enter, panels.', slower: 'Large page-level transitions (rare).' };
const easeUsage = { standard: 'Default for state changes.', enter: 'Elements appearing (decelerate).', exit: 'Elements leaving (accelerate).', linear: 'Spinners, opacity-only fades.' };
const fs = t.fontSize;
const st = (name, key, weight, usage, sample, family) => ({ name, fontSize: fs[key].size, lineHeight: fs[key].lineHeight, letterSpacing: fs[key].letterSpacing, fontWeight: weight, usage, sample, ...(family ? { family } : {}) });
const artTokens = {
  name: 'ZeroLatency DS', version: 1,
  color: { themes: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }], tokens: colorTokens },
  type: {
    fonts: [
      { family: 'Instrument Sans Variable', file: 'fonts/InstrumentSans-Variable.woff2', weight: '400 700', style: 'normal' },
      { family: 'IBM Plex Mono', file: 'fonts/IBMPlexMono-Regular.woff2', weight: '400', style: 'normal' },
      { family: 'IBM Plex Mono', file: 'fonts/IBMPlexMono-Medium.woff2', weight: '500', style: 'normal' },
    ],
    families: { sans: t.font.sans.stack, mono: t.font.mono.stack },
    groups: [
      { name: 'Display', family: 'sans', styles: [
        st('display', 'display', 600, 'Hero headline only (one per page). Drops to h1 size below 768px.', 'Email, handled before you look.'),
        st('h1', '5xl', 600, 'Page titles; hero headline on mobile.', 'Your inbox, pre-processed.'),
        st('h2', '4xl', 600, 'Section headings on marketing pages.', 'Simple plans.'),
        st('h3', '3xl', 600, 'Sub-section headings; section headings on mobile.', 'Get your mornings back.'),
        st('h4', '2xl', 600, 'Featured quote, large card titles.', 'Drafts in your voice'),
      ] },
      { name: 'Text', family: 'sans', styles: [
        st('title', 'xl', 600, 'Modal and empty-state titles, hero lead on desktop.', 'Nothing needs you right now'),
        st('lead', 'lg', 400, 'Section leads and card titles (600).', 'Every thread is sorted before it reaches you.'),
        st('body', 'base', 400, 'Default body copy and FAQ answers.', 'The agent offers times from your calendar.'),
        st('body-sm', 'sm', 400, 'App UI default: rows, inputs, buttons, card body.', 'Term sheet redlines'),
        st('label', 'sm', 500, 'Field labels, buttons, nav links, tabs.', 'Join waitlist'),
        st('caption', 'xs', 500, 'Badges, group headers, hints, timestamps.', 'Needs you · 9:41'),
      ] },
      { name: 'Mono', family: 'mono', styles: [
        st('mono', 'sm', 400, 'Keyboard shortcuts, code, latency figures.', '⌘K  e  j/k'),
        st('mono-xs', 'xs', 500, 'Counts and times in dense panels.', '08:51  132'),
      ] },
    ],
  },
  spacing: { note: '4px base. Use these steps only.', tokens: Object.entries(t.spacing).map(([k, v]) => ({ name: `space-${k}`, value: v, usage: spaceUsage(k) })) },
  radius: { tokens: Object.entries(t.radius).map(([k, v]) => ({ name: `radius-${k}`, value: v, usage: radiusUsage[k] })) },
  shadow: { note: 'Dark shadows are deeper because surfaces are separated by lightness, not by shadow alone.', tokens: Object.keys(t.shadow.light).map(k => ({ name: `shadow-${k}`, value: { light: t.shadow.light[k], dark: t.shadow.dark[k] }, usage: shadowUsage[k] })) },
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
  const m = { 0: 'Reset.', px: 'Hairline offsets.', 0.5: 'Icon nudge, tab padding.', 1: 'Badge icon gap, tight stacks.', 1.5: 'Label → control gap.', 2: 'Button icon gap, small gaps.', 3: 'Input padding, row gap.', 4: 'Card grid gap, button padding md.', 5: 'Button padding lg, tab gap.', 6: 'Card padding, page gutter ≥ 768px.', 8: 'Nav gap, footer columns.', 10: 'Large block gaps.', 12: 'Section head → content.', 16: 'Hero visual offset, mobile section padding.', 20: 'Large section spacing.', 24: 'Desktop section padding.', 32: 'Oversized hero spacing.' };
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
- Focus-visible everywhere: \`outline: 2px solid var(--focus-ring); outline-offset: 2px\` (inputs: inside, offset -1px). On \`surface-emphasis\`, use \`focus-ring-emphasis\`.
- Motion: hover/press \`duration-fast\` + \`ease-standard\`; enter \`duration-slow\` + \`ease-enter\`; exit \`duration-fast\` + \`ease-exit\`. Under \`prefers-reduced-motion: reduce\` only opacity fades remain.
- Color carries meaning only together with text, weight or an icon.
- Touch targets ≥ 44px on mobile (use lg controls or pad rows).

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
