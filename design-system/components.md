# ZeroLatency DS — components and patterns

Reference for the Next.js + Tailwind build. Tokens: `tokens.json` → `handoff/tokens.css` (generated). Reference styles: `handoff/components.css` (`zl-*` classes). Live previews: the Design System artifact (see `design-system-link.txt`) and `handoff/previews/*/preview.html`.

**Shared rules**
- Focus-visible everywhere: `outline: 2px solid var(--focus-ring); outline-offset: 2px` (inputs: inside, offset -1px). On `surface-emphasis`, use `focus-ring-emphasis`.
- Motion: hover/press `duration-fast` + `ease-standard`; enter `duration-slow` + `ease-enter`; exit `duration-fast` + `ease-exit`. Under `prefers-reduced-motion: reduce` only opacity fades remain.
- Color carries meaning only together with text, weight or an icon.
- Touch targets ≥ 44px on mobile (use lg controls or pad rows).

**Contents**
- Components (14): Button, Input, Select, Checkbox, Toggle, Badge, Card, NavBar, Footer, Modal, Toast, Tabs, InboxRow, EmptyState
- Patterns (7): Hero, FeatureGrid, ScreenshotFrame, Testimonial, Pricing, FAQ, CTABand

---

# Components

## Button

Triggers an action; one primary per view, everything else secondary, ghost or link.

- **Anatomy:** Container (height 28/36/44px, radius-md; radius-sm at sm) · optional leading icon (16px) · label (text-sm 500; text-base at lg) · optional trailing icon · spinner when loading.
- **Variants:** primary (accent fill) · secondary (surface + border-strong outline) · ghost (transparent, text-muted) · destructive (error fill) · link (inline, accent-text, underlined). Sizes sm 28px / md 36px / lg 44px. Icon-only: square, same heights, `aria-label` required. Block: full width (mobile CTAs).
- **States:** default · hover (accent-hover / surface-hover) · focus-visible (2px focus-ring, 2px offset) · active (accent-active / surface-sunken) · disabled (surface-hover fill + text-disabled, `cursor:not-allowed`) · loading (`aria-busy="true"`, spinner replaces leading icon, label changes to a present participle, width kept).
- **Tokens:** `accent`, `accent-hover`, `accent-active`, `accent-fg`, `surface`, `surface-hover`, `surface-sunken`, `border-strong`, `text`, `text-muted`, `text-disabled`, `error`, `error-hover`, `error-fg`, `accent-text`, `focus-ring`, `radius-md`, `radius-sm`, `space-2..5`, `text-sm`, `text-base`, `duration-fast`, `ease-standard`.
- **Accessibility:** Use `<button>` for actions and `<a>` for navigation. Icon-only buttons need `aria-label`. Loading keeps focus and sets `aria-busy`; announce completion via a toast (`role="status"`). Destructive actions that cannot be undone go through a Modal. Hit target ≥ 44px on touch (use lg or pad the row).
- **Do:** Write verbs: "Send reply", "Join waitlist". Keep one primary per region. Pair destructive with an undo toast where possible.
- **Don't:** Don't put two primaries side by side. Don't use link style for actions that change data. Don't shorten "Cancel" to an icon.

## Input

Single-line text entry with label, hint and error message.

- **Anatomy:** Field wrapper (grid, gap space-1.5) · label (text-sm 500, text) · control (36px, or 44px `--lg`; radius-md; 1px border-strong; surface) · optional leading icon (text-subtle) and trailing kbd hint · hint (text-xs, text-subtle) or error (text-xs, error-text, icon).
- **Variants:** md 36px (app) · lg 44px (marketing forms) · with leading icon (search) · with trailing shortcut hint.
- **States:** default · hover (border → text-subtle) · focus-visible (2px focus-ring inside, border focus-ring) · invalid (`aria-invalid="true"`, border error, message below) · disabled (surface-sunken, text-disabled, border) · read-only (as default, no hover).
- **Tokens:** `surface`, `surface-sunken`, `border-strong`, `border`, `text`, `text-subtle`, `text-disabled`, `focus-ring`, `error`, `error-text`, `radius-md`, `space-3`, `space-4`, `text-sm`, `text-xs`.
- **Accessibility:** Always a visible `<label>` (placeholder is not a label). Link hint/error with `aria-describedby`. Error text says how to fix it. Border-strong meets 3:1 on every surface; placeholder uses text-subtle (≥4.5:1).
- **Do:** Use `type="email"` and `autocomplete` values. Validate on blur, not on every keystroke.
- **Don't:** Don't rely on red alone; always include the message and icon. Don't disable the submit button to signal errors.

## Select

Pick one option from a short list; native `<select>` styled to match Input.

- **Anatomy:** Same field shell as Input · native `<select>` (appearance none, 36px) · CSS chevron (text-muted) at right 14px.
- **Variants:** md 36px · lg 44px (use `zl-input--lg` metrics) · with hint · invalid.
- **States:** default · hover · focus-visible · invalid · disabled — identical tokens to Input.
- **Tokens:** Input tokens plus `text-muted` for the chevron.
- **Accessibility:** Keep the native element for keyboard and screen-reader support. For > 10 options or search, use a combobox pattern (not in v1).
- **Do:** Order options by likelihood; make the default the safest choice.
- **Don't:** Don't use a select for 2 options (use a Toggle or Tabs/segmented).

## Checkbox

