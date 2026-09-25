# ZeroLatency DS — components and patterns

Reference for the Next.js + Tailwind build. Tokens: `tokens.json` → `handoff/tokens.css` (generated). Reference styles: `handoff/components.css` (`zl-*` classes). Live previews: the Design System artifact (see `design-system-link.txt`) and `handoff/previews/*/preview.html`.

**Shared rules**
- Source: every size, colour and behaviour here was measured from the 200 reference app frames (`ScreenShotFrames100/`, `ScreenShotFrames200/`); see `frame-audit.md`. Names, copy, icons and data are ZeroLatency's own.
- Focus-visible everywhere: `outline: 2px solid var(--focus-ring); outline-offset: 2px` (rows, menu and sidebar items: inset, offset -2px). Inputs show a 1px `focus-ring` border plus a 3px `focus-halo`.
- Motion: hover fills `duration-fast`; menus/panels enter `duration-slow` + `ease-enter`. Under `prefers-reduced-motion: reduce` only opacity fades remain.
- Colour carries meaning only together with text or a distinct glyph shape. Blue means "act" or "on"; everything else is gray plus soft label inks.
- Touch targets ≥ 44px on mobile (pad rows; use lg/xl controls).

**Contents**
- Components (27): Button, Input, Select, Checkbox, Toggle, Tag, Status, ThreadRow, GroupHeading, EmptyState, Sidebar, ViewHeader, Tabs, Menu, FilterEditor, Tooltip, Toast, SettingsModal, HoverPreview, ThreadView, Composer, SidePanel, PropertyEditor, OptionList, TemplateCard, AppShell, Card
- Patterns (9): NavBar, Hero, FeatureGrid, ScreenshotFrame, Testimonial, Pricing, FAQ, CTABand, Footer

---

# Components

## Button

Triggers an action; one blue primary per region, everything else secondary, ghost, text or icon.

- **Anatomy:** Container (28px, radius-md; sm 24 · lg 32 · xl 40 for marketing) · optional 16px leading icon · label (text-md 500; 400 for secondary/ghost/text) · Split variant adds a 24px chevron segment divided by a 1px `accent-active` seam.
- **Variants:** primary (`accent` fill: Send, Save, Continue) · secondary (`surface-raised` + `shadow-sm` ring: Auto label, Open, Add property) · ghost (text-muted, fill on hover) · text (text-subtle, no fill until hover: Reset, Cc/Bcc) · danger (danger-text: Delete view) · icon (square, text-subtle; `aria-pressed="true"` turns it `accent`, as the active Filter tool) · split (Send ▾, Save ▾).
- **States:** default · hover (`accent-hover` / `surface-hover`) · pressed (`accent-active` / `surface-selected`) · focus-visible (2px `focus-ring`, 2px offset) · busy (`aria-busy`, spinner + present participle: "Sending") · disabled (`text-disabled`, primary keeps a `surface-hover` fill).
- **Tokens:** `accent`, `accent-hover`, `accent-active`, `accent-fg`, `surface-raised`, `surface-hover`, `surface-selected`, `text`, `text-muted`, `text-subtle`, `text-disabled`, `danger-text`, `danger-subtle`, `focus-ring`, `shadow-sm`, `radius-md`, `size-control-height*`, `text-md`, `duration-fast`.
- **Accessibility:** `<button>` for actions, `<a>` for navigation. Icon-only buttons need `aria-label` and should show a Tooltip with the shortcut. Toggle tools use `aria-pressed`. The split chevron is its own button with its own label ("Schedule send").
- **Do:** Use sentence-case verbs: "Send", "Save", "Auto label", "Delete view". Keep one primary per panel or menu footer.
- **Don't:** Don't put two primaries side by side. Don't use blue for anything that isn't the main action or an "on" state. Don't add borders; the secondary edge is the shadow ring.

## Input

Filled, borderless text field that gains a blue edge and halo on focus.

- **Anatomy:** Optional label (text-sm 500, text-muted) · control (28px, 34px for `--lg` names; radius-md; `surface-input` fill; 1px transparent border) · optional leading 16px icon (search) · hint (text-xs, text-subtle) or error (text-xs, danger-text).
- **Variants:** md 28px (menu search: "Filter by…", "Search grouping options…") · lg 34px (view and property names) · with leading icon · textarea.
- **States:** default · hover (`border` edge) · focus (1px `focus-ring` border + 3px `focus-halo`, fill turns `bg`) · invalid (`aria-invalid`, `danger` edge + message) · disabled (`text-disabled`).
- **Tokens:** `surface-input`, `bg`, `border`, `focus-ring`, `focus-halo`, `text`, `text-placeholder`, `text-subtle`, `danger`, `danger-text`, `radius-md`, `size-control-height`, `text-md`.
- **Accessibility:** Every field needs a label: visible, or `aria-label` for menu search boxes whose purpose the placeholder states. Placeholders use `text-placeholder` (below 4.5:1 by design), so never put required information only in the placeholder. Link errors with `aria-describedby`.
- **Do:** Autofocus the search field when a menu opens. Filter as the user types.
- **Don't:** Don't add a resting border; the fill is the affordance. Don't use red alone for errors.

## Select

Pick one value: an inline ghost trigger that opens a Menu with a check on the current value.

- **Anatomy:** Trigger (28px, text-muted value + 12px chevron, no fill until hover) · Menu listbox (`zl-menu`, items 28px, check on the selected item) · native `<select>` alternative styled like Input.
- **Variants:** inline trigger (settings rows: Theme mode, Thread style, Auto-advance, Font size) · native select (forms).
- **States:** closed · hover (`surface-hover`) · open (`aria-expanded="true"`, keeps hover fill) · focus-visible · option hover/selected (`surface-hover`, trailing check).
- **Tokens:** `text-muted`, `text-subtle`, `surface-hover`, `surface-raised`, `shadow-md`, `radius-md`, `radius-xl`.
- **Accessibility:** Trigger: `aria-haspopup="listbox"` + `aria-expanded`. Options: `role="option"` + `aria-selected`. Arrow keys move, Enter picks, Esc closes and returns focus.
- **Do:** Right-align the trigger in a settings row, value first then chevron.
- **Don't:** Don't use it for more than ~8 options without a search field (use Menu with search).

## Checkbox

14px box for bulk selection and boolean properties.

