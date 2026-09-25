// Writes one preview.html per component/pattern (static HTML using components.css classes).
// Usage: node previews.mjs <outDir>   → <outDir>/<Name>/preview.html
// Layouts, sizes and states recreate what the reference app frames show; all names, copy and icons here are
// ZeroLatency's own (fictional data, original line icons), never copied from the reference product.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
if (!outDir) throw new Error('usage: node previews.mjs <outDir>');

// ---- Line icons (24 grid, 1.5 stroke, currentColor) ----
const L = {
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>',
  compose: '<path d="M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/><path d="M17.5 4.5l2 2L12 14l-2.8.8.8-2.8z"/>',
  chevDown: '<path d="M7 10l5 5 5-5"/>', chevRight: '<path d="M10 7l5 5-5 5"/>', chevUp: '<path d="M7 14l5-5 5 5"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', collapse: '<path d="M13 7l-5 5 5 5M19 7l-5 5 5 5"/>', expand: '<path d="M11 7l5 5-5 5M5 7l5 5-5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M7 7l10 10M17 7 7 17"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  filter: '<path d="M4 7h16M7 12h10M10 17h4"/>', group: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="2.4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
  refresh: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4.5V8h-3.5"/>',
  archive: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9M10 13h4"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>', clock: '<circle cx="12" cy="12" r="7.5"/><path d="M12 8v4l2.5 1.5"/>',
  tag: '<path d="M4 12.5V5a1 1 0 0 1 1-1h7.5L20 11.5 12.5 19z"/><circle cx="8.5" cy="8.5" r="1.2"/>',
  read: '<rect x="5" y="5" width="14" height="14" rx="2.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  unread: '<rect x="5" y="5" width="14" height="14" rx="2.5"/><circle cx="17.5" cy="6.5" r="2.5" fill="currentColor" stroke="none"/>',
  more: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="2.6"/>', clip: '<path d="M16.5 8.5 10 15a2 2 0 0 1-2.8-2.8L14 5.4a3.5 3.5 0 0 1 5 5L12 17.5a5 5 0 0 1-7-7L11.5 4"/>',
  eye: '<path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeOff: '<path d="M4 4l16 16M9.9 6.3A9 9 0 0 1 12 6c5.8 0 9 6 9 6a15 15 0 0 1-2.6 3.3M6.4 7.8A15 15 0 0 0 3 12s3.2 6 9 6a8.6 8.6 0 0 0 3.6-.8"/>',
  drag: '<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="2.4"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  send: '<path d="M20 4 10 14M20 4l-6 16-4-6-6-4z"/>', draft: '<circle cx="12" cy="12" r="7.5"/><path d="M9 15l1-3 4.5-4.5 2 2L12 14z"/>',
  spam: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><path d="M12 8.5v4M12 15.5v.01"/>',
  help: '<circle cx="12" cy="12" r="8"/><path d="M9.8 9.6a2.3 2.3 0 0 1 4.4.8c0 1.6-2.2 2-2.2 3.4M12 16.5v.01"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v3M15.5 3.5v3"/>',
  sliders: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
  text: '<path d="M4 18 8.5 6 13 18M5.8 14.5h5.4M15.5 12.5c.6-.7 1.4-1 2.3-1 1.4 0 2.2.8 2.2 2.2V18M20 15c-2.8 0-4.5.5-4.5 1.7 0 .9.7 1.4 1.7 1.4 1.5 0 2.8-1.1 2.8-2.6"/>',
  hash: '<path d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16"/>', select: '<circle cx="12" cy="12" r="8"/><path d="M9 11l3 3 3-3"/>',
  status: '<path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.3 6.3l1.8 1.8M15.9 15.9l1.8 1.8M6.3 17.7l1.8-1.8M15.9 8.1l1.8-1.8"/>',
  person: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="10" r="2.8"/><path d="M7 17.5c1-2 2.8-3 5-3s4 1 5 3"/>',
  checkbox: '<rect x="5" y="5" width="14" height="14" rx="2.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  link: '<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.3 6.7"/>',
  star: '<path d="M12 4.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16.4l-4.6 2.4.9-5.2-3.8-3.6 5.2-.7z"/>',
  important: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5M12 15.5v.01"/>',
  external: '<path d="M9 6h9v9M18 6 7 17"/>', inbox: '<path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
  wand: '<path d="M5 19 15 9M14 5v2M18 9h2M17 6l1.5-1.5M18.5 13.5 17 12M10 6 8.5 4.5"/>', user: '<circle cx="12" cy="9" r="3.2"/><path d="M5.5 19c1.2-3 3.6-4.5 6.5-4.5s5.3 1.5 6.5 4.5"/>',
  map: '<path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>', brackets: '<path d="M9 5H7.5A1.5 1.5 0 0 0 6 6.5v3L4.5 12 6 14.5v3A1.5 1.5 0 0 0 7.5 19H9M15 5h1.5A1.5 1.5 0 0 1 18 6.5v3l1.5 2.5-1.5 2.5v3a1.5 1.5 0 0 1-1.5 1.5H15"/>',
  pen: '<path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/>', sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
};
// ---- Filled view glyphs (24 grid, currentColor) — ZeroLatency's own shapes ----
const G = {
  inbox: '<path d="M6 4h12l3 8.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6.5zm-.6 8.5h4.3l1 2h2.6l1-2h4.3L16.6 6H7.4z"/>',
  tag: '<path d="M3 11.6V4a1 1 0 0 1 1-1h7.6l9.7 9.7a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0zM7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
  bolt: '<path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.8z"/>',
  book: '<path d="M5 4a2 2 0 0 1 2-2h12v16H7a1 1 0 0 0 0 2h12v2H7a3 3 0 0 1-3-3V4zm4 2v2h7V6z"/>',
  archive: '<path d="M3 4h18v5H3zm1.5 6.5h15V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1zm5 2v2h5v-2z"/>',
  cal: '<path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2zm-2 7v10h14V9z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 3.2V8l8 5 8-5v-.8l-8 5z"/>',
  alert: '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 5 .4 7h1.8l.4-7zm1.3 8.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/>',
  layers: '<path d="M12 2 2 7.5 12 13l10-5.5zM4.3 11.2 2 12.5 12 18l10-5.5-2.3-1.3L12 15.4zm0 5L2 17.5 12 23l10-5.5-2.3-1.3L12 20.4z"/>',
  bell: '<path d="M12 2a6 6 0 0 1 6 6v5l2 3v1H4v-1l2-3V8a6 6 0 0 1 6-6zm-2.5 17h5a2.5 2.5 0 0 1-5 0z"/>',
  chat: '<path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z"/>',
  basket: '<path d="M9.2 3.5 6.4 9H3v2l1.8 8.2A1 1 0 0 0 5.8 20h12.4a1 1 0 0 0 1-.8L21 11V9h-3.4l-2.8-5.5-1.8.9L15.4 9H8.6l2.4-4.6z"/>',
  bolt2: '<path d="M12 2l2.9 6.9L22 9.7l-5.3 4.8L18.2 22 12 18.3 5.8 22l1.5-7.5L2 9.7l7.1-.8z"/>',
  list: '<path d="M4 5h3v3H4zm5 0h11v3H9zM4 10.5h3v3H4zm5 0h11v3H9zM4 16h3v3H4zm5 0h11v3H9z"/>',
  cart: '<path d="M2 3h3l2.6 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.7L21 7H6.5M9 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
  plane: '<path d="M21 3 3 10.5l6.5 2.5L12 20z"/>',
  phone: '<path d="M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm4 17v1h2v-1z"/>',
};
const ic = (n, cls = '') => `<svg class="zl-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${L[n]}</svg>`;
const gl = (n, ink, cls = '') => `<svg class="zl-glyph zl-ink-${ink} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${G[n]}</svg>`;
// Status glyphs (14px)
const SD = {
  todo: '<circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="2 1.6"/>',
  progress: '<circle cx="7" cy="7" r="6.5" fill="currentColor"/><path d="M5.6 4.4 9.6 7l-4 2.6z" fill="#fff"/>',
  done: '<circle cx="7" cy="7" r="6.5" fill="currentColor"/><path d="M4.3 7.2 6.2 9l3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  canceled: '<circle cx="7" cy="7" r="6.5" fill="currentColor"/><path d="M4.9 4.9l4.2 4.2M9.1 4.9 4.9 9.1" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
};
const status = (k, label) => `<span class="zl-status zl-status--${k}"><svg class="zl-status-dot" viewBox="0 0 14 14" aria-hidden="true">${SD[k]}</svg>${label}</span>`;
const CHECK = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 5.2 4.1 7.3 8 2.8"/></svg>';
const check = (label, extra = '') => `<label class="zl-check ${extra}"><input type="checkbox"${extra.includes('is-checked') ? ' checked' : ''}><span class="zl-check-box">${CHECK}</span>${label ? `<span>${label}</span>` : '<span class="zl-visually-hidden">Select</span>'}</label>`;
const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/><path d="M13.5 9.5A7 7 0 1 0 20.5 16.5M13.5 9.5H24.5" fill="none" stroke="var(--accent-fg)" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const brand = `<a class="zl-brand" href="#" aria-label="ZeroLatency home">${MARK}<span>ZeroLatency</span></a>`;
const cap = (t) => `<p class="zl-section-label" style="margin:0 0 8px">${t}</p>`;
const row = (...items) => `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px">${items.join('')}</div>`;
const btnI = (n, label, extra = '') => `<button class="zl-btn zl-btn--icon ${extra}" aria-label="${label}">${ic(n)}</button>`;

