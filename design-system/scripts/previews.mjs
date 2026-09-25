// Writes one preview.html per component/pattern (static HTML using components.css classes).
// Usage: node previews.mjs <outDir>   → <outDir>/<Name>/preview.html
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
if (!outDir) throw new Error('usage: node previews.mjs <outDir>');

// Original line icons (24 grid, 1.75 stroke, currentColor)
const I = {
  archive: '<path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M3 4h18v3H3zM10 11h4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  errorCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5M12 16v.01"/>',
  // brand-derived glyph: the ring-with-tail from the mark, used for "agent did this"
  agent: '<path d="M11 6.5A5.5 5.5 0 1 0 16.5 12"/><path d="M11 6.5h8"/>',
  pen: '<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  sliders: '<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>',
  keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  more: '<path d="M6 12h.01M12 12h.01M18 12h.01"/>',
};
const ic = (n, extra = '') => `<svg class="zl-icon" viewBox="0 0 24 24" aria-hidden="true"${extra}>${I[n]}</svg>`;
const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/><path d="M13.5 9.5A7 7 0 1 0 20.5 16.5M13.5 9.5H24.5" fill="none" stroke="var(--accent-fg)" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const brand = `<a class="zl-brand" href="#" aria-label="ZeroLatency home">${MARK}<span>ZeroLatency</span></a>`;
const cap = (t) => `<p class="zl-label-txt" style="margin:0 0 8px">${t}</p>`;
const row = (...items) => `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px">${items.join('')}</div>`;

const inboxRow = ({ from, count, subject, snippet, chip = '', time, state = '', selected = false, extra = '' }) => `
<li class="zl-row ${state}" tabindex="0" role="option" aria-selected="${selected}"${extra}>
  <span class="zl-row-dot" aria-hidden="true"></span>
  <span class="zl-row-from">${from}${count ? `<span class="zl-row-count">${count}</span>` : ''}</span>
  <span class="zl-row-subject">${subject}${snippet ? ` <span class="zl-row-snippet">· ${snippet}</span>` : ''}</span>
  <span class="zl-row-meta">${chip}</span>
  <span class="zl-row-time">${time}</span>
  <span class="zl-row-actions"><button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--sm" aria-label="Archive">${ic('archive')}</button><button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--sm" aria-label="Snooze">${ic('clock')}</button></span>
</li>`;
const ai = (t) => `<span class="zl-badge zl-badge--ai">${ic('agent')}${t}</span>`;

const frameMock = `
<div class="zl-frame" role="img" aria-label="ZeroLatency app mockup: the Needs you view with four threads and the agent activity panel">
  <div class="zl-frame-bar">${MARK}<span>ZeroLatency — Needs you</span><span class="zl-kbd">⌘K</span></div>
  <div class="zl-frame-body">
    <nav class="zl-frame-side" aria-label="Views">
      <div class="zl-input-wrap" style="margin:0 4px 8px">${ic('search')}<input class="zl-input" style="height:30px" placeholder="Search" aria-label="Search"></div>
      <h5>Views</h5>
      <div class="zl-view" aria-current="true"><i></i>Needs you<b>4</b></div>
      <div class="zl-view"><i></i>Drafted for you<b>12</b></div>
      <div class="zl-view"><i></i>Waiting on others<b>7</b></div>
      <div class="zl-view"><i></i>Scheduled<b>3</b></div>
      <div class="zl-view"><i></i>FYI<b>38</b></div>
      <h5>Handled today</h5>
      <div class="zl-view"><i></i>Archived<b>61</b></div>
      <div class="zl-view"><i></i>Sent by agent<b>9</b></div>
    </nav>
    <div class="zl-frame-main">
      <div class="zl-frame-head"><h4>Needs you</h4><span class="zl-badge">4 of 132 today</span></div>
      <ul class="zl-list" role="listbox" aria-label="Threads">
        ${inboxRow({ from: 'Priya Raman', subject: 'Term sheet redlines', snippet: 'Two open points on the option pool', chip: ai('Decision'), time: '9:41', state: 'zl-row--unread', selected: true })}
        ${inboxRow({ from: 'Ops Weekly', count: 3, subject: 'Vendor renewal due Friday', chip: ai('Approve'), time: '9:12', state: 'zl-row--unread' })}
        ${inboxRow({ from: 'Jonas Beck', subject: 'Can we move Thursday?', chip: ai('Draft ready'), time: '8:50', state: 'zl-row--unread' })}
        ${inboxRow({ from: 'Legal', subject: 'DPA signed copy', chip: '<span class="zl-badge zl-badge--success">Filed</span>', time: 'Mon' })}
      </ul>
    </div>
    <aside class="zl-frame-agent" aria-label="Agent activity">
      <h5>Agent activity</h5>
      <div class="zl-activity">${ic('archive')}<div>Archived 18 newsletters and receipts<time>09:02</time></div></div>
      <div class="zl-activity">${ic('cal')}<div>Offered 3 slots to Jonas Beck<time>08:51</time></div></div>
      <div class="zl-draft"><strong>Draft ready</strong><p>“Thursday works if we start at 2. I’ll send a new invite.”</p><button class="zl-btn zl-btn--primary zl-btn--sm">Review &amp; send</button></div>
    </aside>
  </div>
</div>`;

