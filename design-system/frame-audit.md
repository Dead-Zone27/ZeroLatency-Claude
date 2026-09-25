# Frame audit: where ZeroLatency DS v2 comes from

**Date:** 2026-09-25 · **Source:** the 200 uploaded frames of the reference app in `ScreenShotFrames100/` (frames 009–108) and `ScreenShotFrames200/` (frames 109–209), each 1280×720 JPEG. **Method:** every frame was reviewed on contact sheets. The key frames were then read at full size, and colours and sizes were sampled with a script (the median of the modal colour in a pixel box, the darkest or most saturated percentile for text and icons, and edge profiles for borders and extents).

> **Scope.** This DS reproduces the reference app's visual language: palette, type scale, spacing, density, component anatomy and behaviour. Names, copy, icons, logos and sample data are ZeroLatency's own. No bitmap, icon or wordmark from the frames is used, and previews use fictional people and companies.

## 1. Screen inventory (all 200 frames)

| Frames | Screen | Used for |
|---|---|---|
| 009–014 | Onboarding: "start fresh" include/exclude list beside a live inbox preview | OptionList, primary button, accent-subtle chip |
| 015–020, 029–043, 066–072 | Inbox view: sidebar (account, Search, Views, Mail, footer), date groups, thread rows with label chips | Sidebar, ViewHeader, ThreadRow, GroupHeading, Tag |
| 017, 019, 038, 124, 147, 177 | Row hover: checkbox appears, time is replaced by Archive / Trash / Read / Remind / Label | ThreadRow hover actions |
| 021–028 | Composer: floating panel, recipient chip, Cc/Bcc, split Send, "Draft saved", "Message sending" toast | Composer, Toast |
| 036–037, 086, 157 | Tooltips: "Edit View / Control E", "Filter / Control F" | Tooltip |
| 044–064 | Settings modal: Inbox section (theme, thread style, auto-advance, font size), Signature (toggles, Open) | SettingsModal, Select, Toggle |
| 046–047 | Settings in the dark theme, including the theme menu | Dark palette |
| 051–053 | Thread style dropdown (Side peek / Center peek / Full page) | Select menu with check |
| 065 | Video title card | (none) |
| 072–077 | New view menu, template gallery | Menu, TemplateCard |
| 078–084 | New view: filter menu, icon picker (Emojis / Icons), naming | Menu, Tabs |
| 085–122 (zoomed recording) | Filter menu with Applied section, mailbox checklist, "From contains" editor with Reset / Save | Menu, FilterEditor |
| 127–143 | Group by menu (two-line items, check), Group by keyword with suggestions | Menu (two-line), GroupHeading (keyword) |
| 131, 147, 153–154 | Hover preview of a message | HoverPreview |
| 151 | Group heading hover actions: Collapse, Remove | GroupHeading |
| 157–177, 204, 209 | Edit view side panel, Properties (shown/hidden, eye toggles, drag), Add property (types) | SidePanel |
| 178–181 | Thread side peek: toolbar, title, label chips, property edit | ThreadView |
| 199–208 | Status property: options menu, Edit property panel | Status, PropertyEditor |

Frames 085–209 are a zoomed recording. Their measurements were divided by **1.033**, a scale derived from the 248px sidebar and the list's 14px text. Frames 009–084 are at **0.717** scale (a 172px sidebar = 240px).

## 2. Colour (light theme)

| Role | Measured | Frame · box | Token value |
|---|---|---|---|
| Main canvas | #ffffff | 113 · (600,450)–(900,650) | `bg` #ffffff |
| Sidebar / settings nav | #f6f6f6 | 086 · (150,430)–(235,450); 050 | `bg-sidebar` #f6f6f5 |
| Row / menu hover | #f0f0f0 | 147 · (800,245)–(860,255) | `surface-hover` #f0f0ef |
| Selected sidebar item | #e8e8e8; settings nav #eaebe6 | 086 · (170,370)–(228,390); 050 | `surface-selected` #e8e8e6 |
| Filled input | #f6f6f6 | 113 · (960,95)–(1100,118) | `surface-input` #f6f6f5 |
| Hairlines | #ededed–#f2f2f2 | 113 row 96; 158 x 867 | `border` #ededec |
| Primary text | #050505–#171717 (glyph cores) | 113 header, 086 rows | `text` #191918 |
| Sidebar labels | #464645 | 086 · sidebar items | `text-muted` #4d4c48 |
| Secondary text | #747474–#7c7c7b | 086 time, "Views", 050 descriptions | `text-subtle` #65645f (darkened to reach AA on `surface-selected`) |
| Placeholders, hints | #9a9a9a–#a4a4a4 | 087 "(Gmail)", 026 "Draft saved" | `text-placeholder` #a5a4a0 (below AA by design) |
| Tooltip | #10110e–#181914; shortcut #81827d | 086 · (1095,50)–(1160,82) | `surface-tooltip` #1b1b1a |
| Primary button | #1e77dd, #186dc7, #2277d4 | 009 Continue, 113 Save, 026 Send | `accent` #1c72d6 |
| Unread dot | #3c77d3 | 086 · (300,256)–(310,266) | `accent` |
| "Included" chip | #e5eef7 | 009 · (300,360)–(334,372) | `accent-subtle` #e5eef7 |
| Input focus | 1px #5f86a7 edge + #a0caf2 halo | 113 · input edge profile | `focus-ring` + `focus-halo` |
| Scrim | white → #626262 | 050 · (20,560)–(160,620) | `overlay` #0f0f0f @ 60% |