// ---- Building blocks ----
const tag = (t, c = 'gray') => `<span class="zl-tag${c === 'gray' ? '' : ` zl-tag--${c}`}"><span>${t}</span></span>`;
const hoverActions = `<span class="zl-row-actions">${btnI('archive', 'Archive')}${btnI('trash', 'Trash')}${btnI('read', 'Mark as read')}${btnI('clock', 'Remind me')}${btnI('tag', 'Label')}</span>`;
const threadRow = ({ from, count, subject, snippet, tags = '', clip = false, time, unread = false, state = '', selected = false }) => `
<li class="zl-row${unread ? ' zl-row--unread' : ''} ${state}" tabindex="0" role="option" aria-selected="${selected}">
  ${check('', state.includes('is-checked') ? 'is-checked' : '')}
  <span class="zl-row-dot" aria-hidden="true"></span>
  <span class="zl-row-from">${from}${count ? `<span class="zl-row-count">${count}</span>` : ''}</span>
  <span class="zl-row-subject">${subject}${snippet ? ` <span class="zl-row-snippet">· ${snippet}</span>` : ''}</span>
  <span class="zl-row-meta">${tags}${clip ? ic('clip') : ''}</span>
  <span class="zl-row-time">${time}</span>${hoverActions}
</li>`;
const navItem = (label, glyph, ink, count = '', active = false, sub = '') => `<a class="zl-nav-item${sub ? ' zl-nav-item--sub' : ''}" href="#"${active ? ' aria-current="page"' : ''}>${glyph ? gl(glyph, ink) : sub}<span>${label}</span>${count ? `<span class="zl-nav-count">${count}</span>` : ''}</a>`;
const mailItem = (label, icon, count = '') => `<a class="zl-nav-item" href="#">${ic(icon, 'zl-icon--lg')}<span>${label}</span>${count ? `<span class="zl-nav-count">${count}</span>` : ''}</a>`;
const sidebar = (active = 'Needs you', compact = false) => `
<nav class="zl-sidebar" aria-label="Mailbox">
  <div class="zl-account"><span class="zl-avatar">A</span><span class="zl-account-id"><strong>Alex Morgan</strong><small>alex@northwind.io</small></span>${btnI('chevDown', 'Switch account', 'zl-btn--sm')}${btnI('compose', 'New message')}</div>
  <a class="zl-nav-item" href="#">${ic('search', 'zl-icon--lg')}<span>Search</span></a>
  <div class="zl-nav-section"><span class="zl-section-label">Views</span>${btnI('plus', 'New view', 'zl-btn--sm')}</div>
  ${navItem('Inbox', 'inbox', 'red', '4', active === 'Inbox')}
  ${navItem('Needs you', 'alert', 'orange', '3', active === 'Needs you')}
  ${navItem('Drafted for you', 'bolt', 'yellow', '12', active === 'Drafted for you')}
  ${navItem('Labels', 'tag', 'green', '2')}
  ${compact ? '' : `${navItem('Reading list', 'book', 'blue', '')}
  ${navItem('Archive', 'archive', 'green', '6')}
  ${navItem('Calendar', 'cal', 'text', '')}`}
  <a class="zl-nav-item" href="#">${ic('chevUp', 'zl-icon--lg')}<span>Less</span></a>
  <div class="zl-nav-section"><span class="zl-section-label">Mail</span></div>
  ${mailItem('All mail', 'mail')}${mailItem('Sent', 'send')}${mailItem('Drafts', 'draft', '2')}${compact ? '' : mailItem('Spam', 'spam') + mailItem('Trash', 'trash')}
  <div class="zl-sidebar-foot">${btnI('gear', 'Settings')}${btnI('cal', 'Calendar')}${btnI('help', 'Help')}</div>
</nav>`;
const viewbar = (title = 'Needs you', glyph = 'alert', ink = 'orange') => `
<header class="zl-viewbar">
  ${check('')}
  <h1 class="zl-viewbar-title" style="font-size:inherit;margin:0">${gl(glyph, ink)}<span>${title}</span></h1>
  <div class="zl-viewbar-tools">
    <button class="zl-btn zl-btn--secondary">${ic('wand')}Auto label</button>
    ${btnI('filter', 'Filter', 'is-on" aria-pressed="true')}${btnI('group', 'Group by')}${btnI('gear', 'Edit view')}${btnI('refresh', 'Refresh')}
  </div>
</header>`;
const list = `
<ul class="zl-list" role="listbox" aria-label="Threads">
  ${threadRow({ from: 'Priya Raman', count: 3, subject: 'Term sheet redlines', tags: tag('Action required', 'blue'), time: '8:38 AM', unread: true })}
  ${threadRow({ from: 'Jonas Beck', subject: 'Can we move Thursday?', tags: tag('Action required', 'blue'), time: '8:24 AM', unread: true, state: 'is-hover' })}
  ${threadRow({ from: 'Ops Weekly', subject: 'Vendor renewal due Friday', tags: tag('Action required', 'blue') + tag('Finance', 'yellow'), time: '8:22 AM' })}
  <li class="zl-group" role="presentation">Yesterday</li>
  ${threadRow({ from: 'Mina Okafor', subject: 'Offsite venue shortlist', tags: tag('Travel', 'purple'), clip: true, time: 'Apr 5' })}
  ${threadRow({ from: 'billing@cloudnest.dev', subject: 'Your invoice for March is ready', tags: tag('Receipts'), time: 'Apr 5' })}
</ul>`;