Independent on/off choices, including a mixed (indeterminate) parent.

- **Anatomy:** Visually hidden native input · 18px box (radius-xs, 1.5px border-strong) · check mark or dash (accent-fg on accent) · label (text-sm) · optional description (text-xs, text-subtle).
- **Variants:** unchecked · checked · indeterminate · with description.
- **States:** default · hover (surface-hover fill) · focus-visible (ring on the box) · active (surface-sunken) · disabled (border, surface-sunken; label text-disabled) · disabled checked.
- **Tokens:** `border-strong`, `surface`, `surface-hover`, `surface-sunken`, `accent`, `accent-fg`, `text`, `text-subtle`, `text-disabled`, `focus-ring`, `radius-xs`.
- **Accessibility:** Native `<input type="checkbox">` inside a `<label>`; set `.indeterminate` in JS for mixed. Box border meets 3:1.
- **Do:** Use for settings that apply on save and for multi-select in lists.
- **Don't:** Don't use for instant on/off settings (use Toggle).

## Toggle

Switch for a setting that takes effect immediately (e.g. auto-draft replies).

- **Anatomy:** Track 36×20 (radius-full) · knob 16px (neutral-0, shadow-xs) · adjacent label.
- **Variants:** off (track border-strong) · on (track accent).
- **States:** default · hover (track text-subtle / accent-hover) · focus-visible (ring) · active (knob stretches to 19px) · disabled (surface-sunken track, border knob) · loading (`aria-busy`, knob pulses while saving).
- **Tokens:** `border-strong`, `text-subtle`, `accent`, `accent-hover`, `surface-sunken`, `border`, `neutral-0`, `shadow-xs`, `focus-ring`, `duration-base`, `ease-standard`.
- **Accessibility:** `<button role="switch" aria-checked>` with a visible label or `aria-label`. Off track meets 3:1 against surfaces. Motion is transform only and collapses under reduced motion.
- **Do:** Apply immediately and confirm with a toast if the effect is not visible.
- **Don't:** Don't put toggles in forms that need a Save button.

## Badge

Short status or label chip; the AI variant marks anything the agent decided.

- **Anatomy:** Pill (22px, radius-full, 1px tinted border) · optional dot (6px) or 12px icon · label (text-xs 500).
- **Variants:** neutral · ai/accent (accent-subtle + accent-text + agent glyph) · success · warning · error · info · outline · solid (accent fill, for "Recommended"/"New").
- **States:** Static. When clickable (filter chip), follow Button ghost states and add focus-visible ring.
- **Tokens:** `surface-sunken`, `text-muted`, `accent-subtle`, `accent-text`, `accent-border`, `{status}-subtle`, `{status}-text`, `{status}-border`, `accent`, `accent-fg`, `radius-full`, `text-xs`.
- **Accessibility:** Color is never the only signal: every status badge has a word, and AI badges carry the agent glyph. All text pairs ≥ 4.5:1 in both themes.
- **Do:** Keep to 1–2 words. Use the AI badge only for agent-generated labels ("Needs reply", "Draft ready").
- **Don't:** Don't stack more than two badges in an inbox row. Don't invent new hues for labels.

## Card

Groups related content on a surface; can be static, interactive, selected or raised.

- **Anatomy:** Container (surface, 1px border, radius-lg, padding space-6) · optional icon tile (36px, accent-subtle) · title (text-lg 600) · body (text-sm, text-muted) · optional footer actions.
- **Variants:** default · interactive (whole card is a link) · selected (accent outline) · raised (surface-raised + shadow-md, no border) · sunken (bg-subtle).
- **States:** interactive: hover (border-strong + shadow-sm) · focus-visible (ring) · active (surface-hover, no shadow). Disabled cards are not used; hide or explain instead.
- **Tokens:** `surface`, `surface-raised`, `bg-subtle`, `border`, `border-strong`, `accent`, `accent-subtle`, `accent-text`, `text`, `text-muted`, `shadow-sm`, `shadow-md`, `radius-lg`, `space-6`.
- **Accessibility:** Interactive cards are a single `<a>`/`<button>`; don't nest other interactive elements inside. Headings inside cards keep the page outline order.
- **Do:** Use cards for comparable items (features, plans, quotes).
- **Don't:** Don't nest cards. Don't add colored left borders.

## NavBar

Sticky top bar with the mark, primary links and the single primary CTA.

- **Anatomy:** Bar (64px, bg, bottom border, z-nav) · brand (mark 28px + wordmark text-lg 600) · link list (36px items, text-sm 500) · actions (ghost "Sign in" + primary CTA) · menu button (below md).
- **Variants:** default (≥ 768px) · compact (< 768px: links and ghost action collapse into a menu button that opens a sheet).
- **States:** link: default (text-muted) · hover (text + surface-hover) · focus-visible (ring) · current (`aria-current="page"`, text + 2px accent underline).
- **Tokens:** `bg`, `border`, `text`, `text-muted`, `surface-hover`, `accent`, `focus-ring`, `z-nav`, `space-4..8`, `radius-md`.
- **Accessibility:** `<nav aria-label="Main">`. Menu button uses `aria-expanded` and `aria-controls`. Provide a "Skip to content" link as the first focusable element.
- **Do:** Keep ≤ 5 links. Keep the CTA label identical to the hero CTA.
- **Don't:** Don't add a second filled button. Don't hide the CTA on mobile.

## Footer