- **Anatomy:** Hidden native input · 14px box (radius-xs, 1px `border-strong`) · white check on `accent` when checked · optional label.
- **Variants:** unchecked · checked · mixed (select-all with some rows chosen) · in-row (hidden until the row is hovered, focused or checked).
- **States:** default · hover · focus-visible · checked · mixed · disabled.
- **Tokens:** `border-strong`, `accent`, `accent-fg`, `bg`, `surface-hover`, `text-disabled`, `radius-xs`, `size-checkbox-size`.
- **Accessibility:** Keep the native input for keyboard and screen readers; in-row checkboxes stay in the tab order even while visually hidden (they reveal on focus). The header box uses the mixed state (`indeterminate`).
- **Do:** Put the select-all box in the view header, aligned with the row boxes.
- **Don't:** Don't use a checkbox to trigger an immediate action (use a Toggle or Button).

## Toggle

Switch for settings that apply immediately.

- **Anatomy:** Track 30×18 (`border-strong` off, `accent` on) · 14px white knob with `shadow-xs` · sits at the right of a settings row (title 14/500 + description 12 text-subtle).
- **Variants:** off · on · disabled.
- **States:** default · hover · focus-visible · on · disabled.
- **Tokens:** `border-strong`, `accent`, `gray-0`, `shadow-xs`, `surface-selected`, `radius-full`, `duration-base`.
- **Accessibility:** `role="switch"` + `aria-checked`, labelled by the row title. Space toggles.
- **Do:** Save instantly; no Save button in a settings pane.
- **Don't:** Don't use for choices with more than two values (use Select).

## Tag

Label chip: pastel fill with dark ink of the same hue, in nine inks.

- **Anatomy:** 20px chip · radius-sm (4px) · padding 0 6px · text-xs 500 · truncates at 132px with an ellipsis · overflow count "+N" in text-subtle.
- **Variants:** gray (default) · brown · orange · yellow · green · blue · purple · pink · red · accent (AI suggestion, "Included").
- **States:** static. Editable tags open a Menu (see PropertyEditor).
- **Tokens:** `tag-{ink}-bg`, `tag-{ink}-fg`, `accent-subtle`, `accent-text`, `text-subtle`, `radius-sm`, `size-chip-height`, `text-xs`.
- **Accessibility:** Every fg/bg pair passes 4.5:1 in both themes. Colour is never the only signal: the chip always carries its word.
- **Do:** Let people pick the ink per label; default new labels to gray. Show at most two chips per row, then "+N".
- **Don't:** Don't use solid saturated fills. Don't put icons inside label chips.

## Status

Status property pill: a 14px state glyph plus its word.

- **Anatomy:** 20px pill (radius-full) · glyph (dashed ring, play, check or cross in a filled circle) · label (text-md).
- **Variants:** Not started (no fill, dashed `icon-gray` ring; the default) · In progress (blue) · Done (green) · Canceled (red).
- **States:** static in rows; opens the PropertyEditor menu when clicked.
- **Tokens:** `tag-blue-*`, `tag-green-*`, `tag-red-*`, `icon-gray`, `icon-blue`, `icon-green`, `icon-red`, `radius-full`.
- **Accessibility:** The word carries the state; the glyph is `aria-hidden`. Glyph shapes differ, so the set still reads in greyscale.
- **Do:** Keep the four default options; let people rename them in Edit property.
- **Don't:** Don't show the glyph without the word.

## ThreadRow

One conversation in a view: sender, subject, label chips and time on a single 38px line.