const P = {};

// ============ Actions ============
P.Button = { group: 'Actions', height: 300, html: `
${cap('Variants')}
${row(`<button class="zl-btn zl-btn--primary">Continue</button>`, `<button class="zl-btn zl-btn--secondary">${ic('wand')}Auto label</button>`, `<button class="zl-btn zl-btn--ghost">Cancel</button>`, `<button class="zl-btn zl-btn--text">Reset</button>`, `<button class="zl-btn zl-btn--danger">${ic('trash')}Delete view</button>`)}
${cap('Split, icon and sizes')}
${row(`<span class="zl-split"><button class="zl-btn zl-btn--primary">Send</button><button class="zl-btn zl-btn--primary" aria-label="More send options">${ic('chevDown')}</button></span>`, `<span class="zl-split"><button class="zl-btn zl-btn--primary">Save</button><button class="zl-btn zl-btn--primary" aria-label="More save options">${ic('chevDown')}</button></span>`, btnI('filter', 'Filter', 'is-on" aria-pressed="true'), btnI('group', 'Group by'), btnI('gear', 'Edit view'), btnI('refresh', 'Refresh'), `<button class="zl-btn zl-btn--primary zl-btn--sm">Small</button>`, `<button class="zl-btn zl-btn--primary zl-btn--lg">Large</button>`, `<button class="zl-btn zl-btn--primary zl-btn--xl">Get started</button>`)}
${cap('States: hover · pressed · focus · busy · disabled')}
${row(`<button class="zl-btn zl-btn--primary is-hover">Save</button>`, `<button class="zl-btn zl-btn--primary is-active">Save</button>`, `<button class="zl-btn zl-btn--secondary is-focus">${ic('wand')}Auto label</button>`, `<button class="zl-btn zl-btn--primary" aria-busy="true"><span class="zl-spinner" aria-hidden="true"></span>Sending</button>`, `<button class="zl-btn zl-btn--primary" disabled>Save</button>`, `<button class="zl-btn zl-btn--ghost is-hover">Hover</button>`)}` };

// ============ Forms ============
P.Input = { group: 'Forms', height: 250, html: `
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,300px));gap:20px 24px">
  <div class="zl-field"><label class="zl-field-label" for="i1">View name</label><input id="i1" class="zl-input zl-input--lg" value="Needs you"></div>
  <div class="zl-field"><label class="zl-field-label" for="i2">Filter</label><input id="i2" class="zl-input is-focus" placeholder="Filter by…"></div>
  <div class="zl-field"><label class="zl-field-label" for="i3">Search</label><span class="zl-input-wrap">${ic('search')}<input id="i3" class="zl-input" placeholder="Search grouping options…"></span></div>
  <div class="zl-field"><label class="zl-field-label" for="i4">Property name</label><input id="i4" class="zl-input" value="" aria-invalid="true" aria-describedby="i4e"><span id="i4e" class="zl-field-error">Give the property a name.</span></div>
</div>` };

P.Select = { group: 'Forms', height: 220, html: `
<div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap">
  <div style="display:grid;gap:8px">
    ${cap('Inline trigger (settings row)')}
    <button class="zl-select-trigger" aria-haspopup="listbox" aria-expanded="false">System${ic('chevDown')}</button>
    <button class="zl-select-trigger" aria-haspopup="listbox" aria-expanded="true">Side peek${ic('chevDown')}</button>
  </div>
  <div class="zl-menu" style="width:180px" role="listbox" aria-label="Theme">
    <button class="zl-menu-item" role="option" aria-selected="false">System</button>
    <button class="zl-menu-item" role="option" aria-selected="false">Light</button>
    <button class="zl-menu-item" role="option" aria-selected="true">Dark${ic('check', 'zl-menu-item-check')}</button>
  </div>
  <div class="zl-field" style="width:200px"><label class="zl-field-label" for="s1">Native</label><select id="s1" class="zl-input zl-select"><option>Go to next thread</option><option>Go to previous thread</option><option>Back to list</option></select></div>
</div>` };

P.Checkbox = { group: 'Forms', height: 110, html: `
${row(check('Unread'), check('Read', 'is-checked'), check('Mixed', 'is-mixed'), check('Focused', 'is-focus'), `<label class="zl-check"><input type="checkbox" disabled><span class="zl-check-box">${CHECK}</span><span style="color:var(--text-disabled)">Disabled</span></label>`)}
<p class="zl-field-hint" style="margin:0">In the thread list the box is hidden until the row is hovered, focused or already checked.</p>` };

P.Toggle = { group: 'Forms', height: 150, html: `
<div style="display:grid;gap:4px;max-width:520px">
  <div class="zl-setting"><span class="zl-setting-text"><strong>Include on replies and forwards</strong><small>Show your signature in replies and forwards you send.</small></span><button class="zl-toggle" role="switch" aria-checked="true" aria-label="Include on replies and forwards"></button></div>
  <div class="zl-setting"><span class="zl-setting-text"><strong>Default signature</strong><small>Add “Sent with ZeroLatency” to your emails.</small></span><button class="zl-toggle" role="switch" aria-checked="false" aria-label="Default signature"></button></div>
  <div class="zl-setting"><span class="zl-setting-text"><strong>Focused</strong><small>Keyboard focus ring.</small></span><button class="zl-toggle is-focus" role="switch" aria-checked="false" aria-label="Focused example"></button></div>
</div>` };

// ============ Data display ============
P.Tag = { group: 'Data display', height: 150, html: `
${cap('Label chips: nine inks')}
${row(tag('Receipts'), tag('Vendors', 'brown'), tag('Pending', 'orange'), tag('Finance', 'yellow'), tag('Signed', 'green'), tag('Action required', 'blue'), tag('Travel', 'purple'), tag('Hiring', 'pink'), tag('Urgent', 'red'))}
${cap('In a row: truncate, then +N')}
${row(`<span class="zl-tags">${tag('Action required', 'blue')}${tag('Customer support requests', 'yellow')}<span class="zl-tag-more">+1</span></span>`, tag('AI · Needs reply', 'accent'))}` };