Closing site navigation, brand line and legal row on bg-subtle.

- **Anatomy:** Band (bg-subtle, top border, padding space-12/6/8) · brand column (mark + one sentence) · 3 link columns (uppercase text-xs heading in text-subtle, text-sm links) · bottom row (divider, text-xs legal + status).
- **Variants:** desktop 4 columns · mobile: brand full width, links 2 columns.
- **States:** links: default (text-muted) · hover (text + underline) · focus-visible (ring).
- **Tokens:** `bg-subtle`, `border`, `text`, `text-muted`, `text-subtle`, `focus-ring`, `space-2..12`, `text-xs`, `text-sm`.
- **Accessibility:** `<footer>` with each column as `<nav aria-label>`. Links are real text, not icons alone.
- **Do:** Keep the legal line short. Link Security and Privacy.
- **Don't:** Don't repeat the full nav plus a newsletter form plus social icons; pick what matters.

## Modal

Blocking dialog for a confirmation or a short focused task.

- **Anatomy:** Scrim (overlay, z-overlay) · dialog (max-width 480, surface-raised, radius-xl, shadow-xl, 1px border) · header (title text-xl 600 + close icon button) · body (text-sm, text-muted) · footer (bg-subtle, right-aligned secondary + primary).
- **Variants:** confirm (2 actions) · destructive (primary is destructive) · form (inputs in body).
- **States:** enter: fade + 8px rise, duration-slow, ease-enter · exit: fade, duration-fast, ease-exit · reduced motion: fade only.
- **Tokens:** `overlay`, `surface-raised`, `border`, `bg-subtle`, `text`, `text-muted`, `shadow-xl`, `radius-xl`, `z-overlay`, `z-modal`, `duration-slow`, `ease-enter`.
- **Accessibility:** Use `<dialog>` or `role="dialog" aria-modal="true"` with `aria-labelledby`/`aria-describedby`. Trap focus, focus the primary (or first field) on open, return focus on close, Esc closes.
- **Do:** Title as a question for confirmations; buttons repeat the verb ("Send reply").
- **Don't:** Don't use a modal for information that could be a toast. Don't stack modals.

## Toast

Brief, non-blocking confirmation of what the user or the agent just did, often with Undo.

- **Anatomy:** Container (max 380px, surface-raised, border, radius-lg, shadow-lg) · status icon or spinner · title (600) + description (text-muted) · actions (link "Undo", secondary "Retry", dismiss icon).
- **Variants:** success · info · warning · error · agent/loading (spinner, "Drafting a reply…").
- **States:** enter: 8px rise + fade (duration-slow, ease-enter) · auto-dismiss after 6s (never for error) · pause on hover/focus · reduced motion: fade only.
- **Tokens:** `surface-raised`, `border`, `shadow-lg`, `text`, `text-muted`, `success`, `warning`, `error`, `info`, `accent`, `radius-lg`, `z-toast`.
- **Accessibility:** `role="status"` (polite) for success/info/loading; `role="alert"` for errors. Actions reachable by keyboard (F6 or a shortcut to focus the stack). Icons have text equivalents.
- **Do:** Say what happened in past tense ("Archived 18 threads"). Offer Undo for agent actions.
- **Don't:** Don't use toasts for errors that block a task; show them inline.

## Tabs

Switch between views of the same context (inbox views, billing period).

- **Anatomy:** Tablist (bottom border) · tab (40px, text-sm 500) · optional count (mono text-xs) · selected indicator (2px accent bar).
- **Variants:** underline (default) · segmented (surface-sunken track, selected pill surface-raised + shadow-sm).
- **States:** default (text-muted) · hover (text) · focus-visible (ring) · selected (text + accent bar; count accent-text) · disabled (text-disabled).
- **Tokens:** `border`, `text`, `text-muted`, `text-subtle`, `text-disabled`, `accent`, `accent-text`, `surface-sunken`, `surface-raised`, `shadow-sm`, `focus-ring`.
- **Accessibility:** WAI-ARIA tabs: `role="tablist"`, `role="tab"` + `aria-selected`, roving tabindex, arrow keys move, Home/End jump. Panels use `role="tabpanel"` + `aria-labelledby`.
- **Do:** Keep labels to 1–2 words; show counts only when they help decide.
- **Don't:** Don't use tabs for sequential steps.

## InboxRow

One thread in a list: sender, subject, agent label and time, with actions on hover.

- **Anatomy:** Row (44px, radius-sm) · unread dot (8px) · sender (≤168px, ellipsis) + count · subject + optional snippet (text-subtle) · meta (≤2 badges) · time (text-xs, text-subtle, tabular) · hover actions (archive, snooze) replacing time. Group header: text-xs 500 text-subtle with hairline.
- **Variants:** unread (text + 600 weight + accent dot) · read (text-muted, 400) · selected (surface-selected + accent-border inset) · AI-labeled (AI badge in meta) · handled by agent (text-subtle, strikethrough subject). Mobile (< 768px): two lines, sender + time, then subject + badges.
- **States:** hover (surface-hover, actions shown) · focus-visible (2px inset focus-ring, actions shown) · active/pressed (surface-sunken) · selected · loading (skeleton bars in surface-sunken).
- **Tokens:** `surface`, `surface-hover`, `surface-selected`, `surface-sunken`, `accent`, `accent-border`, `text`, `text-muted`, `text-subtle`, `border`, `border-strong`, `focus-ring`, `radius-sm`, `text-sm`, `text-xs`.
- **Accessibility:** List is `role="listbox"` (or a grid) with rows as options (`aria-selected`); unread state also in text for screen readers ("Unread, from Priya Raman…"). Weight + dot, not color alone, signal unread. Keyboard: j/k move, e archive, Enter open.
- **Do:** Keep one line on desktop, no avatars, max two badges.
- **Don't:** Don't show preview text on every row; reserve snippets for AI summaries.