- **Anatomy:** Grid: 20px checkbox · 8px unread dot (6px `accent`) · sender (≤200px, + thread count in `text-placeholder`) · subject (can start with an emoji) · meta (label chips, paperclip) · time (text-sm, text-subtle, tabular). Hover replaces the time with hover actions: Archive, Trash, Read/unread, Remind, Label.
- **Variants:** unread (dot + 600 weight on sender and subject) · read (400) · compact (32px) · simple (no sender column, used when grouped by sender) · with snippet ("· preview text" in text-subtle).
- **States:** default · hover (`surface-hover`, checkbox + actions appear) · selected/open (`surface-selected`) · checked · focus-visible (inset ring).
- **Tokens:** `surface-hover`, `surface-selected`, `accent`, `text`, `text-subtle`, `text-placeholder`, `radius-md`, `size-row-height`, `size-unread-dot`, `text-md`, `text-sm`.
- **Accessibility:** List is `role="listbox"`, rows `role="option"` with `aria-selected`. Unread is announced through weight AND an sr-only "Unread" in production. Hover actions are also reachable by keyboard (e archive, # trash, u read, h remind, l label) and appear on focus.
- **Do:** Truncate sender and subject with an ellipsis; keep time right-aligned.
- **Don't:** Don't add avatars or preview lines by default; the row stays one line.

## GroupHeading

Section header inside a view: a date bucket or a sender/domain group.

- **Anatomy:** 40px row · text-md 500 · aligned with the sender column (44px inset) · 1px `border` rule below · optional monogram for sender groups · hover actions "Collapse" and "Remove" (text buttons).
- **Variants:** date (Today, Yesterday, Last 7 days, March…) · keyword/sender (monogram + address) · property (status, label).
- **States:** default · hover (actions fade in) · collapsed.
- **Tokens:** `text`, `text-subtle`, `border`, `size-avatar-size`, `duration-fast`.
- **Accessibility:** Use `role="presentation"` inside the listbox, or group rows with `role="group"` + `aria-label`. Collapse is a real button with `aria-expanded`.
- **Do:** Leave a space-2 gap above each heading so groups breathe.
- **Don't:** Don't use boxes or cards for groups; a hairline is enough.

## EmptyState

Centred, quiet message for an empty view or a filter with no results.

- **Anatomy:** Optional 20px icon (`text-placeholder`) · optional title (text-md 500) · one line (text-sm, text-subtle).
- **Variants:** no results ("No filter results") · empty view (title + one line).
- **States:** static.
- **Tokens:** `text`, `text-subtle`, `text-placeholder`, `space-12`.
- **Accessibility:** Announce with `role="status"` when it replaces results after filtering.
- **Do:** Say what will appear here and when.
- **Don't:** No illustrations, confetti or inbox-zero celebration.

## Sidebar

Left navigation: account, search, the user's views, mail folders and footer tools.

- **Anatomy:** 240px column on `bg-sidebar`, padding 8px · account row (20px avatar, name 14/500, email 12 subtle, switch chevron, compose icon) · Search item · "Views" section label with + (new view) · view items (30px, radius-md, 18px coloured filled glyph, label, count) · nested items for grouped views (26px inset, monogram) · "Less/More" toggle · "Mail" section (line icons: All mail, Sent, Drafts, Spam, Trash) · footer icon row (settings, calendar, help).
- **Variants:** expanded · collapsed (hidden; the viewbar shows an expand button) · with nested group items.
- **States:** item: default · hover (`surface-hover`) · current (`surface-selected`, 500 weight) · focus-visible (inset ring) · dragging (reorder).
- **Tokens:** `bg-sidebar`, `surface-hover`, `surface-selected`, `text`, `text-muted`, `text-subtle`, `icon-*`, `radius-md`, `size-sidebar-width`, `size-nav-item-height`, `text-md`, `text-xs`.
- **Accessibility:** `<nav aria-label="Mailbox">`; the current view has `aria-current="page"`. Counts are unread counts: expose them in the accessible name ("Inbox, 4 unread"). View icons are decorative.
- **Do:** Give each view one ink and one glyph; let people reorder by drag.
- **Don't:** Don't colour the selected item blue; selection is a gray fill.

## ViewHeader

The 44px toolbar above a view: select-all, view name and the view tools.

- **Anatomy:** Select-all checkbox · view glyph + name (text-md 500) · right cluster: "Auto label" secondary button, Filter (turns `accent` when filters apply), Group by, Edit view (gear), Refresh — all 28px icon buttons with tooltips.
- **Variants:** default · filtered (Filter icon `aria-pressed`) · with sidebar collapsed (leading expand button).
- **States:** tools: default · hover · pressed/open · focus-visible.
- **Tokens:** `bg`, `text`, `text-subtle`, `accent`, `surface-raised`, `shadow-sm`, `size-header-height`.
- **Accessibility:** Each icon tool has an `aria-label` and a Tooltip that shows its shortcut (Filter: Ctrl F, Edit view: Ctrl E).
- **Do:** Open Filter and Group by as anchored Menus; open Edit view as a SidePanel.
- **Don't:** Don't add a page title above it; the view name is the title.

## Tabs

Small underline tabs for switching panes inside a popover (Emojis / Icons / Upload).

- **Anatomy:** Tab list with a 1px `border` baseline · tab (text-sm, text-subtle) · selected tab (text, 500, 2px underline in `text`).
- **Variants:** popover tabs (default).
- **States:** default · hover (text) · selected · focus-visible.
- **Tokens:** `text`, `text-subtle`, `border`, `text-sm`.
- **Accessibility:** `role="tablist"`, tabs `role="tab"` with `aria-selected`; arrow keys move between tabs.
- **Do:** Keep labels to one word.
- **Don't:** Don't use blue for the selected tab; ink only.

## Menu

Floating list anchored to a trigger: filters, group-by options, new-view choices, property options.

- **Anatomy:** 300px (340 wide) · `surface-raised`, radius-xl, `shadow-md`, padding 6px · optional title row · optional search Input at the top · section labels (text-xs 500 subtle: "Applied", "Suggested views") · items (28px, radius-md, 16px icon + label + trailing hint/chevron/check) · two-line items (44px: label + text-xs description) · 1px separators bleeding to the edges · optional footer (Reset + split Save).
- **Variants:** filter menu (applied filters with value hints, then available fields; "(Gmail)" marks provider categories in `text-placeholder`) · group-by menu (two-line items, check on the current grouping) · action menu (New view) · listbox (Select).
- **States:** item: default · hover/active-descendant (`surface-hover`) · selected (check) · disabled · focus-visible.
- **Tokens:** `surface-raised`, `shadow-md`, `surface-hover`, `border`, `text`, `text-muted`, `text-subtle`, `text-placeholder`, `radius-xl`, `radius-md`, `size-popover-width`, `size-menu-item-height`, `size-menu-item-2line-height`.
- **Accessibility:** Menus of actions: `role="menu"`/`menuitem`; pickers: `role="listbox"`/`option`; with a search field use the combobox pattern (`aria-activedescendant`). Esc closes and returns focus to the trigger.
- **Do:** Autofocus search; filter live; keep the hint short ("is not", "contains …").
- **Don't:** Don't nest more than one level; a sub-step replaces the menu content with a back arrow (see FilterEditor).

## FilterEditor

The second step of a filter menu: edit one condition, confirm with Save.

- **Anatomy:** Menu shell · title row (back arrow, field name, operator dropdown "contains ▾", delete icon) · Input ("Add new entry") · matching entries with monogram and check · footer: Reset (text) and split Save (primary).
- **Variants:** text condition (contains / does not contain) · pick-from-list (mailboxes with checkboxes) · date range.
- **States:** empty · typing (suggestions) · entries checked · saving.
- **Tokens:** Menu tokens + `accent`, `accent-fg`, `text-subtle`.
- **Accessibility:** Back returns to the field list without losing edits. Save applies and closes; Esc discards.
- **Do:** Show the applied value as a hint on the parent menu row.
- **Don't:** Don't apply until Save.

## Tooltip

Dark label for icon buttons, with an optional shortcut line.

- **Anatomy:** `surface-tooltip` fill, radius-md, padding 5×8 · title (text-xs 500, `text-on-tooltip`) · shortcut (text-2xs, `text-on-tooltip-muted`).
- **Variants:** label only · label + shortcut.
- **States:** appears after 500ms hover or on focus; hides on Esc/blur.
- **Tokens:** `surface-tooltip`, `text-on-tooltip`, `text-on-tooltip-muted`, `radius-md`, `shadow-md`, `text-xs`, `text-2xs`.
- **Accessibility:** `role="tooltip"` referenced by the trigger's `aria-describedby`. Never put essential info only in a tooltip.
- **Do:** Show shortcuts the way the platform writes them (Ctrl F / ⌘F).
- **Don't:** Don't use on text buttons that already say what they do.

## Toast

Small dark status message at the bottom-left, with Undo where possible.

- **Anatomy:** 32px min height · `surface-tooltip` fill, radius-md, `shadow-lg` · optional 12px spinner · message (text-sm) · optional underlined action.
- **Variants:** progress ("Message sending") · result with Undo ("Archived 3 threads").
- **States:** enter (fade, `duration-slow`) · visible 4–6s · exit.
- **Tokens:** `surface-tooltip`, `text-on-tooltip`, `shadow-lg`, `radius-md`, `text-sm`.
- **Accessibility:** `role="status"` (polite). Undo stays reachable by keyboard while visible; pause the timer on hover/focus.
- **Do:** Say what happened in past tense with a number.
- **Don't:** Don't stack more than one; replace the previous toast.

## SettingsModal

Large settings dialog: section navigation on the left, setting rows on the right.

- **Anatomy:** Scrim (`overlay`) · dialog (max 1050px, 32px inset from the viewport, radius-2xl, `shadow-xl`) · left nav 250px on `bg-sidebar` with section labels (Account, Workspace) and 28px items (external links end with an arrow) · content: title (text-base 600) over a hairline, then setting rows (title 14/500 + description 12 subtle, control on the right: inline Select, Toggle or secondary Button).
- **Variants:** Inbox (theme, thread style, auto-advance, font size) · AI · Gmail filters · Snippets · Signature (toggles + "Open") · Manage account.
- **States:** open · section switch (content swaps, no animation) · closed.
- **Tokens:** `overlay`, `bg`, `bg-sidebar`, `border`, `shadow-xl`, `radius-2xl`, `size-modal-max-width`, `size-modal-inset`, `size-settings-nav-width`.
- **Accessibility:** `role="dialog"` + `aria-modal`, labelled by the section title; focus trapped; Esc closes and restores focus to Settings.
- **Do:** Apply every change immediately.
- **Don't:** Don't add Save/Cancel buttons.

## HoverPreview

Read-only peek at a message body when hovering a row's subject.

- **Anatomy:** 320×≤220 card · `surface-raised`, radius-lg, `shadow-lg` · the message rendered at text-xs, clipped.
- **Variants:** plain text · HTML email (scaled down).
- **States:** appears after a 600ms hover delay; disappears on leave.
- **Tokens:** `surface-raised`, `shadow-lg`, `radius-lg`, `text-xs`.
- **Accessibility:** Pointer-only enhancement; keyboard users open the thread instead. `aria-hidden` on the card.
- **Do:** Anchor under the pointer, inside the viewport.
- **Don't:** Don't make anything inside it interactive.

## ThreadView

An open thread in side peek, centre peek or full page.

- **Anatomy:** 44px bar (close peek », previous/next, "Auto label similar" secondary, then Remind, Mark unread, Label, Archive, Trash, More) · title (text-xl 700) · property row (label chips, status, "Add …" text buttons) · message header (sender 500, "To …" text-sm subtle, date right) · body (text-base, 1.6 leading, ≤62ch).
- **Variants:** side peek (right half, resizable, `border` on the left) · centre peek (modal) · full page — set in Settings › Thread style.
- **States:** loading · loaded · property being edited (Menu/Input anchored under the chip).
- **Tokens:** `bg`, `border`, `text`, `text-subtle`, `text-placeholder`, `text-xl`, `text-base`, `size-header-height`.
- **Accessibility:** Peek is a `region` labelled by the subject; j/k move between threads; Esc closes and returns focus to the row.
- **Do:** Keep the list visible beside a side peek; highlight the open row with `surface-selected`.
- **Don't:** Don't repeat labels in the body area.

## Composer

Floating compose window anchored bottom-right.

- **Anatomy:** 600px card, radius-2xl, `shadow-lg` · head (sender name + address in subtle, minimise, close) · recipients line (chips with ×, inline input, "Cc/Bcc" text button) · subject line · body (hairline above) · foot: split Send (primary; chevron schedules), "Draft saved" in `text-placeholder`, discard (trash) at the right.
- **Variants:** new message · reply (in-thread) · minimised (head only).
- **States:** editing · draft saved · sending (Toast) · error.
- **Tokens:** `surface-raised`, `shadow-lg`, `surface-hover`, `border`, `text`, `text-subtle`, `text-placeholder`, `accent`, `radius-2xl`, `size-composer-width`.
- **Accessibility:** `role="dialog"` (non-modal) labelled "New message"; Cmd/Ctrl+Enter sends; recipient chips have labelled remove buttons.
- **Do:** Autosave and say so quietly.
- **Don't:** Don't block the list behind it.

## SidePanel

400px right panel for configuring a view: Edit view, Properties, Add property.

- **Anatomy:** Head (optional back arrow, title text-md 600, close/collapse) · name row (30px icon tile + lg Input) · section labels (text-sm 500 subtle) · rows (icon, title + one-line description, chevron) · property rows (drag handle, icon, name, eye toggle, chevron) grouped "Shown in view" / "Hidden in view" · type rows (34px icon tile, name + description, + on hover) · footer action (Delete view, danger).
- **Variants:** Edit view · Properties · Add property · Edit property (see PropertyEditor) · Hover actions.
- **States:** row hover (`surface-hover`) · dragging · focus-visible.
- **Tokens:** `bg`, `border`, `surface-hover`, `shadow-sm`, `text`, `text-subtle`, `text-placeholder`, `danger-text`, `radius-md`, `size-panel-width`.
- **Accessibility:** `<aside>` labelled by its title; steps move focus to the new title; Esc closes. Drag handles have a keyboard alternative (move up/down).
- **Do:** Replace panel content for sub-steps and keep a back arrow.
- **Don't:** Don't stack panels.

## PropertyEditor

Pick or edit the options of a select/status property.

- **Anatomy:** Menu: current value on top, "Select an option" label, options as Status/Tag pills (DEFAULT marker in 11px caps), "Edit property" item · Edit property panel: name Input, "Options" label with +, option rows with chevron, then Hide / Delete property actions.
- **Variants:** status (four fixed states) · select · multi-select.
- **States:** option hover · default option · renaming.
- **Tokens:** Menu and SidePanel tokens + `tag-*`, `icon-*`, `text-2xs`.
- **Accessibility:** Options are `role="option"`; the DEFAULT marker is text, not colour.
- **Do:** Mark the default option in words.
- **Don't:** Don't let two options share an ink in the same property.

## OptionList

Include/exclude choices during setup, each row a toggle button with a state chip.

- **Anatomy:** Question (text-md 600) + helper line · stack of 32px rows (radius-md, `shadow-sm` ring; included rows get an `accent-border` ring) with glyph, label and a chip ("Included" accent / "Excluded" gray) · full-width primary "Continue".
- **Variants:** include/exclude (default) · single choice.
- **States:** included · excluded · hover · focus-visible.
- **Tokens:** `bg`, `shadow-sm`, `accent-border`, `accent-subtle`, `accent-text`, `tag-gray-*`, `accent`.
- **Accessibility:** Each row is a `button` with `aria-pressed`; the chip states the value in words.
- **Do:** Preview the result live next to the list.
- **Don't:** Don't use checkboxes and chips together; the row is the control.

## TemplateCard

A view template in the gallery: tinted miniature, glyph, name and one-line purpose.

- **Anatomy:** 136px art (radius-lg, `tag-{ink}-bg` wash with a white mini-window showing sample chips) · glyph (16px, matching ink) · name (text-md 500) · description (text-xs subtle).
- **Variants:** Sales · Support · Calendar · Priority · Categories · Travel · Social · Newsletters… (one ink each).
- **States:** default · hover (`shadow-md`) · focus-visible.
- **Tokens:** `tag-*-bg`, `icon-*`, `bg`, `surface-selected`, `shadow-sm`, `shadow-md`, `radius-lg`.
- **Accessibility:** Each card is one button whose name is the template name; the art is decorative.
- **Do:** Show real-looking chips in the miniature so the result is obvious.
- **Don't:** Don't use photos or third-party logos in the miniature.

## AppShell

The whole product frame: Sidebar, a view (ViewHeader + thread list) and an optional peek or panel.

- **Anatomy:** Grid: 240px Sidebar · list column · optional ThreadView (side peek) or SidePanel (400px). Below 1024px only the list shows.
- **Variants:** list · list + peek (`zl-app--peek`) · list + panel (`zl-app--panel`).
- **States:** sidebar collapsed · peek open · panel open.
- **Tokens:** `bg`, `bg-sidebar`, `border`, `size-sidebar-width`, `size-panel-width`, `size-header-height`.
- **Accessibility:** Landmarks: `nav` (sidebar), `main` (view), `region`/`aside` (peek/panel). F6 cycles between them.
- **Do:** Use it as the marketing product visual (ScreenshotFrame) with fictional data.
- **Don't:** Don't use real people's names or screenshots of other products.

## Card

Content block for marketing and settings summaries, lifted by a shadow ring rather than a border.

- **Anatomy:** `bg`, radius-xl, `shadow-sm`, padding 24 · optional 32px icon tile on `bg-sidebar` with a coloured glyph · title (text-base 600) · body (text-md, text-muted).
- **Variants:** static · interactive (hover `shadow-md`).
- **States:** default · hover (interactive) · focus-visible.
- **Tokens:** `bg`, `bg-sidebar`, `shadow-sm`, `shadow-md`, `text`, `text-muted`, `radius-xl`.
- **Accessibility:** An interactive card is a single link/button; don't nest buttons inside it.
- **Do:** One idea per card: glyph, title, one sentence.
- **Don't:** No coloured left borders or gradient fills.

---

# Page patterns

## NavBar

Sticky 56px site header: logo, four links, Log in and the primary CTA.

- **Anatomy:** Brand (24px mark + wordmark text) · links (30px, radius-md, text-muted; current in text 500) · ghost "Log in" · primary CTA · hairline below.
- **Variants:** desktop · mobile (links and Log in hidden; add a menu button).
- **States:** link hover (`surface-hover`) · current (`aria-current`).
- **Tokens:** `bg`, `border`, `text`, `text-muted`, `surface-hover`, `accent`, `z-sidebar`.
- **Accessibility:** `<header>` with a `<nav>`; skip link to main content.
- **Do:** Keep the CTA copy identical to the hero's.
- **Don't:** Don't add mega-menus.

## Hero

Centred headline, one sentence, two CTAs and the product itself.

- **Anatomy:** Headline (`display`, 700, ≤15ch) · lead (text-xl, text-muted) · primary xl + ghost xl buttons · note (text-sm, subtle) · AppShell visual cropped at the bottom (radius-2xl top corners, `shadow-xl`).
- **Variants:** desktop · mobile (headline drops to 4xl; buttons full width; visual 320px).
- **States:** static.
- **Tokens:** `text-display`, `text-xl`, `text`, `text-muted`, `text-subtle`, `accent`, `shadow-xl`, `radius-2xl`.
- **Accessibility:** One `h1` per page; the visual is `role="img"` with a description.
- **Do:** Show the real UI (code-built, fictional data).
- **Don't:** No gradients, illustrations or stock photos.

## FeatureGrid

Section head plus a grid of Cards, on the `bg-sidebar` tint.

- **Anatomy:** Eyebrow (text-md 500, accent-text) · h2 (4xl 700) · lead · auto-fit grid of Cards (min 260px).
- **Variants:** 3 or 4 columns; tint or plain background.
- **States:** static.
- **Tokens:** `bg-sidebar`, `accent-text`, `text-4xl`, Card tokens.
- **Accessibility:** Cards use `h3` under the section `h2`.
- **Do:** One glyph ink per card, varied.
- **Don't:** Don't exceed 6 cards.

## ScreenshotFrame

The AppShell inside simple window chrome, for marketing sections.

- **Anatomy:** 32px bar on `bg-sidebar` with three `surface-selected` dots · AppShell below · radius-2xl, `shadow-xl`.
- **Variants:** list · peek · panel (AppShell variants).
- **States:** static.
- **Tokens:** `bg`, `bg-sidebar`, `surface-selected`, `border`, `shadow-xl`, `radius-2xl`.
- **Accessibility:** `role="img"` + `aria-label` describing what is shown.
- **Do:** Use fictional names (Priya Raman, Northwind).
- **Don't:** Never use screenshots of third-party products.

## Testimonial

Quote cards, marked Placeholder until real, approved quotes exist.

- **Anatomy:** Card · quote (text-lg) · avatar initials (32px) · name (500) and role (subtle).
- **Variants:** two- or three-up.
- **States:** static.
- **Tokens:** Card tokens + `text-lg`, `surface-selected`, `text-subtle`.
- **Accessibility:** `<figure>` + `<blockquote>` + `<figcaption>`.
- **Do:** Keep "Placeholder" visible until approved.
- **Don't:** Don't invent names or companies.

## Pricing

Three plan cards; the featured one has a 1.5px accent ring.

- **Anatomy:** Card per plan: name (+ Popular tag), price (3xl 700 + period), one-line description, feature list with accent checks, full-width button.
- **Variants:** monthly · yearly (toggle above, optional).
- **States:** static.
- **Tokens:** Card tokens + `accent`, `tag-blue-*`, `text-3xl`, `border`.
- **Accessibility:** Use a list for features; prices include the period in text.
- **Do:** Mark prices as placeholders until validated.
- **Don't:** Don't use strikethrough discounts.

## FAQ

Native details/summary list with hairline dividers.

- **Anatomy:** Summary (text-base 500) with a chevron · answer (text-md, text-muted, ≤62ch) · `border` rules.
- **Variants:** first open · all closed.
- **States:** closed · open · focus-visible.
- **Tokens:** `border`, `text`, `text-muted`, `text-subtle`, `duration-base`.
- **Accessibility:** Native `<details>` keeps keyboard and screen-reader support.
- **Do:** Answer in one or two sentences.
- **Don't:** Don't hide pricing or privacy terms only here.

## CTABand

Closing call to action on the `bg-sidebar` tint with an email field.

- **Anatomy:** radius-2xl band · h2 (3xl 700) + lead · email Input (40px, white, `shadow-sm`) + primary xl button · note (text-sm subtle).
- **Variants:** with form · button only.
- **States:** default · submitting · done (inline confirmation).
- **Tokens:** `bg-sidebar`, `bg`, `shadow-sm`, `accent`, `text-3xl`, `radius-2xl`.
- **Accessibility:** Visible or sr-only label on the email field; errors announced.
- **Do:** Repeat the hero's CTA wording.
- **Don't:** No dark or gradient band.

## Footer

Tinted footer: brand and tagline, three link columns, a base line.

- **Anatomy:** `bg-sidebar` · brand + one-line tagline · columns with text-sm subtle headings and text-muted links · hairline base row.
- **Variants:** desktop 4 columns · mobile 2 columns.
- **States:** link hover (text + underline).
- **Tokens:** `bg-sidebar`, `border`, `text`, `text-muted`, `text-subtle`.
- **Accessibility:** `<footer>` with lists of links.
- **Do:** Keep legal links here.
- **Don't:** No social icon walls.

---

# Contrast (WCAG 2.x)

Generated by `node design-system/scripts/build-tokens.mjs` (writes `contrast-report.md`; the script exits non-zero if any pair fails). Normal text needs ≥ 4.5:1; UI parts (control borders, focus rings, icons) and large text need ≥ 3:1.

Script output:

```
$ node design-system/scripts/build-tokens.mjs
| dark | `icon-red` #e8716c | `bg` #161616 | 6.04:1 |
wrote tokens.json
```

| Theme | Foreground | Background | Use | Min | Ratio | Result |
|---|---|---|---|---|---|---|
| light | `text` #191918 | `bg` #ffffff | normal text | 4.5:1 | 17.59:1 | PASS |
| dark | `text` #d4d4d2 | `bg` #161616 | normal text | 4.5:1 | 12.19:1 | PASS |
| light | `text` #191918 | `bg-sidebar` #f6f6f5 | normal text | 4.5:1 | 16.27:1 | PASS |
| dark | `text` #d4d4d2 | `bg-sidebar` #1c1c1c | normal text | 4.5:1 | 11.48:1 | PASS |
| light | `text` #191918 | `surface-raised` #ffffff | normal text | 4.5:1 | 17.59:1 | PASS |
| dark | `text` #d4d4d2 | `surface-raised` #202020 | normal text | 4.5:1 | 10.98:1 | PASS |
| light | `text` #191918 | `surface-input` #f6f6f5 | normal text | 4.5:1 | 16.27:1 | PASS |
| dark | `text` #d4d4d2 | `surface-input` #262626 | normal text | 4.5:1 | 10.20:1 | PASS |
| light | `text` #191918 | `surface-hover` #f0f0ef | normal text | 4.5:1 | 15.43:1 | PASS |
| dark | `text` #d4d4d2 | `surface-hover` #262626 | normal text | 4.5:1 | 10.20:1 | PASS |
| light | `text` #191918 | `surface-selected` #e8e8e6 | normal text | 4.5:1 | 14.34:1 | PASS |
| dark | `text` #d4d4d2 | `surface-selected` #2c2c2c | normal text | 4.5:1 | 9.41:1 | PASS |
| light | `text-muted` #4d4c48 | `bg` #ffffff | normal text | 4.5:1 | 8.60:1 | PASS |
| dark | `text-muted` #adadaa | `bg` #161616 | normal text | 4.5:1 | 8.04:1 | PASS |
| light | `text-muted` #4d4c48 | `bg-sidebar` #f6f6f5 | normal text | 4.5:1 | 7.95:1 | PASS |
| dark | `text-muted` #adadaa | `bg-sidebar` #1c1c1c | normal text | 4.5:1 | 7.58:1 | PASS |
| light | `text-muted` #4d4c48 | `surface-raised` #ffffff | normal text | 4.5:1 | 8.60:1 | PASS |
| dark | `text-muted` #adadaa | `surface-raised` #202020 | normal text | 4.5:1 | 7.24:1 | PASS |
| light | `text-muted` #4d4c48 | `surface-input` #f6f6f5 | normal text | 4.5:1 | 7.95:1 | PASS |
| dark | `text-muted` #adadaa | `surface-input` #262626 | normal text | 4.5:1 | 6.73:1 | PASS |
| light | `text-muted` #4d4c48 | `surface-hover` #f0f0ef | normal text | 4.5:1 | 7.54:1 | PASS |
| dark | `text-muted` #adadaa | `surface-hover` #262626 | normal text | 4.5:1 | 6.73:1 | PASS |
| light | `text-muted` #4d4c48 | `surface-selected` #e8e8e6 | normal text | 4.5:1 | 7.01:1 | PASS |
| dark | `text-muted` #adadaa | `surface-selected` #2c2c2c | normal text | 4.5:1 | 6.21:1 | PASS |
| light | `text-subtle` #65645f | `bg` #ffffff | normal text | 4.5:1 | 5.93:1 | PASS |
| dark | `text-subtle` #9a9a97 | `bg` #161616 | normal text | 4.5:1 | 6.41:1 | PASS |
| light | `text-subtle` #65645f | `bg-sidebar` #f6f6f5 | normal text | 4.5:1 | 5.48:1 | PASS |
| dark | `text-subtle` #9a9a97 | `bg-sidebar` #1c1c1c | normal text | 4.5:1 | 6.04:1 | PASS |
| light | `text-subtle` #65645f | `surface-raised` #ffffff | normal text | 4.5:1 | 5.93:1 | PASS |
| dark | `text-subtle` #9a9a97 | `surface-raised` #202020 | normal text | 4.5:1 | 5.77:1 | PASS |
| light | `text-subtle` #65645f | `surface-input` #f6f6f5 | normal text | 4.5:1 | 5.48:1 | PASS |
| dark | `text-subtle` #9a9a97 | `surface-input` #262626 | normal text | 4.5:1 | 5.36:1 | PASS |
| light | `text-subtle` #65645f | `surface-hover` #f0f0ef | normal text | 4.5:1 | 5.20:1 | PASS |
| dark | `text-subtle` #9a9a97 | `surface-hover` #262626 | normal text | 4.5:1 | 5.36:1 | PASS |
| light | `text-subtle` #65645f | `surface-selected` #e8e8e6 | normal text | 4.5:1 | 4.83:1 | PASS |
| dark | `text-subtle` #9a9a97 | `surface-selected` #2c2c2c | normal text | 4.5:1 | 4.95:1 | PASS |
| light | `text-on-tooltip` #ffffff | `surface-tooltip` #1b1b1a | normal text | 4.5:1 | 17.24:1 | PASS |
| dark | `text-on-tooltip` #e3e3e1 | `surface-tooltip` #383837 | normal text | 4.5:1 | 9.13:1 | PASS |
| light | `text-on-tooltip-muted` #a5a4a0 | `surface-tooltip` #1b1b1a | normal text | 4.5:1 | 6.91:1 | PASS |
| dark | `text-on-tooltip-muted` #adadaa | `surface-tooltip` #383837 | normal text | 4.5:1 | 5.22:1 | PASS |
| light | `accent-fg` #ffffff | `accent` #1c72d6 | normal text | 4.5:1 | 4.74:1 | PASS |
| dark | `accent-fg` #ffffff | `accent` #1c72d6 | normal text | 4.5:1 | 4.74:1 | PASS |
| light | `accent-fg` #ffffff | `accent-hover` #1966bf | normal text | 4.5:1 | 5.68:1 | PASS |
| dark | `accent-fg` #ffffff | `accent-hover` #1966bf | normal text | 4.5:1 | 5.68:1 | PASS |
| light | `accent-fg` #ffffff | `accent-active` #155aa8 | normal text | 4.5:1 | 6.86:1 | PASS |
| dark | `accent-fg` #ffffff | `accent-active` #155aa8 | normal text | 4.5:1 | 6.86:1 | PASS |
| light | `accent-text` #155aa8 | `bg` #ffffff | normal text | 4.5:1 | 6.86:1 | PASS |
| dark | `accent-text` #5b9ae6 | `bg` #161616 | normal text | 4.5:1 | 6.21:1 | PASS |
| light | `accent-text` #155aa8 | `bg-sidebar` #f6f6f5 | normal text | 4.5:1 | 6.35:1 | PASS |
| dark | `accent-text` #5b9ae6 | `bg-sidebar` #1c1c1c | normal text | 4.5:1 | 5.85:1 | PASS |
| light | `accent-text` #155aa8 | `surface-raised` #ffffff | normal text | 4.5:1 | 6.86:1 | PASS |
| dark | `accent-text` #5b9ae6 | `surface-raised` #202020 | normal text | 4.5:1 | 5.59:1 | PASS |
| light | `accent-text` #155aa8 | `accent-subtle` #e5eef7 | normal text | 4.5:1 | 5.85:1 | PASS |
| dark | `accent-text` #5b9ae6 | `accent-subtle` #1b2a3c | normal text | 4.5:1 | 5.00:1 | PASS |
| light | `accent-text` #155aa8 | `surface-hover` #f0f0ef | normal text | 4.5:1 | 6.02:1 | PASS |
| dark | `accent-text` #5b9ae6 | `surface-hover` #262626 | normal text | 4.5:1 | 5.20:1 | PASS |
| light | `text` #191918 | `accent-subtle` #e5eef7 | normal text | 4.5:1 | 15.00:1 | PASS |
| dark | `text` #d4d4d2 | `accent-subtle` #1b2a3c | normal text | 4.5:1 | 9.80:1 | PASS |
| light | `tag-gray-fg` #37352f | `tag-gray-bg` #efefed | normal text | 4.5:1 | 10.65:1 | PASS |
| dark | `tag-gray-fg` #e3e2df | `tag-gray-bg` #373735 | normal text | 4.5:1 | 9.21:1 | PASS |
| light | `tag-brown-fg` #44291e | `tag-brown-bg` #f4ebe6 | normal text | 4.5:1 | 11.30:1 | PASS |
| dark | `tag-brown-fg` #ecd9cf | `tag-brown-bg` #4a3328 | normal text | 4.5:1 | 8.57:1 | PASS |
| light | `tag-orange-fg` #4f2a0e | `tag-orange-bg` #ffede1 | normal text | 4.5:1 | 11.05:1 | PASS |
| dark | `tag-orange-fg` #fbd9bd | `tag-orange-bg` #5a3515 | normal text | 4.5:1 | 8.06:1 | PASS |
| light | `tag-yellow-fg` #402c1b | `tag-yellow-bg` #feefcc | normal text | 4.5:1 | 11.56:1 | PASS |
| dark | `tag-yellow-fg` #f6e2b3 | `tag-yellow-bg` #56431c | normal text | 4.5:1 | 7.42:1 | PASS |
| light | `tag-green-fg` #1c3829 | `tag-green-bg` #dcefdd | normal text | 4.5:1 | 10.58:1 | PASS |
| dark | `tag-green-fg` #cbe8d1 | `tag-green-bg` #23432f | normal text | 4.5:1 | 8.35:1 | PASS |
| light | `tag-blue-fg` #183347 | `tag-blue-bg` #d7e8f6 | normal text | 4.5:1 | 10.45:1 | PASS |
| dark | `tag-blue-fg` #cde2f5 | `tag-blue-bg` #1f3a55 | normal text | 4.5:1 | 8.80:1 | PASS |
| light | `tag-purple-fg` #412454 | `tag-purple-bg` #eee7f7 | normal text | 4.5:1 | 10.85:1 | PASS |
| dark | `tag-purple-fg` #e2d4f2 | `tag-purple-bg` #3d2a52 | normal text | 4.5:1 | 9.04:1 | PASS |
| light | `tag-pink-fg` #4c2337 | `tag-pink-bg` #fbe8f1 | normal text | 4.5:1 | 11.18:1 | PASS |
| dark | `tag-pink-fg` #f5d3e3 | `tag-pink-bg` #522a3d | normal text | 4.5:1 | 8.71:1 | PASS |
| light | `tag-red-fg` #5d1715 | `tag-red-bg` #ffe1e0 | normal text | 4.5:1 | 10.69:1 | PASS |
| dark | `tag-red-fg` #fbd2cf | `tag-red-bg` #5b2422 | normal text | 4.5:1 | 8.85:1 | PASS |
| light | `danger-text` #b8322d | `bg` #ffffff | normal text | 4.5:1 | 5.95:1 | PASS |
| dark | `danger-text` #f08c88 | `bg` #161616 | normal text | 4.5:1 | 7.59:1 | PASS |
| light | `danger-text` #b8322d | `surface-raised` #ffffff | normal text | 4.5:1 | 5.95:1 | PASS |
| dark | `danger-text` #f08c88 | `surface-raised` #202020 | normal text | 4.5:1 | 6.84:1 | PASS |
| light | `danger-text` #b8322d | `danger-subtle` #ffe1e0 | normal text | 4.5:1 | 4.84:1 | PASS |
| dark | `danger-text` #f08c88 | `danger-subtle` #5b2422 | normal text | 4.5:1 | 5.12:1 | PASS |
| light | `focus-ring` #1c72d6 | `bg` #ffffff | UI / large | 3:1 | 4.74:1 | PASS |
| dark | `focus-ring` #5b9ae6 | `bg` #161616 | UI / large | 3:1 | 6.21:1 | PASS |
| light | `focus-ring` #1c72d6 | `bg-sidebar` #f6f6f5 | UI / large | 3:1 | 4.39:1 | PASS |
| dark | `focus-ring` #5b9ae6 | `bg-sidebar` #1c1c1c | UI / large | 3:1 | 5.85:1 | PASS |
| light | `focus-ring` #1c72d6 | `surface-raised` #ffffff | UI / large | 3:1 | 4.74:1 | PASS |
| dark | `focus-ring` #5b9ae6 | `surface-raised` #202020 | UI / large | 3:1 | 5.59:1 | PASS |
| light | `focus-ring` #1c72d6 | `surface-input` #f6f6f5 | UI / large | 3:1 | 4.39:1 | PASS |
| dark | `focus-ring` #5b9ae6 | `surface-input` #262626 | UI / large | 3:1 | 5.20:1 | PASS |
| light | `focus-ring` #1c72d6 | `surface-hover` #f0f0ef | UI / large | 3:1 | 4.16:1 | PASS |
| dark | `focus-ring` #5b9ae6 | `surface-hover` #262626 | UI / large | 3:1 | 5.20:1 | PASS |
| light | `border-strong` #85847f | `bg` #ffffff | UI / large | 3:1 | 3.75:1 | PASS |
| dark | `border-strong` #737371 | `bg` #161616 | UI / large | 3:1 | 3.81:1 | PASS |
| light | `border-strong` #85847f | `bg-sidebar` #f6f6f5 | UI / large | 3:1 | 3.47:1 | PASS |
| dark | `border-strong` #737371 | `bg-sidebar` #1c1c1c | UI / large | 3:1 | 3.59:1 | PASS |
| light | `border-strong` #85847f | `surface-raised` #ffffff | UI / large | 3:1 | 3.75:1 | PASS |
| dark | `border-strong` #737371 | `surface-raised` #202020 | UI / large | 3:1 | 3.43:1 | PASS |
| light | `border-strong` #85847f | `surface-hover` #f0f0ef | UI / large | 3:1 | 3.29:1 | PASS |
| dark | `border-strong` #737371 | `surface-hover` #262626 | UI / large | 3:1 | 3.19:1 | PASS |
| light | `accent` #1c72d6 | `bg` #ffffff | UI / large | 3:1 | 4.74:1 | PASS |
| dark | `accent` #1c72d6 | `bg` #161616 | UI / large | 3:1 | 3.82:1 | PASS |
| light | `accent` #1c72d6 | `surface-hover` #f0f0ef | UI / large | 3:1 | 4.16:1 | PASS |
| dark | `accent` #1c72d6 | `surface-hover` #262626 | UI / large | 3:1 | 3.19:1 | PASS |
| light | `danger` #d44c47 | `bg` #ffffff | UI / large | 3:1 | 4.26:1 | PASS |
| dark | `danger` #e5635e | `bg` #161616 | UI / large | 3:1 | 5.41:1 | PASS |

106 pairs checked, 106 pass, 0 fail.

Exempt by design (source values kept exact, never used for text the user must read): `text-placeholder` (placeholders and hints), `text-disabled`, `border` (decorative hairline), `accent-border`, `focus-halo`, and the `icon-*` inks (decorative glyphs that always sit next to a text label). For reference:

| Theme | Foreground | Background | Ratio |
|---|---|---|---|
| light | `text-placeholder` #a5a4a0 | `bg` #ffffff | 2.49:1 |
| dark | `text-placeholder` #737371 | `bg` #161616 | 3.81:1 |
| light | `text-placeholder` #a5a4a0 | `surface-input` #f6f6f5 | 2.31:1 |
| dark | `text-placeholder` #737371 | `surface-input` #262626 | 3.19:1 |
| light | `icon-gray` #8f8e8a | `bg` #ffffff | 3.28:1 |
| dark | `icon-gray` #9b9a97 | `bg` #161616 | 6.43:1 |
| light | `icon-brown` #a0694f | `bg` #ffffff | 4.54:1 |
| dark | `icon-brown` #bf8b71 | `bg` #161616 | 6.16:1 |
| light | `icon-orange` #d9772f | `bg` #ffffff | 3.17:1 |
| dark | `icon-orange` #e8914e | `bg` #161616 | 7.40:1 |
| light | `icon-yellow` #c29328 | `bg` #ffffff | 2.80:1 |
| dark | `icon-yellow` #d7a93f | `bg` #161616 | 8.30:1 |
| light | `icon-green` #4f8a67 | `bg` #ffffff | 4.07:1 |
| dark | `icon-green` #6aa883 | `bg` #161616 | 6.50:1 |
| light | `icon-blue` #3f86c2 | `bg` #ffffff | 3.89:1 |
| dark | `icon-blue` #5fa0d6 | `bg` #161616 | 6.45:1 |
| light | `icon-purple` #8a67ad | `bg` #ffffff | 4.54:1 |
| dark | `icon-purple` #a888c8 | `bg` #161616 | 6.05:1 |
| light | `icon-pink` #c0508a | `bg` #ffffff | 4.42:1 |
| dark | `icon-pink` #d9719f | `bg` #161616 | 5.87:1 |
| light | `icon-red` #d65b57 | `bg` #ffffff | 3.82:1 |
| dark | `icon-red` #e8716c | `bg` #161616 | 6.04:1 |