P.Status = { group: 'Data display', height: 120, html: `
${row(status('todo', 'Not started'), status('progress', 'In progress'), status('done', 'Done'), status('canceled', 'Canceled'))}
<p class="zl-field-hint" style="margin:0">A status property always pairs its glyph with the word. Not started is the default.</p>` };

P.ThreadRow = { group: 'Data display', height: 330, width: 980, html: `
<div style="background:var(--bg)">${list}
<ul class="zl-list" style="margin-top:12px">${threadRow({ from: 'Priya Raman', subject: 'Checked and selected', tags: tag('Signed', 'green'), time: 'Apr 2', state: 'is-checked', selected: true })}${threadRow({ from: 'Ops Weekly', subject: 'Keyboard focus', time: 'Apr 1', state: 'is-focus' })}</ul></div>` };

P.GroupHeading = { group: 'Data display', height: 200, width: 900, html: `
<ul class="zl-list">
  <li class="zl-group">Last 7 days</li>
  ${threadRow({ from: 'Mina Okafor', subject: 'Offsite venue shortlist', time: 'Apr 2' })}
  <li class="zl-group is-hover"><span class="zl-monogram">NW</span>northwind.io<span class="zl-group-actions"><button class="zl-btn zl-btn--text">Collapse</button><button class="zl-btn zl-btn--text">${ic('filter')}Remove</button></span></li>
  ${threadRow({ from: 'Jonas Beck', subject: 'Can we move Thursday?', time: 'Mar 22', unread: true })}
</ul>` };

P.EmptyState = { group: 'Data display', height: 200, html: `
<div class="zl-empty">${ic('filter')}<span>No filter results</span></div>
<div class="zl-empty" style="padding-top:0"><strong>Nothing needs you right now</strong><span>New threads that need a reply will land here.</span></div>` };

// ============ Navigation ============
P.Sidebar = { group: 'Navigation', height: 620, width: 260, html: `<div style="height:600px;display:flex">${sidebar('Needs you')}</div>` };

P.ViewHeader = { group: 'Navigation', height: 140, width: 900, html: `
${viewbar()}
<div style="position:relative;height:60px"><span class="zl-tooltip" style="position:absolute;right:92px;top:0">Filter<small>Ctrl F</small></span></div>` };

P.Tabs = { group: 'Navigation', height: 90, html: `
<div style="width:280px"><div class="zl-tabs" role="tablist"><button class="zl-tab" role="tab" aria-selected="false">Emojis</button><button class="zl-tab" role="tab" aria-selected="true">Icons</button><button class="zl-tab is-focus" role="tab" aria-selected="false">Upload</button></div></div>` };

// ============ Overlays ============
const filterMenu = `
<div class="zl-menu" role="dialog" aria-label="Filter">
  <input class="zl-input zl-menu-search is-focus" placeholder="Filter by…" aria-label="Filter by">
  <div class="zl-menu-label">Applied</div>
  <button class="zl-menu-item">${ic('inbox')}Mailbox<span class="zl-menu-item-hint">does not contain “Spam, Trash”</span></button>
  <button class="zl-menu-item">${ic('at')}From<span class="zl-menu-item-hint">contains “priya@…”${ic('chevRight')}</span></button>
  <button class="zl-menu-item">${ic('tag')}Promotions<span class="zl-menu-item-muted">(Gmail)</span><span class="zl-menu-item-hint">is not${ic('chevRight')}</span></button>
  <div class="zl-menu-sep"></div>
  <button class="zl-menu-item">${ic('unread')}Unread</button>
  <button class="zl-menu-item is-hover">${ic('read')}Read</button>
  <button class="zl-menu-item">${ic('clip')}Attachment</button>
  <button class="zl-menu-item">${ic('cal')}Calendar event</button>
  <button class="zl-menu-item">${ic('tag')}Label</button>
  <button class="zl-menu-item">${ic('person')}To</button>
  <button class="zl-menu-item">${ic('text')}Subject</button>
  <button class="zl-menu-item">${ic('cal')}Date</button>
</div>`;
const groupMenu = `
<div class="zl-menu" role="dialog" aria-label="Group by">
  <div class="zl-menu-title">Group by</div>
  <input class="zl-input zl-menu-search" placeholder="Search grouping options…" aria-label="Search grouping options">
  <button class="zl-menu-item zl-menu-item--2line is-hover">${ic('cal')}<span class="zl-menu-item-text">Date<small>Group by date</small></span>${ic('check', 'zl-menu-item-check')}</button>
  <button class="zl-menu-item zl-menu-item--2line">${ic('star')}<span class="zl-menu-item-text">Starred<small>Group by starred emails</small></span></button>
  <button class="zl-menu-item zl-menu-item--2line">${ic('important')}<span class="zl-menu-item-text">Important<small>Group by Gmail’s Important label</small></span></button>
  <button class="zl-menu-item zl-menu-item--2line">${ic('at')}<span class="zl-menu-item-text">Email or domain<small>Group by people and companies</small></span><span class="zl-menu-item-hint">${ic('chevRight')}</span></button>
  <button class="zl-menu-item zl-menu-item--2line">${ic('status')}<span class="zl-menu-item-text">Priority<small>Group by the Priority property</small></span><span class="zl-menu-item-hint">${ic('chevRight')}</span></button>
  <button class="zl-menu-item zl-menu-item--2line">${ic('unread')}<span class="zl-menu-item-text">Unread<small>Split into unread and read</small></span></button>
</div>`;
const newViewMenu = `
<div class="zl-menu" style="width:240px" role="menu" aria-label="New view">
  <div class="zl-menu-label">New view</div>
  <button class="zl-menu-item" role="menuitem">${ic('wand')}Create from an auto label</button>
  <button class="zl-menu-item is-hover" role="menuitem">${ic('filter')}Configure manually</button>
  <button class="zl-menu-item" role="menuitem">${ic('group')}Use template</button>
  <div class="zl-menu-label">Suggested views</div>
  <button class="zl-menu-item" role="menuitem">${ic('user')}<span>From <span style="color:var(--text-subtle)">is</span> Ops Weekly</span></button>
  <button class="zl-menu-item" role="menuitem">${ic('at')}<span>Domain <span style="color:var(--text-subtle)">is</span> northwind.io</span></button>
</div>`;
P.Menu = { group: 'Overlays', height: 480, width: 1000, html: `<div style="display:flex;gap:24px;align-items:flex-start">${filterMenu}${groupMenu}${newViewMenu}</div>` };