## EmptyState

Calm "nothing to do" or "no results" message with a next step.

- **Anatomy:** Centered stack (max 420px) · 56px brand glyph on accent-subtle disc · title (text-xl 600) · body (text-sm, text-muted) · 1–2 actions (secondary + ghost).
- **Variants:** inbox clear (celebrate quietly, show what the agent handled) · no search results (suggest a broader query) · first run (connect account).
- **States:** Static.
- **Tokens:** `accent`, `accent-subtle`, `text`, `text-muted`, `space-2..12`, `text-xl`, `text-sm`.
- **Accessibility:** The glyph is decorative (`aria-hidden`). Title is a heading at the right level.
- **Do:** Report what the agent did ("archived 61, drafted 12").
- **Don't:** Don't use confetti, mascots or guilt ("Inbox zero!").

---

# Page patterns

## Hero

Opening section: one headline, one sentence, two CTAs, then a cropped product visual.

- **Anatomy:** Eyebrow badge (accent) · headline (display 76/76, 600, -0.04em; one accent-text word) · lead (text-xl, text-muted, max 34em) · CTA row (primary lg + secondary lg) · note (text-xs, text-subtle) · product frame cropped at the bottom (420px tall).
- **Variants:** centered (default) · split (text left, frame right) for secondary pages.
- **States:** Responsive: < 768px headline drops to 5xl (48/52), CTAs stack full width, visual 320px tall; ≥ 1280px container 1152px.
- **Tokens:** `bg`, `text`, `text-muted`, `text-subtle`, `accent-text`, `accent-subtle`, `text-display`, `text-5xl`, `text-xl`, `space-24`, `space-16`.
- **Accessibility:** Single `<h1>`. The product frame has a text alternative (`role="img"` + `aria-label`) or is decorative when described in copy.
- **Do:** One idea: speed + calm. Keep the headline ≤ 8 words.
- **Don't:** Don't add avatars, logo walls or characters around the hero. No gradients behind the headline.

## FeatureGrid

Section head plus 3–6 feature cards in an auto-fit grid.

- **Anatomy:** Section (bg, space-24 vertical) · head (eyebrow, h2 text-4xl, lead) · grid (auto-fit, min 280px, gap space-4) · Card with icon tile, title, body.
- **Variants:** 3-up · 6-up (2 rows) · alternating (one large product visual per feature) for deeper pages.
- **States:** Responsive: 3 → 2 → 1 columns via auto-fit.
- **Tokens:** Card tokens plus `accent-text` (eyebrow), `text-4xl`, `text-lg`.
- **Accessibility:** Feature titles are `<h3>` under the section `<h2>`. Icons decorative.
- **Do:** Describe outcomes in plain words.
- **Don't:** Don't use emoji or illustrated characters as feature icons.

## ScreenshotFrame

Original, code-built product mockup (sidebar views, inbox rows, agent panel) used as the product visual.

- **Anatomy:** Frame (surface, border, radius-xl, shadow-xl) · title bar (40px, bg-subtle, mark + title + ⌘K hint) · sidebar (208px views with counts) · list (InboxRows) · agent activity panel (256px: activity items + a draft card).
- **Variants:** full (3 columns) · list-only (< 1024px) · cropped (inside Hero with fixed height and overflow hidden).
- **States:** Static; may auto-play a subtle row highlight only when motion is allowed.
- **Tokens:** `surface`, `bg-subtle`, `border`, `surface-selected`, `accent`, `accent-subtle`, `accent-border`, `accent-text`, `text-subtle`, `shadow-xl`, `radius-xl`, `font-mono`.
- **Accessibility:** Treat as an image: `role="img"` with a descriptive `aria-label`; inner controls are not focusable (add `inert` in production).
- **Do:** Use realistic but fictional names and subjects.
- **Don't:** Never use Notion (or any third-party) screenshots; never show real customer data.

## Testimonial

Quote cards with clearly marked placeholder attribution until real, approved quotes exist.

- **Anatomy:** Section (bg-subtle) · centered head · grid of Cards (auto-fit 300px) · blockquote (text-lg; featured text-2xl) · figcaption (dashed initials avatar, name, "Placeholder" warning badge, role).
- **Variants:** grid of 3 · single featured quote.
- **States:** Static.
- **Tokens:** `bg-subtle`, `surface`, `border`, `border-strong`, `text`, `text-subtle`, `warning-subtle`, `warning-text`, `text-lg`, `text-2xl`.
- **Accessibility:** `<figure>` + `<blockquote>` + `<figcaption>`. Don't fake photos; initials avatar is `aria-hidden`.
- **Do:** Keep the "Placeholder" badge until legal approves a real quote.
- **Don't:** Don't invent names, companies, logos or stats and present them as real.

## Pricing

Three plan cards with a billing toggle; one plan featured.