const P = {};
// ---------------- Components ----------------
P.Button = { group: 'Actions', height: 420, html: `
${cap('Variants · md')}
${row('<button class="zl-btn zl-btn--primary">Join waitlist</button>', '<button class="zl-btn zl-btn--secondary">See how it works</button>', '<button class="zl-btn zl-btn--ghost">Skip</button>', '<button class="zl-btn zl-btn--destructive">Delete rule</button>', '<button class="zl-btn zl-btn--link">Read the docs</button>')}
${cap('Sizes · sm / md / lg · icon-only')}
${row('<button class="zl-btn zl-btn--primary zl-btn--sm">Send</button>', '<button class="zl-btn zl-btn--primary">Send</button>', '<button class="zl-btn zl-btn--primary zl-btn--lg">Send</button>', `<button class="zl-btn zl-btn--secondary zl-btn--icon zl-btn--sm" aria-label="Archive">${ic('archive')}</button>`, `<button class="zl-btn zl-btn--secondary zl-btn--icon" aria-label="Snooze">${ic('clock')}</button>`, `<button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--lg" aria-label="More">${ic('more')}</button>`, `<button class="zl-btn zl-btn--primary">Continue ${ic('arrow')}</button>`)}
${cap('States (primary · secondary): default · hover · focus-visible · active · disabled · loading')}
${row('<button class="zl-btn zl-btn--primary">Default</button>', '<button class="zl-btn zl-btn--primary is-hover">Hover</button>', '<button class="zl-btn zl-btn--primary is-focus">Focus</button>', '<button class="zl-btn zl-btn--primary is-active">Active</button>', '<button class="zl-btn zl-btn--primary" disabled>Disabled</button>', '<button class="zl-btn zl-btn--primary" aria-busy="true"><span class="zl-spinner" aria-hidden="true"></span>Sending…</button>')}
${row('<button class="zl-btn zl-btn--secondary">Default</button>', '<button class="zl-btn zl-btn--secondary is-hover">Hover</button>', '<button class="zl-btn zl-btn--secondary is-focus">Focus</button>', '<button class="zl-btn zl-btn--secondary is-active">Active</button>', '<button class="zl-btn zl-btn--secondary" disabled>Disabled</button>', '<button class="zl-btn zl-btn--destructive is-hover">Destructive hover</button>', '<button class="zl-btn zl-btn--ghost is-hover">Ghost hover</button>')}` };

P.Input = { group: 'Forms', height: 300, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;max-width:760px">
<label class="zl-field"><span class="zl-field-label">Work email</span><input class="zl-input" type="email" placeholder="you@company.com"><span class="zl-field-hint">We’ll only use it for the waitlist.</span></label>
<label class="zl-field"><span class="zl-field-label">Hover</span><input class="zl-input is-hover" value="maya@northwind.co"></label>
<label class="zl-field"><span class="zl-field-label">Focus-visible</span><input class="zl-input is-focus" value="maya@north"></label>
<label class="zl-field"><span class="zl-field-label">Invalid</span><input class="zl-input" aria-invalid="true" aria-describedby="e1" value="maya@"><span class="zl-field-error" id="e1">${ic('errorCircle')}Enter a full email address.</span></label>
<label class="zl-field"><span class="zl-field-label">Disabled</span><input class="zl-input" disabled value="Connected via Google"></label>
<div class="zl-field"><span class="zl-field-label">Search (with icon + shortcut)</span><div class="zl-input-wrap">${ic('search')}<input class="zl-input" placeholder="Search mail" aria-label="Search mail"><span class="zl-kbd">/</span></div></div>
</div>` };