P.FilterEditor = { group: 'Overlays', height: 260, html: `
<div class="zl-menu" role="dialog" aria-label="From contains">
  <div class="zl-menu-title">${btnI('back', 'Back', 'zl-btn--sm')}<span>From <span style="color:var(--text-subtle);font-weight:400">contains</span></span>${ic('chevDown')}${btnI('trash', 'Delete filter', 'zl-btn--sm')}</div>
  <input class="zl-input zl-menu-search is-focus" placeholder="Add new entry" aria-label="Add new entry">
  <button class="zl-menu-item"><span class="zl-monogram">P</span>priya@raman.co${ic('check', 'zl-menu-item-check')}</button>
  <button class="zl-menu-item zl-menu-item--2line"><span class="zl-monogram">O</span><span class="zl-menu-item-text">Ops Weekly<small>ops@northwind.io</small></span>${ic('check', 'zl-menu-item-check')}</button>
  <div class="zl-menu-footer"><button class="zl-btn zl-btn--text">Reset</button><span class="zl-split"><button class="zl-btn zl-btn--primary">Save</button><button class="zl-btn zl-btn--primary" aria-label="More save options">${ic('chevDown')}</button></span></div>
</div>` };

P.Tooltip = { group: 'Overlays', height: 90, html: `${row(`<span class="zl-tooltip" role="tooltip">Filter<small>Ctrl F</small></span>`, `<span class="zl-tooltip" role="tooltip">Edit view<small>Ctrl E</small></span>`, `<span class="zl-tooltip" role="tooltip">Compose a new email</span>`)}` };

P.Toast = { group: 'Overlays', height: 110, html: `${row(`<div class="zl-toast" role="status"><span class="zl-spinner" aria-hidden="true"></span>Message sending</div>`, `<div class="zl-toast" role="status">Archived 3 threads<button>Undo</button></div>`)}` };

P.SettingsModal = { group: 'Overlays', height: 520, width: 1000, html: `
<div class="zl-scrim" style="padding:24px">
<div class="zl-modal" role="dialog" aria-modal="true" aria-labelledby="set-h">
  <nav class="zl-modal-nav" aria-label="Settings">
    <span class="zl-section-label">Account</span>
    <a class="zl-nav-item" href="#" aria-current="page">${ic('inbox')}<span>Inbox</span></a>
    <a class="zl-nav-item" href="#">${ic('wand')}<span>AI</span></a>
    <a class="zl-nav-item" href="#">${ic('filter')}<span>Gmail filters</span></a>
    <a class="zl-nav-item" href="#">${ic('brackets')}<span>Snippets</span></a>
    <a class="zl-nav-item" href="#">${ic('pen')}<span>Signature</span></a>
    <a class="zl-nav-item" href="#">${ic('person')}<span>Manage account</span></a>
    <span class="zl-section-label">Workspace</span>
    <a class="zl-nav-item" href="#">${ic('user')}<span>Members</span>${ic('external')}</a>
    <a class="zl-nav-item" href="#">${ic('map')}<span>Plans</span>${ic('external')}</a>
  </nav>
  <div class="zl-modal-main">
    <h2 id="set-h">Inbox</h2>
    <div class="zl-setting"><span class="zl-setting-text"><strong>Theme mode</strong><small>Choose how ZeroLatency looks on this device</small></span><button class="zl-select-trigger">System${ic('chevDown')}</button></div>
    <div class="zl-setting"><span class="zl-setting-text"><strong>Thread style</strong><small>Change how open threads are displayed</small></span><button class="zl-select-trigger">Side peek${ic('chevDown')}</button></div>
    <div class="zl-setting"><span class="zl-setting-text"><strong>Auto-advance</strong><small>Where to go after archiving or deleting a thread</small></span><button class="zl-select-trigger">Go to next thread${ic('chevDown')}</button></div>
    <div class="zl-setting"><span class="zl-setting-text"><strong>Font size</strong><small>Choose the size of the font in the inbox</small></span><button class="zl-select-trigger">Large${ic('chevDown')}</button></div>
    <div class="zl-setting"><span class="zl-setting-text"><strong>Edit signature in Gmail</strong><small>Create or edit a custom signature.</small></span><button class="zl-btn zl-btn--secondary">Open</button></div>
  </div>
</div></div>` };

P.HoverPreview = { group: 'Overlays', height: 260, html: `
<div class="zl-preview-card" role="tooltip"><p><strong>Priya Raman</strong> · Term sheet redlines</p><p>Hi Alex,</p><p>Two open points on the option pool before we can sign. I’ve marked both in the doc and suggested wording for the vesting clause.</p><p>Could you look before Thursday’s call? Happy to walk through it live.</p><p style="color:var(--text-subtle)">— Priya</p></div>` };

// ============ Panels ============
P.ThreadView = { group: 'Panels', height: 480, width: 760, html: `
<section class="zl-peek" style="height:460px" aria-label="Open thread">
  <div class="zl-peek-bar">${btnI('expand', 'Close peek')}${btnI('chevUp', 'Previous thread')}${btnI('chevDown', 'Next thread')}<button class="zl-btn zl-btn--secondary">${ic('wand')}Auto label similar</button>${btnI('clock', 'Remind me')}${btnI('unread', 'Mark as unread')}${btnI('tag', 'Label')}${btnI('archive', 'Archive')}${btnI('trash', 'Trash')}${btnI('more', 'More')}</div>
  <div class="zl-peek-body">
    <h2 class="zl-thread-title">Term sheet redlines</h2>
    <div class="zl-thread-props">${tag('Action required', 'blue')}${tag('Finance', 'yellow')}${status('progress', 'In progress')}<button class="zl-btn zl-btn--text">Add text</button></div>
    <div class="zl-message-head"><strong>Priya Raman</strong><time>Mar 22</time><small>To alex@northwind.io</small></div>
    <div class="zl-message-body"><p>Hi Alex,</p><p>Two open points on the option pool before we can sign. I’ve marked both in the doc and suggested wording for the vesting clause.</p><p>Could you look before Thursday’s call?</p></div>
  </div>
</section>` };

P.Composer = { group: 'Panels', height: 440, width: 640, html: `
<div class="zl-composer" role="dialog" aria-label="New message">
  <div class="zl-composer-head"><span>Alex Morgan<small>alex@northwind.io</small></span>${btnI('chevDown', 'Minimize', 'zl-btn--sm')}${btnI('x', 'Close', 'zl-btn--sm')}</div>
  <div class="zl-composer-line"><span class="zl-recipient">priya@raman.co<button aria-label="Remove priya@raman.co">${ic('x')}</button></span><input aria-label="Add recipient" placeholder=""><button class="zl-btn zl-btn--text zl-btn--sm">Cc/Bcc</button></div>
  <div class="zl-composer-line"><input aria-label="Subject" value="Re: Term sheet redlines"></div>
  <div class="zl-composer-body" contenteditable="true" aria-label="Message body">Thanks Priya — Thursday works. I’ll go through both points tonight.</div>
  <div class="zl-composer-foot"><span class="zl-split"><button class="zl-btn zl-btn--primary">Send</button><button class="zl-btn zl-btn--primary" aria-label="Schedule send">${ic('chevDown')}</button></span><small>Draft saved</small>${btnI('trash', 'Discard draft')}</div>
</div>` };