- **Anatomy:** Head (h2, lead, segmented Monthly/Yearly) · grid (auto-fit 260px) · plan Card: name (+ solid badge), price (text-5xl) + period, description, feature list with check icons (accent-text), block CTA.
- **Variants:** default plan (secondary CTA) · featured (accent outline + shadow-lg, primary CTA, "Recommended" badge).
- **States:** Billing toggle swaps prices; CTA states as Button.
- **Tokens:** Card tokens plus `accent`, `accent-text`, `accent-fg`, `shadow-lg`, `text-5xl`.
- **Accessibility:** Price read as "$12 per user per month" (keep period in text). The featured plan is marked in text, not just by color.
- **Do:** Label placeholder prices as placeholders until validated.
- **Don't:** Don't use strikethrough "discount" prices or countdowns.

## FAQ

Accordion of short questions and answers.

- **Anatomy:** Centered column (max 760px) · `<details>` items separated by hairlines · summary (text-lg 500, chevron) · answer (text-base, text-muted, max 62ch).
- **Variants:** single-open or multi-open; first item open by default.
- **States:** summary: default · hover (accent-text) · focus-visible (ring) · open (chevron rotates, duration-base).
- **Tokens:** `border`, `text`, `text-muted`, `accent-text`, `focus-ring`, `duration-base`, `ease-standard`.
- **Accessibility:** Native `<details>/<summary>` gives keyboard and SR support. Keep answers ≤ 3 sentences.
- **Do:** Answer the trust questions first (sending on your behalf, privacy).
- **Don't:** Don't hide pricing or data-use terms only inside the FAQ.

## CTABand

Closing call to action on the emphasis surface with an email field.

- **Anatomy:** Container (surface-emphasis, radius-2xl, padding space-16/10) · headline (text-4xl 600, text-on-emphasis) · one sentence · form (lg email input + primary lg button + note).
- **Variants:** with email form (waitlist) · button only.
- **States:** Form states as Input and Button; success replaces the form with a success line (role="status").
- **Tokens:** `surface-emphasis`, `text-on-emphasis`, `focus-ring-emphasis`, `surface`, `accent`, `accent-fg`, `radius-2xl`, `text-4xl`.
- **Accessibility:** Input has a (visually hidden) label. Buttons in the band use focus-ring-emphasis, which passes 3:1 (`focus-ring-emphasis` vs `surface-emphasis` is in the contrast table).
- **Do:** Repeat the hero CTA label exactly.
- **Don't:** Don't add a second competing action.

---

# Contrast (WCAG 2.x)

Generated by `node design-system/scripts/build-tokens.mjs` (writes `contrast-report.md`; the script exits non-zero if any pair fails). Normal text needs ≥ 4.5:1; UI parts (control borders, focus rings, icons) and large text need ≥ 3:1.

Script output:

```
$ node design-system/scripts/build-tokens.mjs
144 pairs checked, 144 pass, 0 fail. Exempt by design: `text-disabled` (disabled controls), `border` (decorative hairline), `*-border` tints (decorative; each is paired with text or an icon that passes).
wrote tokens.json
```

