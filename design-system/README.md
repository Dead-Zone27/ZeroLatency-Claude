ZeroLatency is an email client that sits on top of Gmail and lets people shape their inbox into views. The system is quiet by default: a white canvas with a warm gray sidebar, one blue for action, and nine soft inks for everything people label. Every value was measured from the reference app frames (see `frame-audit.md` in the repository). Names, copy, icons and sample data are ZeroLatency's own.

## Content fundamentals

- Write short, plain, sentence-case labels: "Auto label", "Edit view", "Add property", "Delete view", "Draft saved". Never Title Case, never ALL CAPS, except the tiny `DEFAULT` marker.
- Menus describe what an option does in one line under its name: "Group by people and companies", "Split into unread and read".
- Report outcomes in the past tense with a number, and offer Undo: "Archived 3 threads". Progress is a present participle: "Message sending".
- Settings rows are a title plus one description sentence: "Thread style" / "Change how open threads are displayed".
- No urgency, streaks or inbox-zero celebration. Emoji appear only where people typed them (subjects and view icons they picked), never in product copy.
- Sample data is fictional: Priya Raman, Jonas Beck, Northwind, Ops Weekly.

## Colour

- Build every screen from role tokens, never from primitives (`gray-*`, `ink-*`, `blue-*`).
- Grounds: `bg` for the list, the open thread, panels and settings content; `bg-sidebar` for the sidebar and settings navigation; `surface-raised` (with a shadow) for menus, the composer, modals and previews; `surface-input` for filled text fields.
- State fills are neutral: `surface-hover` on hover, `surface-selected` for the current view, the open row and the active settings section. Selection is never blue.
- `accent` (blue) is spent only on the main action (Send, Save, Continue), the unread dot, checked checkboxes, the Filter tool while filters apply, and focus. `accent-subtle` + `accent-text` mark a chosen option ("Included") or an AI suggestion.
- Labels use the nine inks: `tag-{gray|brown|orange|yellow|green|blue|purple|pink|red}-bg` with the matching `-fg`. Every pair passes 4.5:1 in both themes. View glyphs, template glyphs and status glyphs use `icon-{ink}`. These are decorative and always sit next to a word.
- Text: `text` for content; `text-muted` for sidebar labels; `text-subtle` for time, counts, section labels and descriptions (AA on every ground, `surface-selected` included). `text-placeholder` is only for placeholders, "(Gmail)" hints, "Draft saved" and thread counts: it is below 4.5:1 by design, like the source.
- Destructive: `danger-text` on a text button ("Delete view"), `danger-subtle` on hover.
- The tooltip and toast use `surface-tooltip` with `text-on-tooltip` in both themes.
- The dark theme is its own palette (`ink-*`), not an inversion: #161616 canvas, #1c1c1c navigation, #202020 menus. Label chips become deep fills with light ink.

## Type

- Use the system UI face: `-apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI"…`. No font files ship. Mono is only for code and raw IDs.
- The app runs on `text-md` (14px): rows, sidebar, menus, inputs, buttons. Weight carries state. Unread sender and subject are 600, read ones 400. The view title, the current sidebar item and group headings are 500.
- Smaller steps: `text-sm` (13) for time and message meta; `text-xs` (12) for chips, section labels ("Views", "Mail") and descriptions; `text-2xs` (11) for tooltip shortcuts and `DEFAULT`.
- Larger steps: `text-base` (16, line height 1.6) for the email body; `text-lg` (18) for pane titles; `text-xl` (22, 700) for the thread title.
- Marketing uses the same face at 700 with tight tracking: `display` 72, `h2` `text-4xl` 44, `lead` `text-lg`.

## Space, shape, depth

- Use the 4px grid with a 2px half-step: `space-1` to `space-24`. Real measurements are kept as size tokens: `size-row-height` 38, `size-nav-item-height` 30, `size-control-height` 28, `size-chip-height` 20, `size-header-height` 44, `size-sidebar-width` 240, `size-panel-width` 400, `size-popover-width` 300, `size-composer-width` 600.
- Radii: `radius-sm` (4) for chips; `radius-md` (6) for buttons, inputs, rows, sidebar and menu items; `radius-lg` (8) for previews; `radius-xl` (10) for menus and cards; `radius-2xl` (12) for the modal and composer; `radius-full` for status pills, toggles and avatars.
- Separate with space and a single hairline (`border`), never with boxes. Group headings get a hairline below; panels get one on their inner edge.
- Shadows are soft and layered with a 1px ring: `shadow-sm` for the secondary button edge, option rows and cards; `shadow-md` for menus and tooltips; `shadow-lg` for the composer, previews and toasts; `shadow-xl` for the settings modal and the product visual. Nothing has a resting border except the checkbox (`border-strong`).

## Components

- The app is three columns: `Sidebar`, then the view (`ViewHeader` + thread list of `GroupHeading` and `ThreadRow`), then optionally a `ThreadView` side peek or a 400px `SidePanel` (Edit view → Properties → Add property / Edit property).
- Menus (`Menu`, `FilterEditor`, `PropertyEditor`) anchor to their trigger, start with a search field when the list is long, and nest only by replacing their content behind a back arrow. Changes to a filter wait for Save; settings apply instantly.
- Hover reveals, it doesn't decorate. The row checkbox and row actions appear on hover or focus; group headings show Collapse and Remove on hover.
- Every icon button has a `Tooltip` with its shortcut.

## Motion

- Motion is a hint. Hover fills use `duration-fast`. Menus, panels and toasts enter with `duration-slow` + `ease-enter`. Row actions swap in instantly.
- Under `prefers-reduced-motion: reduce`, only opacity fades remain.

## States and focus

- Focus-visible is a 2px solid `focus-ring` with a 2px offset. Rows and menu or sidebar items take it inset. Inputs show a 1px `focus-ring` border plus a 3px `focus-halo`, and their fill turns `bg`.
- Hover is `surface-hover`, pressed or current is `surface-selected`, and a primary button hovers to `accent-hover`. Disabled uses `text-disabled`.
- Busy buttons keep their width, set `aria-busy` and show the spinner with a present participle.

## Iconography

- Line icons are ZeroLatency's own: 24 grid, 1.5 stroke, round caps, `currentColor`, drawn at 16px in `text-subtle` (the toolbar, menus and mail folders).
- Each view has a filled glyph at 18px in one `icon-{ink}`: inbox tray, alert, bolt, tag, book, archive box, calendar and so on. People pick the glyph and the ink.
- Status glyphs are 14px: a dashed ring for Not started, then a filled circle with play (In progress), check (Done) or cross (Canceled). The shapes differ, so they still read in grayscale.
- No emoji in UI chrome, no illustrations, no third-party logos or screenshots.

## Logo

- The mark is a zero whose top-right quarter has already left as a straight line ("zero wait"), in white on an `accent` rounded tile (radius 8 on a 32 grid). The wordmark sets "ZeroLatency" as one word with a capital Z and L.
- Use `wordmark.svg` on light grounds and `wordmark-dark.svg` on dark grounds; the mark alone at 16–32px. Keep clear space of half the mark's width. Don't recolour, rotate or add effects.