const typeRow = (icon, name, desc, hover = false) => `<button class="zl-panel-row zl-panel-row--prop${hover ? ' is-hover' : ''}"><span class="zl-type-tile">${ic(icon)}</span><span class="zl-panel-row-text">${name}<small>${desc}</small></span>${hover ? `<span class="zl-panel-row-end">${ic('plus')}</span>` : ''}</button>`;
const propRow = (icon, name, shown = true) => `<div class="zl-panel-row zl-panel-row--prop"><span class="zl-drag">${ic('drag')}</span>${ic(icon)}<span class="zl-panel-row-text">${name}</span><span class="zl-panel-row-end">${ic(shown ? 'eye' : 'eyeOff')}${ic('chevRight')}</span></div>`;
P.SidePanel = { group: 'Panels', height: 560, width: 1260, html: `
<div style="display:flex;gap:24px;align-items:stretch;height:540px">
<aside class="zl-panel" aria-label="Edit view">
  <div class="zl-panel-head"><h3>Edit view</h3>${btnI('expand', 'Close panel')}</div>
  <div class="zl-panel-name"><span class="zl-icon-tile">${gl('alert', 'orange')}</span><input class="zl-input zl-input--lg" value="Needs you" aria-label="View name"></div>
  <div class="zl-panel-label">General</div>
  <button class="zl-panel-row is-hover">${ic('group')}<span class="zl-panel-row-text">Properties<small>From, Subject, Label, Date, Files</small></span><span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <button class="zl-panel-row">${ic('filter', 'zl-ink-blue')}<span class="zl-panel-row-text">Filter<small>4 filters</small></span><span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <button class="zl-panel-row">${ic('unread')}<span class="zl-panel-row-text">Hover actions<small>Archive, Trash, Read/unread, Remind, Any label</small></span><span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <div class="zl-panel-foot"><button class="zl-btn zl-btn--danger">${ic('trash')}Delete view</button></div>
</aside>
<aside class="zl-panel" aria-label="Properties">
  <div class="zl-panel-head">${btnI('back', 'Back')}<h3>Properties</h3>${btnI('expand', 'Close panel')}</div>
  <div class="zl-panel-label">Shown in view</div>
  ${propRow('status', 'Status')}${propRow('text', 'Subject')}${propRow('tag', 'Label')}
  <div class="zl-panel-label">Hidden in view</div>
  ${propRow('person', 'From', false)}${propRow('clip', 'Files', false)}
  <button class="zl-btn zl-btn--secondary zl-btn--block" style="margin-top:12px">Add property</button>
</aside>
<aside class="zl-panel" aria-label="Add property">
  <div class="zl-panel-head">${btnI('back', 'Back')}<h3>Add property</h3>${btnI('x', 'Close')}</div>
  <input class="zl-input zl-input--lg is-focus" placeholder="Add new property" aria-label="Property name" style="margin-bottom:12px">
  ${typeRow('text', 'Text', 'For summaries and notes')}${typeRow('hash', 'Number', 'For quantities and amounts')}${typeRow('select', 'Select', 'Choose one option')}${typeRow('tag', 'Multi-select', 'Choose one or more options')}${typeRow('status', 'Status', 'For tracking progress', true)}${typeRow('cal', 'Date', 'Accepts a date')}${typeRow('person', 'Person', 'Tag anyone in your workspace')}
</aside>
</div>` };

P.PropertyEditor = { group: 'Panels', height: 360, width: 860, html: `
<div style="display:flex;gap:24px;align-items:flex-start">
<div class="zl-menu" style="width:300px" role="dialog" aria-label="Status">
  <div class="zl-menu-title">${status('todo', 'Not started')}</div>
  <div class="zl-menu-label">Select an option</div>
  <button class="zl-menu-item">${status('todo', 'Not started')}<span class="zl-menu-item-hint zl-caps">Default</span></button>
  <button class="zl-menu-item">${status('canceled', 'Canceled')}</button>
  <button class="zl-menu-item is-hover">${status('done', 'Done')}</button>
  <button class="zl-menu-item">${status('progress', 'In progress')}</button>
  <div class="zl-menu-sep"></div>
  <button class="zl-menu-item">${ic('sliders')}Edit property</button>
</div>
<aside class="zl-panel" style="height:340px" aria-label="Edit property">
  <div class="zl-panel-head">${btnI('back', 'Back')}<h3>Edit property</h3>${btnI('x', 'Close')}</div>
  <input class="zl-input zl-input--lg" value="Status" aria-label="Property name">
  <div class="zl-panel-label" style="margin-top:8px">Options${btnI('plus', 'Add option', 'zl-btn--sm')}</div>
  <button class="zl-panel-row zl-panel-row--prop">${status('canceled', 'Canceled')}<span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <button class="zl-panel-row zl-panel-row--prop">${status('done', 'Done')}<span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <button class="zl-panel-row zl-panel-row--prop">${status('progress', 'In progress')}<span class="zl-panel-row-end">${ic('chevRight')}</span></button>
  <button class="zl-panel-row zl-panel-row--prop">${status('todo', 'Not started')}<span class="zl-panel-row-end"><span class="zl-caps">Default</span>${ic('chevRight')}</span></button>
  <div class="zl-menu-sep" style="margin:8px 0"></div>
  <button class="zl-panel-row zl-panel-row--prop">${ic('eyeOff')}<span class="zl-panel-row-text">Hide property from Needs you</span></button>
  <button class="zl-panel-row zl-panel-row--prop">${ic('trash')}<span class="zl-panel-row-text">Delete property from Needs you</span></button>
</aside></div>` };

// ============ Onboarding & gallery ============
const opt = (label, glyph, ink, on) => `<button class="zl-option" aria-pressed="${on}">${gl(glyph, ink)}${label}${on ? '<span class="zl-tag zl-tag--accent">Included</span>' : '<span class="zl-tag">Excluded</span>'}</button>`;
P.OptionList = { group: 'Onboarding', height: 330, html: `
<div style="max-width:320px">
  <h2 style="margin:0 0 4px;font-size:var(--text-md);font-weight:600">Let’s start fresh. What would you like in your primary inbox?</h2>
  <p class="zl-field-hint" style="margin:0 0 16px">Excluded mail is kept out of your inbox. You can still find it in its own views.</p>
  <div class="zl-options">${opt('Calendar', 'cal', 'orange', true)}${opt('Notifications', 'bell', 'purple', true)}${opt('Mailing lists', 'list', 'pink', true)}${opt('Social', 'chat', 'blue', false)}${opt('Promotions', 'basket', 'green', false)}</div>
  <button class="zl-btn zl-btn--primary zl-btn--block" style="margin-top:20px">Continue</button>
</div>` };