| Theme | Foreground | Background | Use | Min | Ratio | Result |
|---|---|---|---|---|---|---|
| light | `text` #161e20 | `bg` #ffffff | normal text | 4.5:1 | 16.93:1 | PASS |
| dark | `text` #f7fbfc | `bg` #0a1112 | normal text | 4.5:1 | 18.30:1 | PASS |
| light | `text` #161e20 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 16.25:1 | PASS |
| dark | `text` #f7fbfc | `bg-subtle` #161e20 | normal text | 4.5:1 | 16.25:1 | PASS |
| light | `text` #161e20 | `surface` #ffffff | normal text | 4.5:1 | 16.93:1 | PASS |
| dark | `text` #f7fbfc | `surface` #161e20 | normal text | 4.5:1 | 16.25:1 | PASS |
| light | `text` #161e20 | `surface-raised` #ffffff | normal text | 4.5:1 | 16.93:1 | PASS |
| dark | `text` #f7fbfc | `surface-raised` #263032 | normal text | 4.5:1 | 13.00:1 | PASS |
| light | `text` #161e20 | `surface-sunken` #eef4f5 | normal text | 4.5:1 | 15.23:1 | PASS |
| dark | `text` #f7fbfc | `surface-sunken` #0a1112 | normal text | 4.5:1 | 18.30:1 | PASS |
| light | `text` #161e20 | `surface-hover` #eef4f5 | normal text | 4.5:1 | 15.23:1 | PASS |
| dark | `text` #f7fbfc | `surface-hover` #263032 | normal text | 4.5:1 | 13.00:1 | PASS |
| light | `text-muted` #4c595c | `bg` #ffffff | normal text | 4.5:1 | 7.26:1 | PASS |
| dark | `text-muted` #dce5e6 | `bg` #0a1112 | normal text | 4.5:1 | 14.88:1 | PASS |
| light | `text-muted` #4c595c | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 6.97:1 | PASS |
| dark | `text-muted` #dce5e6 | `bg-subtle` #161e20 | normal text | 4.5:1 | 13.21:1 | PASS |
| light | `text-muted` #4c595c | `surface` #ffffff | normal text | 4.5:1 | 7.26:1 | PASS |
| dark | `text-muted` #dce5e6 | `surface` #161e20 | normal text | 4.5:1 | 13.21:1 | PASS |
| light | `text-muted` #4c595c | `surface-raised` #ffffff | normal text | 4.5:1 | 7.26:1 | PASS |
| dark | `text-muted` #dce5e6 | `surface-raised` #263032 | normal text | 4.5:1 | 10.57:1 | PASS |
| light | `text-muted` #4c595c | `surface-sunken` #eef4f5 | normal text | 4.5:1 | 6.54:1 | PASS |
| dark | `text-muted` #dce5e6 | `surface-sunken` #0a1112 | normal text | 4.5:1 | 14.88:1 | PASS |
| light | `text-muted` #4c595c | `surface-hover` #eef4f5 | normal text | 4.5:1 | 6.54:1 | PASS |
| dark | `text-muted` #dce5e6 | `surface-hover` #263032 | normal text | 4.5:1 | 10.57:1 | PASS |
| light | `text-subtle` #606d70 | `bg` #ffffff | normal text | 4.5:1 | 5.36:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `bg` #0a1112 | normal text | 4.5:1 | 10.24:1 | PASS |
| light | `text-subtle` #606d70 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 5.14:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `bg-subtle` #161e20 | normal text | 4.5:1 | 9.09:1 | PASS |
| light | `text-subtle` #606d70 | `surface` #ffffff | normal text | 4.5:1 | 5.36:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `surface` #161e20 | normal text | 4.5:1 | 9.09:1 | PASS |
| light | `text-subtle` #606d70 | `surface-raised` #ffffff | normal text | 4.5:1 | 5.36:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `surface-raised` #263032 | normal text | 4.5:1 | 7.27:1 | PASS |
| light | `text-subtle` #606d70 | `surface-sunken` #eef4f5 | normal text | 4.5:1 | 4.82:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `surface-sunken` #0a1112 | normal text | 4.5:1 | 10.24:1 | PASS |
| light | `text-subtle` #606d70 | `surface-hover` #eef4f5 | normal text | 4.5:1 | 4.82:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `surface-hover` #263032 | normal text | 4.5:1 | 7.27:1 | PASS |
| light | `text` #161e20 | `surface-selected` #e7fcfc | normal text | 4.5:1 | 15.90:1 | PASS |
| dark | `text` #f7fbfc | `surface-selected` #012929 | normal text | 4.5:1 | 14.93:1 | PASS |
| light | `text-muted` #4c595c | `surface-selected` #e7fcfc | normal text | 4.5:1 | 6.82:1 | PASS |
| dark | `text-muted` #dce5e6 | `surface-selected` #012929 | normal text | 4.5:1 | 12.14:1 | PASS |
| light | `text-subtle` #606d70 | `surface-selected` #e7fcfc | normal text | 4.5:1 | 5.03:1 | PASS |
| dark | `text-subtle` #b5c0c2 | `surface-selected` #012929 | normal text | 4.5:1 | 8.36:1 | PASS |
| light | `text-inverse` #f7fbfc | `surface-inverse` #161e20 | normal text | 4.5:1 | 16.25:1 | PASS |
| dark | `text-inverse` #161e20 | `surface-inverse` #f7fbfc | normal text | 4.5:1 | 16.25:1 | PASS |
| light | `accent-fg` #ffffff | `accent` #067f80 | normal text | 4.5:1 | 4.82:1 | PASS |
| dark | `accent-fg` #012929 | `accent` #33cacb | normal text | 4.5:1 | 7.74:1 | PASS |
| light | `accent-fg` #ffffff | `accent-hover` #046768 | normal text | 4.5:1 | 6.68:1 | PASS |
| dark | `accent-fg` #012929 | `accent-hover` #71ddde | normal text | 4.5:1 | 9.70:1 | PASS |
| light | `accent-fg` #ffffff | `accent-active` #005455 | normal text | 4.5:1 | 8.75:1 | PASS |
| dark | `accent-fg` #012929 | `accent-active` #a5ebeb | normal text | 4.5:1 | 11.61:1 | PASS |
| light | `accent-text` #046768 | `bg` #ffffff | normal text | 4.5:1 | 6.68:1 | PASS |
| dark | `accent-text` #71ddde | `bg` #0a1112 | normal text | 4.5:1 | 11.89:1 | PASS |
| light | `accent-text` #046768 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 6.41:1 | PASS |
| dark | `accent-text` #71ddde | `bg-subtle` #161e20 | normal text | 4.5:1 | 10.56:1 | PASS |
| light | `accent-text` #046768 | `surface` #ffffff | normal text | 4.5:1 | 6.68:1 | PASS |
| dark | `accent-text` #71ddde | `surface` #161e20 | normal text | 4.5:1 | 10.56:1 | PASS |
| light | `accent-text` #046768 | `surface-raised` #ffffff | normal text | 4.5:1 | 6.68:1 | PASS |
| dark | `accent-text` #71ddde | `surface-raised` #263032 | normal text | 4.5:1 | 8.44:1 | PASS |
| light | `accent-text` #046768 | `accent-subtle` #e7fcfc | normal text | 4.5:1 | 6.27:1 | PASS |
| dark | `accent-text` #71ddde | `accent-subtle` #012929 | normal text | 4.5:1 | 9.70:1 | PASS |
| light | `accent-text` #046768 | `accent-subtle-hover` #cdf6f6 | normal text | 4.5:1 | 5.76:1 | PASS |
| dark | `accent-text` #71ddde | `accent-subtle-hover` #013f40 | normal text | 4.5:1 | 7.33:1 | PASS |
| light | `accent-text` #046768 | `surface-selected` #e7fcfc | normal text | 4.5:1 | 6.27:1 | PASS |
| dark | `accent-text` #71ddde | `surface-selected` #012929 | normal text | 4.5:1 | 9.70:1 | PASS |
| light | `success-text` #0a6b36 | `success-subtle` #eefbf1 | normal text | 4.5:1 | 6.22:1 | PASS |
| dark | `success-text` #8ddda3 | `success-subtle` #082a14 | normal text | 4.5:1 | 9.62:1 | PASS |
| light | `success-text` #0a6b36 | `surface` #ffffff | normal text | 4.5:1 | 6.63:1 | PASS |
| dark | `success-text` #8ddda3 | `surface` #161e20 | normal text | 4.5:1 | 10.48:1 | PASS |
| light | `success-text` #0a6b36 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 6.36:1 | PASS |
| dark | `success-text` #8ddda3 | `bg-subtle` #161e20 | normal text | 4.5:1 | 10.48:1 | PASS |
| light | `success-fg` #ffffff | `success` #098141 | normal text | 4.5:1 | 4.97:1 | PASS |
| dark | `success-fg` #082a14 | `success` #5ec780 | normal text | 4.5:1 | 7.37:1 | PASS |
| light | `success` #098141 | `surface` #ffffff | UI / large | 3:1 | 4.97:1 | PASS |
| dark | `success` #5ec780 | `surface` #161e20 | UI / large | 3:1 | 8.03:1 | PASS |
| light | `warning-text` #6a4406 | `warning-subtle` #fff7ee | normal text | 4.5:1 | 8.10:1 | PASS |
| dark | `warning-text` #fec57c | `warning-subtle` #362001 | normal text | 4.5:1 | 9.89:1 | PASS |
| light | `warning-text` #6a4406 | `surface` #ffffff | normal text | 4.5:1 | 8.60:1 | PASS |
| dark | `warning-text` #fec57c | `surface` #161e20 | normal text | 4.5:1 | 10.87:1 | PASS |
| light | `warning-text` #6a4406 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 8.25:1 | PASS |
| dark | `warning-text` #fec57c | `bg-subtle` #161e20 | normal text | 4.5:1 | 10.87:1 | PASS |
| light | `warning-fg` #ffffff | `warning` #9d6602 | normal text | 4.5:1 | 4.84:1 | PASS |
| dark | `warning-fg` #362001 | `warning` #fbab30 | normal text | 4.5:1 | 8.04:1 | PASS |
| light | `warning` #9d6602 | `surface` #ffffff | UI / large | 3:1 | 4.84:1 | PASS |
| dark | `warning` #fbab30 | `surface` #161e20 | UI / large | 3:1 | 8.84:1 | PASS |
| light | `error-text` #a12226 | `error-subtle` #fff4f3 | normal text | 4.5:1 | 7.03:1 | PASS |
| dark | `error-text` #feb0a9 | `error-subtle` #40100f | normal text | 4.5:1 | 9.24:1 | PASS |
| light | `error-text` #a12226 | `surface` #ffffff | normal text | 4.5:1 | 7.58:1 | PASS |
| dark | `error-text` #feb0a9 | `surface` #161e20 | normal text | 4.5:1 | 9.67:1 | PASS |
| light | `error-text` #a12226 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 7.27:1 | PASS |
| dark | `error-text` #feb0a9 | `bg-subtle` #161e20 | normal text | 4.5:1 | 9.67:1 | PASS |
| light | `error-fg` #ffffff | `error` #c1292e | normal text | 4.5:1 | 5.79:1 | PASS |
| dark | `error-fg` #40100f | `error` #fd867e | normal text | 4.5:1 | 6.84:1 | PASS |
| light | `error` #c1292e | `surface` #ffffff | UI / large | 3:1 | 5.79:1 | PASS |
| dark | `error` #fd867e | `surface` #161e20 | UI / large | 3:1 | 7.16:1 | PASS |
| light | `info-text` #1c59a0 | `info-subtle` #f2f7ff | normal text | 4.5:1 | 6.54:1 | PASS |
| dark | `info-text` #a3cafd | `info-subtle` #0c233f | normal text | 4.5:1 | 9.36:1 | PASS |
| light | `info-text` #1c59a0 | `surface` #ffffff | normal text | 4.5:1 | 7.03:1 | PASS |
| dark | `info-text` #a3cafd | `surface` #161e20 | normal text | 4.5:1 | 10.01:1 | PASS |
| light | `info-text` #1c59a0 | `bg-subtle` #f7fbfc | normal text | 4.5:1 | 6.75:1 | PASS |
| dark | `info-text` #a3cafd | `bg-subtle` #161e20 | normal text | 4.5:1 | 10.01:1 | PASS |
| light | `info-fg` #ffffff | `info` #226bc0 | normal text | 4.5:1 | 5.34:1 | PASS |
| dark | `info-fg` #0c233f | `info` #75b1fd | normal text | 4.5:1 | 7.13:1 | PASS |
| light | `info` #226bc0 | `surface` #ffffff | UI / large | 3:1 | 5.34:1 | PASS |
| dark | `info` #75b1fd | `surface` #161e20 | UI / large | 3:1 | 7.63:1 | PASS |
| light | `error-fg` #ffffff | `error-hover` #a12226 | normal text | 4.5:1 | 7.58:1 | PASS |
| dark | `error-fg` #40100f | `error-hover` #feb0a9 | normal text | 4.5:1 | 9.24:1 | PASS |
| light | `border-strong` #828f91 | `bg` #ffffff | UI / large | 3:1 | 3.34:1 | PASS |
| dark | `border-strong` #828f91 | `bg` #0a1112 | UI / large | 3:1 | 5.71:1 | PASS |
| light | `border-strong` #828f91 | `bg-subtle` #f7fbfc | UI / large | 3:1 | 3.21:1 | PASS |
| dark | `border-strong` #828f91 | `bg-subtle` #161e20 | UI / large | 3:1 | 5.07:1 | PASS |
| light | `border-strong` #828f91 | `surface` #ffffff | UI / large | 3:1 | 3.34:1 | PASS |
| dark | `border-strong` #828f91 | `surface` #161e20 | UI / large | 3:1 | 5.07:1 | PASS |
| light | `border-strong` #828f91 | `surface-raised` #ffffff | UI / large | 3:1 | 3.34:1 | PASS |
| dark | `border-strong` #828f91 | `surface-raised` #263032 | UI / large | 3:1 | 4.05:1 | PASS |
| light | `border-strong` #828f91 | `surface-sunken` #eef4f5 | UI / large | 3:1 | 3.01:1 | PASS |
| dark | `border-strong` #828f91 | `surface-sunken` #0a1112 | UI / large | 3:1 | 5.71:1 | PASS |
| light | `border-strong` #828f91 | `surface-hover` #eef4f5 | UI / large | 3:1 | 3.01:1 | PASS |
| dark | `border-strong` #828f91 | `surface-hover` #263032 | UI / large | 3:1 | 4.05:1 | PASS |
| light | `focus-ring` #067f80 | `bg` #ffffff | UI / large | 3:1 | 4.82:1 | PASS |
| dark | `focus-ring` #33cacb | `bg` #0a1112 | UI / large | 3:1 | 9.49:1 | PASS |
| light | `focus-ring` #067f80 | `bg-subtle` #f7fbfc | UI / large | 3:1 | 4.63:1 | PASS |
| dark | `focus-ring` #33cacb | `bg-subtle` #161e20 | UI / large | 3:1 | 8.42:1 | PASS |
| light | `focus-ring` #067f80 | `surface` #ffffff | UI / large | 3:1 | 4.82:1 | PASS |
| dark | `focus-ring` #33cacb | `surface` #161e20 | UI / large | 3:1 | 8.42:1 | PASS |
| light | `focus-ring` #067f80 | `surface-raised` #ffffff | UI / large | 3:1 | 4.82:1 | PASS |
| dark | `focus-ring` #33cacb | `surface-raised` #263032 | UI / large | 3:1 | 6.74:1 | PASS |
| light | `focus-ring` #067f80 | `surface-sunken` #eef4f5 | UI / large | 3:1 | 4.34:1 | PASS |
| dark | `focus-ring` #33cacb | `surface-sunken` #0a1112 | UI / large | 3:1 | 9.49:1 | PASS |
| light | `focus-ring` #067f80 | `surface-hover` #eef4f5 | UI / large | 3:1 | 4.34:1 | PASS |
| dark | `focus-ring` #33cacb | `surface-hover` #263032 | UI / large | 3:1 | 6.74:1 | PASS |
| light | `focus-ring` #067f80 | `surface-selected` #e7fcfc | UI / large | 3:1 | 4.53:1 | PASS |
| dark | `focus-ring` #33cacb | `surface-selected` #012929 | UI / large | 3:1 | 7.74:1 | PASS |
| light | `text-on-emphasis` #f7fbfc | `surface-emphasis` #161e20 | normal text | 4.5:1 | 16.25:1 | PASS |
| dark | `text-on-emphasis` #f7fbfc | `surface-emphasis` #012929 | normal text | 4.5:1 | 14.93:1 | PASS |
| light | `focus-ring-emphasis` #71ddde | `surface-emphasis` #161e20 | UI / large | 3:1 | 10.56:1 | PASS |
| dark | `focus-ring-emphasis` #71ddde | `surface-emphasis` #012929 | UI / large | 3:1 | 9.70:1 | PASS |
| light | `accent` #067f80 | `surface-emphasis` #161e20 | UI / large | 3:1 | 3.51:1 | PASS |
| dark | `accent` #33cacb | `surface-emphasis` #012929 | UI / large | 3:1 | 7.74:1 | PASS |
| light | `accent` #067f80 | `surface` #ffffff | UI / large | 3:1 | 4.82:1 | PASS |
| dark | `accent` #33cacb | `surface` #161e20 | UI / large | 3:1 | 8.42:1 | PASS |
| light | `accent` #067f80 | `bg-subtle` #f7fbfc | UI / large | 3:1 | 4.63:1 | PASS |
| dark | `accent` #33cacb | `bg-subtle` #161e20 | UI / large | 3:1 | 8.42:1 | PASS |
| light | `accent` #067f80 | `surface-selected` #e7fcfc | UI / large | 3:1 | 4.53:1 | PASS |
| dark | `accent` #33cacb | `surface-selected` #012929 | UI / large | 3:1 | 7.74:1 | PASS |

144 pairs checked, 144 pass, 0 fail. Exempt by design: `text-disabled` (disabled controls), `border` (decorative hairline), `*-border` tints (decorative; each is paired with text or an icon that passes).