P.Select = { group: 'Forms', height: 200, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:760px">
<label class="zl-field"><span class="zl-field-label">When a thread is FYI</span><span class="zl-select"><select><option>Archive and summarize</option><option>Keep in inbox</option><option>Label only</option></select></span></label>
<label class="zl-field"><span class="zl-field-label">Hover</span><span class="zl-select is-hover"><select><option>Weekdays</option></select></span></label>
<label class="zl-field"><span class="zl-field-label">Focus-visible</span><span class="zl-select is-focus"><select><option>Every 15 minutes</option></select></span></label>
<label class="zl-field"><span class="zl-field-label">Invalid</span><span class="zl-select"><select aria-invalid="true"><option>Choose a calendar</option></select></span><span class="zl-field-error">${ic('errorCircle')}Pick a calendar for scheduling.</span></label>
<label class="zl-field"><span class="zl-field-label">Disabled</span><span class="zl-select"><select disabled><option>Team plan only</option></select></span></label>
</div>` };

P.Checkbox = { group: 'Forms', height: 170, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;max-width:760px">
<label class="zl-check"><input type="checkbox"><span class="zl-check-box"></span><span>Unchecked<span class="zl-check-desc">Default</span></span></label>
<label class="zl-check"><input type="checkbox" checked><span class="zl-check-box"></span><span>Draft replies for me<span class="zl-check-desc">Checked</span></span></label>
<label class="zl-check"><input type="checkbox" class="ind"><span class="zl-check-box"></span><span>All newsletters<span class="zl-check-desc">Indeterminate</span></span></label>
<label class="zl-check is-hover"><input type="checkbox"><span class="zl-check-box"></span><span>Hover</span></label>
<label class="zl-check is-focus"><input type="checkbox" checked><span class="zl-check-box"></span><span>Focus-visible</span></label>
<label class="zl-check is-active"><input type="checkbox"><span class="zl-check-box"></span><span>Active</span></label>
<label class="zl-check"><input type="checkbox" disabled><span class="zl-check-box"></span><span>Disabled</span></label>
<label class="zl-check"><input type="checkbox" disabled checked><span class="zl-check-box"></span><span>Disabled checked</span></label>
</div>
<script>document.querySelectorAll('input.ind').forEach(function(i){i.indeterminate=true});</script>` };