const tpl = (glyph, ink, title, desc, chips, tint) => `<button class="zl-template"><span class="zl-template-art" style="background:var(--tag-${tint}-bg)"><span style="display:flex">${gl(glyph, ink)}</span>${chips}<span class="zl-bar"></span></span><span class="zl-template-meta">${gl(glyph, ink)}<strong>${title}</strong><small>${desc}</small></span></button>`;
P.TemplateCard = { group: 'Onboarding', height: 470, width: 760, html: `
<div class="zl-templates">
  ${tpl('bolt2', 'green', 'Sales', 'Prioritise sales-related email', `<span>${tag('Northwind')}</span>`, 'green')}
  ${tpl('chat', 'pink', 'Support', 'Manage customer feedback', `<span>${tag('Pending', 'orange')}</span><span>${tag('Resolved', 'purple')}</span>`, 'pink')}
  ${tpl('cal', 'orange', 'Calendar', 'All your events and meetings', '<span class="zl-bar"></span>', 'orange')}
  ${tpl('list', 'red', 'Priority', 'Organise email by priority', `<span>${tag('Important', 'orange')}</span><span>${tag('To-do', 'purple')}</span>`, 'red')}
  ${tpl('layers', 'purple', 'Categories', 'Group email by Gmail category', `<span>${tag('Promotions', 'orange')}</span><span>${tag('Social', 'purple')}</span>`, 'purple')}
  ${tpl('plane', 'blue', 'Travel', 'Bookings and itineraries', `<span>${tag('Flights', 'blue')}</span>`, 'blue')}
</div>` };

// ============ App composition ============
const appShell = `
<div class="zl-app" style="height:100%">
  ${sidebar('Needs you', true)}
  <main class="zl-app-main">${viewbar()}${list}</main>
</div>`;
P.AppShell = { group: 'App', height: 560, width: 1200, html: `<div style="height:540px;box-shadow:var(--shadow-sm);border-radius:12px;overflow:hidden">${appShell}</div>` };

P.Card = { group: 'Layout', height: 230, width: 900, html: `
<div class="zl-features">
  <article class="zl-card"><span class="zl-card-icon">${gl('bolt', 'yellow')}</span><h3>Auto labels</h3><p>Describe a label in plain words; new mail is sorted as it lands.</p></article>
  <article class="zl-card zl-card--interactive" tabindex="0"><span class="zl-card-icon">${gl('layers', 'purple')}</span><h3>Views you define</h3><p>Filter, group and choose properties. Every view is a saved question.</p></article>
  <article class="zl-card"><span class="zl-card-icon">${gl('cal', 'orange')}</span><h3>Scheduling built in</h3><p>Offer times from your calendar without leaving the reply.</p></article>
</div>` };

// ============ Marketing patterns ============
P.NavBar = { group: 'Patterns', height: 72, width: 1180, html: `
<header class="zl-nav">${brand}<ul class="zl-nav-links"><li><a href="#" aria-current="page">Product</a></li><li><a href="#">Views</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul><div class="zl-nav-cta"><a class="zl-btn zl-btn--ghost" href="#">Log in</a><a class="zl-btn zl-btn--primary" href="#">Get ZeroLatency free</a></div></header>` };

P.Hero = { group: 'Patterns', height: 820, width: 1280, html: `
<section class="zl-hero">
  <h1 class="zl-hero-title">An inbox that sorts itself before you look.</h1>
  <p class="zl-lead">Views you define, labels that write themselves and replies drafted in your voice. Works on top of Gmail.</p>
  <div class="zl-hero-ctas"><a class="zl-btn zl-btn--primary zl-btn--xl" href="#">Get ZeroLatency free</a><a class="zl-btn zl-btn--ghost zl-btn--xl" href="#">See how it works</a></div>
  <p class="zl-hero-note">Free for one account. No credit card.</p>
  <div class="zl-hero-visual">${appShell}</div>
</section>` };

P.FeatureGrid = { group: 'Patterns', height: 520, width: 1200, html: `
<section class="zl-section zl-section--tint"><div class="zl-container">
<div class="zl-section-head"><p class="zl-eyebrow">Built around views</p><h2 class="zl-h2">Your priorities, not folders.</h2><p class="zl-lead">Each view is a filter, a grouping and the properties you care about. Make as many as you need.</p></div>
<div class="zl-features">
  <article class="zl-card"><span class="zl-card-icon">${gl('bolt', 'yellow')}</span><h3>Auto labels</h3><p>Describe a label in plain words; new mail is sorted as it lands.</p></article>
  <article class="zl-card"><span class="zl-card-icon">${gl('layers', 'purple')}</span><h3>Group by anything</h3><p>Date, sender, domain, priority or a property you added.</p></article>
  <article class="zl-card"><span class="zl-card-icon">${gl('cal', 'orange')}</span><h3>Scheduling built in</h3><p>Offer times from your calendar without leaving the reply.</p></article>
  <article class="zl-card"><span class="zl-card-icon">${gl('alert', 'red')}</span><h3>Keyboard first</h3><p>Every action has a shortcut; the command palette finds the rest.</p></article>
</div></div></section>` };

P.ScreenshotFrame = { group: 'Patterns', height: 600, width: 1240, html: `<div style="padding:24px;background:var(--bg-sidebar)"><div class="zl-frame" style="height:540px" role="img" aria-label="ZeroLatency app: the Needs you view with five threads"><div class="zl-frame-bar"><i></i><i></i><i></i></div>${appShell}</div></div>` };

P.Testimonial = { group: 'Patterns', height: 300, width: 1100, html: `
<section class="zl-section" style="padding:40px 24px"><div class="zl-container"><div class="zl-quotes">
  <figure class="zl-quote zl-card"><blockquote>“I made four views on day one and haven’t opened the plain inbox since.”</blockquote><figcaption><span class="zl-avatar">PL</span><span><span class="zl-quote-name">Placeholder name</span><br><span class="zl-quote-role">Founder, placeholder company</span></span></figcaption></figure>
  <figure class="zl-quote zl-card"><blockquote>“Auto labels caught every invoice the first week. That alone paid for it.”</blockquote><figcaption><span class="zl-avatar">PL</span><span><span class="zl-quote-name">Placeholder name</span><br><span class="zl-quote-role">Operations lead, placeholder</span></span></figcaption></figure>
</div></div></section>` };

const feat = (t) => `<li>${ic('check')}<span>${t}</span></li>`;
P.Pricing = { group: 'Patterns', height: 560, width: 1180, html: `
<section class="zl-section"><div class="zl-container"><div class="zl-pricing">
  <article class="zl-card zl-plan"><div class="zl-plan-name">Free</div><div class="zl-plan-price"><strong>$0</strong></div><p class="zl-plan-desc">One account and the views you need.</p><ul>${feat('Unlimited views')}${feat('20 auto-label runs a month')}${feat('Snippets and signatures')}</ul><a class="zl-btn zl-btn--secondary zl-btn--lg zl-btn--block" href="#">Get started</a></article>
  <article class="zl-card zl-plan zl-plan--featured"><div class="zl-plan-name">Pro ${tag('Popular', 'blue')}</div><div class="zl-plan-price"><strong>$12</strong><span>per month</span></div><p class="zl-plan-desc">For people who live in email.</p><ul>${feat('Everything in Free')}${feat('Unlimited auto labels and drafts')}${feat('Scheduling links')}${feat('Priority support')}</ul><a class="zl-btn zl-btn--primary zl-btn--lg zl-btn--block" href="#">Start 14-day trial</a></article>
  <article class="zl-card zl-plan"><div class="zl-plan-name">Team</div><div class="zl-plan-price"><strong>$20</strong><span>per user / month</span></div><p class="zl-plan-desc">Shared views and admin controls.</p><ul>${feat('Everything in Pro')}${feat('Shared views and labels')}${feat('SSO and audit log')}</ul><a class="zl-btn zl-btn--secondary zl-btn--lg zl-btn--block" href="#">Contact sales</a></article>
</div><p class="zl-hero-note" style="text-align:center">Prices are placeholders.</p></div></section>` };