**Tag chips** (fill · text, from 086, 015, 202 and 075):

| Ink | Measured fill · text | Token fill · text |
|---|---|---|
| gray | #f0f0f0–#f7f8f3 · #1c1d18 | #efefed · #37352f |
| blue | #d7e8f6 · #0e212f | #d7e8f6 · #183347 |
| yellow | #feefcc · #2f1d00 | #feefcc · #402c1b |
| green | #dcefdd · #132314 | #dcefdd · #1c3829 |
| red | #ffe1e0 · #431c1a | #ffe1e0 · #5d1715 |
| orange | #feede1 · #936c4d | #ffede1 · #4f2a0e |
| purple | #f1edf7 · #766b82 | #eee7f7 · #412454 |
| pink, brown | template icons #d56593, #b57d62 | derived at the same lightness |

**View glyph inks** (the most-saturated percentile, frame 158): red #d65b57, orange #d37432/#e0823a, yellow outline #93792f, green #669277, blue #669cb8, pink #d56593, purple #8b79aa. The token inks keep the hues and are slightly darkened after allowing for blur.

**Status glyphs** (frame 202): canceled #d75459, done #64967b, in progress #77b6e2, not started as a dashed gray ring.

## 3. Colour (dark theme, frames 046–047)

| Role | Measured | Token |
|---|---|---|
| Modal/canvas | #161616 | `bg` #161616 |
| Settings nav | #1c1c1c | `bg-sidebar` #1c1c1c |
| Menu | #202020 | `surface-raised` #202020 |
| Selected nav | #262626 | `surface-hover` #262626 / `surface-selected` #2c2c2c |
| Menu hover | #2a2a2a | (between the two) |
| Scrim | #0e0e0e over #161616 | `overlay` black @ 50% |
| Text | #bdbdbd–#c0c0c0 (blurred glyphs) | `text` #d4d4d2 |
| Descriptions | #787878 | `text-subtle` #9a9a97 (lifted to reach AA) |

## 4. Dimensions (CSS px after scaling)

| Thing | Measured | Token |
|---|---|---|
| Sidebar width | 248 zoomed → 240 | `size-sidebar-width` 240px |
| Sidebar item | 31 tall, 8px side inset | `size-nav-item-height` 30px, radius-md |
| Row pitch | 39.4 zoomed → 38 | `size-row-height` 38px |
| View header | about 44 | `size-header-height` 44px |
| Buttons (Save, Auto label) | 28 tall; Save 78 wide | `size-control-height` 28px |
| Menu input | 28 tall; view-name input 34 | Input md / lg |
| Label chip | 17–19 tall | `size-chip-height` 20px, radius-sm 4px |
| Status pill | 20 tall, 14px glyph | 20px, radius-full |
| Unread dot | 5–7 | `size-unread-dot` 6px |
| Avatar | 21 | `size-avatar-size` 20px |
| Checkbox | 15 | `size-checkbox-size` 14px |
| Popover width | 295–332 | `size-popover-width` 300px (wide 340) |
| Side panel | from x = 868 → 400 | `size-panel-width` 400px |
| Composer | 426 at 0.717 → about 594 | `size-composer-width` 600px |
| Settings modal | viewport − 32px on each side; nav about 255 | `size-modal-inset` 32px, `size-settings-nav-width` 250px |
| Tooltip | 2 lines, about 68×38 | padding 5×8, radius-md |

## 5. Type (at the app's "Large" font setting)

Cap heights were measured and divided by 0.705, the cap-height ratio of SF Pro.

| Text | Cap height | Size · weight | Token |
|---|---|---|---|
| Thread title | 16 | 22 · 700 | `text-xl` |
| Email body | 12 | 16–17 · 400 | `text-base` |
| Rows, sidebar, menus | 9–10 | 14 · 400 (unread 600) | `text-md` |
| View title, group heading | 10 | 14 · 500 | `text-md` |
| Time, settings descriptions | n/a | 13 / 12 | `text-sm`, `text-xs` |
| Chips, section labels | n/a | 12 · 500 | `text-xs` |
| Tooltip shortcut, DEFAULT marker | n/a | 11 | `text-2xs` |

The font is the platform system face: SF Pro in the recording, on macOS. Tokens use the system stack, so no font files ship.

## 6. Behaviour noted from the frames

- Row hover reveals the checkbox and swaps the time for five actions, and the chips shift left to make room (147, 177).
- Group headings show "Collapse" and "Remove" on hover (151).
- The Filter tool turns blue while any filter is applied (086).
- Menus nest one level by replacing their content and adding a back arrow (105–113). Changes wait for Save.
- Settings apply immediately. There is no Save button (044–064).
- Threads open in a side peek by default, with centre peek and full page as alternatives (051–053, 178).
- A dark toast appears at the bottom left while sending (028).