P.Toggle = { group: 'Forms', height: 150, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;max-width:760px">
<span class="zl-toggle-row"><button class="zl-toggle" role="switch" aria-checked="false" aria-label="Auto-archive"></button>Off</span>
<span class="zl-toggle-row"><button class="zl-toggle" role="switch" aria-checked="true" aria-label="Auto-draft"></button>On — auto-draft replies</span>
<span class="zl-toggle-row"><button class="zl-toggle is-hover" role="switch" aria-checked="true" aria-label="Hover"></button>Hover</span>
<span class="zl-toggle-row"><button class="zl-toggle is-focus" role="switch" aria-checked="false" aria-label="Focus"></button>Focus-visible</span>
<span class="zl-toggle-row"><button class="zl-toggle is-active" role="switch" aria-checked="false" aria-label="Active"></button>Active (pressed)</span>
<span class="zl-toggle-row"><button class="zl-toggle" role="switch" aria-checked="false" disabled aria-label="Disabled"></button><span style="color:var(--text-disabled)">Disabled</span></span>
<span class="zl-toggle-row"><button class="zl-toggle" role="switch" aria-checked="true" aria-busy="true" aria-label="Saving"></button>Loading (saving)</span>
</div>
<script>document.querySelectorAll('.zl-toggle:not([disabled])').forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-checked',b.getAttribute('aria-checked')!=='true')})});</script>` };

P.Badge = { group: 'Status', height: 120, html: `
${row('<span class="zl-badge">Neutral</span>', ai('Needs reply'), ai('Draft ready'), '<span class="zl-badge zl-badge--success"><span class="zl-badge-dot"></span>Sent</span>', '<span class="zl-badge zl-badge--warning"><span class="zl-badge-dot"></span>Waiting 3d</span>', '<span class="zl-badge zl-badge--error"><span class="zl-badge-dot"></span>Bounced</span>', '<span class="zl-badge zl-badge--info"><span class="zl-badge-dot"></span>Scheduled</span>')}
${row('<span class="zl-badge zl-badge--outline">Outline</span>', '<span class="zl-badge zl-badge--solid">New</span>', '<span class="zl-badge zl-badge--accent">Private beta</span>', '<span class="zl-badge zl-mono">⌘K</span>')}` };

P.Card = { group: 'Layout', height: 300, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
<div class="zl-card"><div class="zl-icon-tile">${ic('agent')}</div><h3 class="zl-card-title">Default</h3><p class="zl-card-body">Hairline border on surface. Static content.</p></div>
<a class="zl-card zl-card--interactive is-hover" href="#"><h3 class="zl-card-title">Interactive · hover</h3><p class="zl-card-body">Border strengthens, small shadow.</p></a>
<a class="zl-card zl-card--interactive is-focus" href="#"><h3 class="zl-card-title">Focus-visible</h3><p class="zl-card-body">2px focus ring, 2px offset.</p></a>
<div class="zl-card zl-card--selected"><h3 class="zl-card-title">Selected</h3><p class="zl-card-body">Accent outline for a chosen option.</p></div>
<div class="zl-card zl-card--raised"><h3 class="zl-card-title">Raised</h3><p class="zl-card-body">surface-raised + shadow-md; popovers and panels.</p><div class="zl-card-foot"><button class="zl-btn zl-btn--secondary zl-btn--sm">Dismiss</button><button class="zl-btn zl-btn--primary zl-btn--sm">Apply rule</button></div></div>
</div>` };

P.NavBar = { group: 'Navigation', height: 200, width: 1100, html: `
<nav class="zl-nav" aria-label="Main" style="position:relative">${brand}
<ul class="zl-nav-links"><li><a class="zl-navlink" href="#" aria-current="page">Product</a></li><li><a class="zl-navlink is-hover" href="#">How it works</a></li><li><a class="zl-navlink" href="#">Pricing</a></li><li><a class="zl-navlink is-focus" href="#">Security</a></li></ul>
<div class="zl-nav-actions"><a class="zl-btn zl-btn--ghost" href="#">Sign in</a><a class="zl-btn zl-btn--primary" href="#">Join waitlist</a><button class="zl-btn zl-btn--ghost zl-btn--icon zl-nav-menu" aria-label="Open menu" aria-expanded="false">${ic('menu')}</button></div></nav>
<div style="height:24px"></div>
${cap('Compact (below 768px): links collapse into a menu button')}
<div style="max-width:375px;border:1px solid var(--border);border-radius:12px;overflow:hidden">
<nav class="zl-nav zl-nav--compact" aria-label="Main, compact" style="position:relative">${brand}<div class="zl-nav-actions"><a class="zl-btn zl-btn--primary zl-btn--sm" href="#">Join waitlist</a><button class="zl-btn zl-btn--ghost zl-btn--icon zl-nav-menu" aria-label="Open menu" aria-expanded="false">${ic('menu')}</button></div></nav></div>` };

P.Footer = { group: 'Navigation', height: 330, width: 1100, html: `
<footer class="zl-footer"><div class="zl-footer-grid">
<div>${brand}<p style="margin:12px 0 0;max-width:30ch">Email handled in the background, so you only see what needs you.</p></div>
<nav aria-label="Product"><h4>Product</h4><ul><li><a href="#">How it works</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul></nav>
<nav aria-label="Company"><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Contact</a></li></ul></nav>
<nav aria-label="Trust"><h4>Trust</h4><ul><li><a href="#">Security</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></nav>
</div><div class="zl-footer-bottom"><span>© 2026 ZeroLatency. Placeholder legal line.</span><span>Status: all systems normal</span></div></footer>` };

P.Modal = { group: 'Overlays', height: 380, html: `
<div class="zl-scrim zl-scrim--inline" style="min-height:340px;border-radius:12px">
<div class="zl-modal" role="dialog" aria-modal="true" aria-labelledby="m1" aria-describedby="m1d">
<div class="zl-modal-head"><h2 class="zl-modal-title" id="m1">Let the agent send this reply?</h2><button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--sm" aria-label="Close">${ic('x')}</button></div>
<div class="zl-modal-body" id="m1d"><p style="margin:0 0 16px">ZeroLatency will send the draft to Jonas Beck and add the new time to your calendar. You can undo for 10 seconds.</p>
<label class="zl-check"><input type="checkbox"><span class="zl-check-box"></span><span>Always send reschedules like this without asking</span></label></div>
<div class="zl-modal-foot"><button class="zl-btn zl-btn--secondary">Edit draft</button><button class="zl-btn zl-btn--primary is-focus">Send reply</button></div>
</div></div>` };

P.Toast = { group: 'Overlays', height: 330, html: `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px">
<div class="zl-toast zl-toast--success" role="status">${ic('checkCircle')}<div class="zl-toast-main"><div class="zl-toast-title">Archived 18 threads</div><div class="zl-toast-desc">Newsletters and receipts.</div></div><div class="zl-toast-actions"><button class="zl-btn zl-btn--link zl-btn--sm">Undo</button><button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--sm" aria-label="Dismiss">${ic('x')}</button></div></div>
<div class="zl-toast zl-toast--agent" role="status"><span class="zl-spinner" aria-hidden="true"></span><div class="zl-toast-main"><div class="zl-toast-title">Drafting a reply…</div><div class="zl-toast-desc">Loading state for agent work.</div></div></div>
<div class="zl-toast zl-toast--info" role="status">${ic('info')}<div class="zl-toast-main"><div class="zl-toast-title">Meeting offered</div><div class="zl-toast-desc">3 slots sent to Jonas Beck.</div></div><div class="zl-toast-actions"><button class="zl-btn zl-btn--ghost zl-btn--icon zl-btn--sm" aria-label="Dismiss">${ic('x')}</button></div></div>
<div class="zl-toast zl-toast--warning" role="status">${ic('alert')}<div class="zl-toast-main"><div class="zl-toast-title">Calendar access expires soon</div><div class="zl-toast-desc">Reconnect to keep scheduling on.</div></div><div class="zl-toast-actions"><button class="zl-btn zl-btn--secondary zl-btn--sm">Reconnect</button></div></div>
<div class="zl-toast zl-toast--error" role="alert">${ic('errorCircle')}<div class="zl-toast-main"><div class="zl-toast-title">Couldn’t send</div><div class="zl-toast-desc">Gmail rejected the attachment size.</div></div><div class="zl-toast-actions"><button class="zl-btn zl-btn--secondary zl-btn--sm">Retry</button></div></div>
</div>` };

P.Tabs = { group: 'Navigation', height: 200, html: `
<div class="zl-tabs" role="tablist" aria-label="Views">
<button class="zl-tab" role="tab" aria-selected="true">Needs you <span class="zl-tab-count">4</span></button>
<button class="zl-tab is-hover" role="tab" aria-selected="false" tabindex="-1">Drafted <span class="zl-tab-count">12</span></button>
<button class="zl-tab is-focus" role="tab" aria-selected="false" tabindex="-1">Waiting <span class="zl-tab-count">7</span></button>
<button class="zl-tab" role="tab" aria-selected="false" tabindex="-1">FYI</button>
<button class="zl-tab" role="tab" aria-selected="false" disabled>Team (soon)</button>
</div>
<div style="height:28px"></div>
${cap('Segmented variant (billing period, density)')}
<div class="zl-segmented" role="tablist" aria-label="Billing period"><button class="zl-tab" role="tab" aria-selected="true">Monthly</button><button class="zl-tab" role="tab" aria-selected="false" tabindex="-1">Yearly</button></div>` };

P.InboxRow = { group: 'Data display', height: 380, width: 980, html: `
<ul class="zl-list" role="listbox" aria-label="Threads" style="border:1px solid var(--border);border-radius:12px;padding:4px">
<li class="zl-list-group" role="presentation">Needs you</li>
${inboxRow({ from: 'Priya Raman', subject: 'Term sheet redlines', snippet: 'Two open points on the option pool', chip: ai('Decision'), time: '9:41', state: 'zl-row--unread' })}
${inboxRow({ from: 'Jonas Beck', count: 3, subject: 'Can we move Thursday?', chip: ai('Draft ready'), time: '8:50', state: 'zl-row--unread', selected: true })}
${inboxRow({ from: 'Ops Weekly', subject: 'Vendor renewal due Friday', chip: ai('Approve'), time: '8:12', state: 'zl-row--unread is-hover' })}
${inboxRow({ from: 'Amara Osei', subject: 'Intro: Amara ↔ Northwind', snippet: 'Happy to connect you two', time: '7:30', state: 'zl-row--unread is-focus' })}
<li class="zl-list-group" role="presentation">Read</li>
${inboxRow({ from: 'Legal', subject: 'DPA signed copy', chip: '<span class="zl-badge zl-badge--success">Filed</span>', time: 'Mon' })}
${inboxRow({ from: 'Travel desk', count: 2, subject: 'Itinerary for Lisbon', chip: '<span class="zl-badge zl-badge--info">Scheduled</span>', time: 'Sun' })}
${inboxRow({ from: 'Ana Ferreira', subject: 'Thanks for yesterday', snippet: 'Agent replied', time: 'Sat', state: 'zl-row--done' })}
</ul>
<p class="zl-label-txt" style="margin:12px 0 0">Rows: unread (bold + accent dot) · selected · hover (actions replace time) · focus-visible · read · AI-labeled chips · handled by agent</p>` };

P.EmptyState = { group: 'Feedback', height: 330, html: `
<div class="zl-card" style="padding:0">
<div class="zl-empty">
<svg class="zl-empty-mark" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="var(--accent-subtle)"/><path d="M25 17.5A10.5 10.5 0 1 0 35.5 28M25 17.5H40" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>
<h3 class="zl-empty-title">Nothing needs you right now</h3>
<p class="zl-empty-body">132 emails came in today. The agent archived 61, drafted 12 and scheduled 3. We’ll surface the next one that needs a decision.</p>
<div class="zl-empty-actions"><button class="zl-btn zl-btn--secondary">See what was handled</button><button class="zl-btn zl-btn--ghost">Adjust rules</button></div>
</div></div>` };

// ---------------- Patterns ----------------
P.Hero = { group: 'Patterns', height: 760, width: 1280, html: `
<section class="zl-hero" aria-labelledby="h1">
<span class="zl-badge zl-badge--accent">Private beta · Gmail &amp; Google Workspace</span>
<h1 class="zl-hero-title" id="h1">Email, handled <em>before</em> you look.</h1>
<p class="zl-lead">ZeroLatency triages, drafts and schedules in the background, so your inbox only shows what needs you.</p>
<div class="zl-hero-ctas"><a class="zl-btn zl-btn--primary zl-btn--lg" href="#">Join the waitlist</a><a class="zl-btn zl-btn--secondary zl-btn--lg" href="#">See how it works</a></div>
<p class="zl-hero-note">Free while in beta. No inbox migration.</p>
<div class="zl-hero-visual">${frameMock}</div>
</section>` };

const feat = (icon, t, b) => `<div class="zl-card"><div class="zl-icon-tile">${ic(icon)}</div><h3 class="zl-card-title">${t}</h3><p class="zl-card-body">${b}</p></div>`;
P.FeatureGrid = { group: 'Patterns', height: 640, width: 1280, html: `
<section class="zl-section"><div class="zl-container">
<div class="zl-section-head"><p class="zl-eyebrow">What the agent does</p><h2 class="zl-h2">Your inbox, pre-processed.</h2><p class="zl-lead">Every thread is sorted, answered or scheduled before it reaches you. You keep the final say.</p></div>
<div class="zl-features">
${feat('agent', 'Triage in the background', 'Newsletters, receipts and FYIs are summarized and filed. Only decisions reach “Needs you”.')}
${feat('pen', 'Drafts in your voice', 'Replies are drafted from your past threads and wait for a one-key approve.')}
${feat('cal', 'Scheduling without the back-and-forth', 'The agent offers times from your calendar and books the one that sticks.')}
${feat('sliders', 'Rules in plain language', 'Write “anything from investors is urgent” and it becomes a rule you can edit.')}
${feat('keyboard', 'Keyboard-first', 'Every action has a shortcut, and ⌘K reaches all of them.')}
${feat('lock', 'Private by default', 'Your mail is processed for you only and never used to train shared models.')}
</div></div></section>` };

P.ScreenshotFrame = { group: 'Patterns', height: 520, width: 1180, html: `<div style="height:460px">${frameMock}</div>` };

const quote = (q, initials, feature = false) => `<figure class="zl-card zl-quote${feature ? ' zl-quote--feature' : ''}"><blockquote>“${q}”</blockquote><figcaption><span class="zl-avatar" aria-hidden="true">${initials}</span><span><span class="zl-quote-name">Placeholder Name</span> <span class="zl-badge zl-badge--warning">Placeholder</span><br><span class="zl-quote-role">Placeholder role, Placeholder Co.</span></span></figcaption></figure>`;
P.Testimonial = { group: 'Patterns', height: 560, width: 1180, html: `
<section class="zl-section zl-section--subtle"><div class="zl-container">
<div class="zl-section-head zl-section-head--center"><h2 class="zl-h2">Early readers, fewer emails.</h2><p class="zl-lead">Placeholder quotes. Replace only with real, approved customer statements.</p></div>
<div class="zl-quotes">
${quote('I open my inbox twice a day now, and it only has four things in it.', 'PN', true)}
${quote('The drafts sound like me. I mostly just press Enter.', 'PN')}
${quote('Scheduling used to be six emails. Now it is zero.', 'PN')}
</div></div></section>` };

const plan = (name, price, per, desc, items, cta, featured = false, badge = '') => `<div class="zl-card zl-plan${featured ? ' zl-plan--featured' : ''}"><div class="zl-plan-name">${name}${badge}</div><div class="zl-plan-price"><strong>${price}</strong><span>${per}</span></div><p class="zl-plan-desc">${desc}</p><ul>${items.map(i => `<li>${ic('check')}<span>${i}</span></li>`).join('')}</ul><a class="zl-btn ${featured ? 'zl-btn--primary' : 'zl-btn--secondary'} zl-btn--block" href="#">${cta}</a></div>`;
P.Pricing = { group: 'Patterns', height: 780, width: 1180, html: `
<section class="zl-section"><div class="zl-container">
<div class="zl-section-head zl-section-head--center"><h2 class="zl-h2">Simple plans. Placeholder prices.</h2><p class="zl-lead">Pricing is not final; numbers are placeholders for layout.</p><div style="margin-top:24px" class="zl-segmented" role="tablist" aria-label="Billing period"><button class="zl-tab" role="tab" aria-selected="true">Monthly</button><button class="zl-tab" role="tab" aria-selected="false" tabindex="-1">Yearly</button></div></div>
<div class="zl-pricing">
${plan('Free', '$0', 'forever', 'For trying the agent on one account.', ['1 Google account', 'Views and plain-language rules', 'Limited AI actions each month'], 'Start free')}
${plan('Pro', '$12', 'per user / month', 'For people who live in email.', ['Unlimited triage and drafts', 'Snippets and scheduling links', 'Priority support'], 'Join the waitlist', true, '<span class="zl-badge zl-badge--solid">Recommended</span>')}
${plan('Team', '$20', 'per user / month', 'For teams that share rules.', ['Shared rules and views', 'Admin controls and SSO', 'Audit log'], 'Talk to us')}
</div></div></section>` };

const qa = (q, a, open = false) => `<details${open ? ' open' : ''}><summary>${q}</summary><p class="zl-faq-a">${a}</p></details>`;
P.FAQ = { group: 'Patterns', height: 560, width: 1100, html: `
<section class="zl-section"><div class="zl-container">
<div class="zl-section-head zl-section-head--center"><h2 class="zl-h2">Questions</h2></div>
<div class="zl-faq">
${qa('Does ZeroLatency send email without asking me?', 'Only for the kinds of replies you approve. Everything else waits as a draft, and every send can be undone for 10 seconds.', true)}
${qa('Which email providers work?', 'Gmail and Google Workspace today. Outlook is planned.')}
${qa('Do I have to move my email?', 'No. ZeroLatency works on top of your existing account; nothing is migrated.')}
${qa('Is my mail used to train models?', 'No. Your mail is processed only to act for you.')}
</div></div></section>` };

P.CTABand = { group: 'Patterns', height: 360, width: 1180, html: `
<section class="zl-section"><div class="zl-container">
<div class="zl-cta"><div><h2>Get your mornings back.</h2><p>Join the beta and let the agent clear today’s inbox before your first coffee.</p></div>
<form class="zl-cta-form" onsubmit="return false"><label class="zl-visually-hidden" for="cta-email">Work email</label><input id="cta-email" class="zl-input zl-input--lg" type="email" placeholder="you@company.com"><button class="zl-btn zl-btn--primary zl-btn--lg">Join waitlist</button><span class="zl-cta-note">No credit card. Leave anytime.</span></form></div>
</div></section>` };

export const PREVIEWS = P;

for (const [name, p] of Object.entries(P)) {
  const marker = `<!-- @dsCard group="${p.group}" height=${p.height}${p.width ? ` width=${p.width}` : ''} -->`;
  const pad = p.group === 'Patterns' || name === 'NavBar' || name === 'Footer' ? '0' : '24px';
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