const qa = (q, a, open = false) => `<details${open ? ' open' : ''}><summary>${q}</summary><p class="zl-faq-a">${a}</p></details>`;
P.FAQ = { group: 'Patterns', height: 400, width: 1000, html: `
<section class="zl-section" style="padding:40px 24px"><div class="zl-faq">
${qa('Which email providers work?', 'Gmail and Google Workspace today. Outlook is planned.', true)}
${qa('Do I have to move my email?', 'No. ZeroLatency works on top of your existing account; nothing is migrated.')}
${qa('Is my mail used to train models?', 'No. Your mail is processed only to act for you.')}
</div></section>` };

P.CTABand = { group: 'Patterns', height: 340, width: 1180, html: `
<section class="zl-section" style="padding:32px 24px"><div class="zl-container">
<div class="zl-cta"><div><h2>Make your first view in a minute.</h2><p>Connect Gmail, pick what belongs in your inbox and let auto labels do the rest.</p></div>
<form class="zl-cta-form" onsubmit="return false"><label class="zl-visually-hidden" for="cta-email">Work email</label><input id="cta-email" class="zl-input" type="email" placeholder="you@company.com"><button class="zl-btn zl-btn--primary zl-btn--xl">Get started</button><span class="zl-cta-note">Free for one account. Leave anytime.</span></form></div>
</div></section>` };

P.Footer = { group: 'Patterns', height: 330, width: 1180, html: `
<footer class="zl-footer"><div class="zl-footer-grid">
  <div>${brand}<p style="margin:12px 0 0;color:var(--text-subtle);max-width:28ch">An inbox that sorts itself before you look.</p></div>
  <div><h4>Product</h4><ul><li><a href="#">Views</a></li><li><a href="#">Auto labels</a></li><li><a href="#">Pricing</a></li></ul></div>
  <div><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Changelog</a></li><li><a href="#">Careers</a></li></ul></div>
  <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="#">Security</a></li></ul></div>
</div><div class="zl-footer-base"><span>© 2026 ZeroLatency</span><span>Made for people who live in email</span></div></footer>` };

// ============ Cover (follows the Design System type's cover brief: blocks + one pattern + the name) ============
P.Cover = { cover: true, raw: `<!-- @dsCard height=288 -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ZeroLatency DS</title>
<style>
  html, body { margin:0; height:100%; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-sans); overflow:hidden; }
  .cover { position:relative; height:288px; overflow:hidden; }
  .art { position:absolute; top:0; left:480px; width:480px; height:288px; overflow:hidden; }
  .art svg { display:block; width:480px; height:288px; }
  .brand { fill:var(--accent); }
  .ink { fill:var(--surface-tooltip); }
  .side { fill:var(--bg-sidebar); }
  .t-blue { fill:var(--tag-blue-bg); } .t-yellow { fill:var(--tag-yellow-bg); } .t-green { fill:var(--tag-green-bg); }
  .blk { rx:var(--radius-2xl); }
  .chip { rx:var(--radius-sm); }
  .dot { fill:var(--accent-fg); }
  .words { position:absolute; left:var(--space-8); bottom:var(--space-8); max-width:440px; }
  .name { margin:0; font-size:72px; line-height:.95; font-weight:700; letter-spacing:-.035em; color:var(--text); }
  .tag { margin:var(--space-3) 0 0 2px; font-size:14px; line-height:20px; color:var(--text-muted); }
</style>
</head>
<body>
<div class="cover">
<div class="art" aria-hidden="true">
<svg viewBox="0 0 480 288" width="480" height="288">
<!--
  blocks      bg-sidebar slab 200x304 bled off the top (the app's warm canvas) · accent slab 120x200 (the one action hue) · surface-tooltip ink 152x152 bleeding off the right edge — about 35% of 960x288
  arrangement one tall canvas slab with two satellites stepping down to the right, space-4 gutters, bottoms space-6 above the edge
  pattern     geometric/modular row: label-chip tiles (chip-height 20, radius-sm) in tag-blue-bg, tag-yellow-bg and tag-green-bg stacked on the canvas slab like a thread list, one merged two-wide; chosen because tinted chips on a quiet canvas are what this system is
  scales      sides in space-4/space-8 multiples, chip rows every space-8, blocks radius-2xl, chips radius-sm, unread dot size-unread-dot
-->
<rect class="side blk" x="16" y="-16" width="200" height="280" rx="12"/>
<rect class="brand blk" x="232" y="64" width="120" height="200" rx="12"/>
<rect class="ink blk" x="368" y="112" width="152" height="152" rx="12"/>
<rect class="t-blue chip" x="40" y="40" width="96" height="20" rx="4"/><rect class="t-yellow chip" x="144" y="40" width="48" height="20" rx="4"/>
<rect class="t-green chip" x="40" y="72" width="64" height="20" rx="4"/>
<rect class="t-blue chip" x="40" y="104" width="152" height="20" rx="4"/>
<rect class="t-yellow chip" x="40" y="136" width="80" height="20" rx="4"/><rect class="t-green chip" x="128" y="136" width="64" height="20" rx="4"/>
<rect class="t-blue chip" x="40" y="168" width="112" height="20" rx="4"/>
<rect class="t-yellow chip" x="40" y="200" width="56" height="20" rx="4"/>
<circle class="dot" cx="260" cy="92" r="6"/>
</svg>
</div>
<div class="words">
<h1 class="name">ZeroLatency<br>DS</h1>
<p class="tag">Quiet canvas, one blue for action, soft inks for labels.</p>
</div>
</div>
</body>
</html>
` };

export const PREVIEWS = P;

for (const [name, p] of Object.entries(P)) {
  if (p.raw) { mkdirSync(join(outDir, name), { recursive: true }); writeFileSync(join(outDir, name, 'preview.html'), p.raw); continue; }
  const marker = `<!-- @dsCard group="${p.group}" height=${p.height}${p.width ? ` width=${p.width}` : ''} -->`;
  const pad = p.group === 'Patterns' || p.cover || ['Sidebar', 'AppShell', 'SettingsModal'].includes(name) ? '0' : '24px';
  const html = `${marker}
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${name} — ZeroLatency DS</title>
<style>html,body{margin:0}body{background:var(--bg);color:var(--text)}</style></head>
<body class="zl" style="padding:${pad}">
${p.html.trim()}
</body>
</html>
`;
  mkdirSync(join(outDir, name), { recursive: true });
  writeFileSync(join(outDir, name, 'preview.html'), html);
}
console.log('wrote', Object.keys(P).length, 'previews to', outDir);
