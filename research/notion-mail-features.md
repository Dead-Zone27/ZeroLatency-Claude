# Notion Mail: complete feature list

**Prepared for:** ZeroLatency · **Date:** 2026-09-25 · **Sources:** [S#] tags refer to `sources.md`

This list covers features only, with no limitations or criticisms. For design analysis, see `notion-mail-brief.md`. Notion Mail shut down on 22 September 2026 ([S6], [S14]), so this describes the product as it last existed.

---

## 1. Accounts and platform
- Works on top of an existing **Gmail or Google Workspace** account, with two-way sync: actions in Notion Mail show up in Gmail and the reverse ([S10], [S16]).
- **Account switcher** in the sidebar for settings, switching accounts and logging out ([S1]).
- Apps for **web and macOS**, with **iOS** announced at launch ([S7], [S8], [S12]).
- **Free** with every Notion plan, including the Free plan ([S10], [S12]).

## 2. Inbox organisation
- **Custom views**: saved slices of the inbox that combine filters, grouping and visible properties ([S4], [S8]).
- **Auto-generated default views**, built from the user's existing mail and labels ([S4]).
- **New views from templates or suggestions**, using the "New view" button ([S4]).
- **Group by** date, starred, important, sender email, sender domain, priority, label or unread ([S4]).
- **Filters** on read/unread, has attachments, calendar events, sender and recipient fields, subject and date range ([S4]).
- **Custom properties**, for example a select field for assigning tasks ([S4]).
- **Show or hide properties** in the list to control how dense it is ([S4]).
- **Labels** you apply by hand to threads ([S1]).
- **Gmail filters** managed from inside Notion Mail's settings ([S3]).
- **Mail folders**: All Mail, Sent, Drafts, and Trash or Spam ([S1], [S7]).
- **Search** from the sidebar ([S7], [S11]).

## 3. Notion AI features
- **AI auto label**: describe a category in plain language and AI labels matching mail as it arrives ([S2], [S7], [S13]).
- **Suggested auto-label prompts** to start from ([S7]).
- **Labelled mail can stay in the inbox or move into its own view** ([S2], [S7]).
- **Write with AI**: press space in the composer to have AI write or edit text ([S2], [S7]).
- **@-mention Notion pages as AI context** while drafting ([S2], [S7]).
- **Ask AI to draft a full reply** to a thread ([S2]).
- **Thread summaries** ([S11]).
- **Replies drafted in your tone** ([S10], [S13]).

## 4. Composer
- **Block-based editor** like a Notion page ([S7], [S12]).
- **Slash commands** to insert blocks and actions ([S7]).
- **Markdown** formatting and **code blocks** ([S12]).
- **Snippets**: reusable templates that can include attachments and scheduling links ([S3], [S7], [S12]).
- **Email signature** ([S3]).

## 5. Scheduling
- **`/schedule` in the composer** to share availability through **Notion Calendar** ([S7], [S12]).
- **Inline week-grid picker** that shows busy time and lets you pick the slots to offer ([S8]).
- The recipient books a meeting from the offered slots ([S7], [S8]).

## 6. Thread actions
- **Archive**, **mark as unread**, **label** and **star** or **important** ([S1], [S4]).
- **Reminders**: set a thread to come back later ([S1], [S15]).
- **Hover actions** on list rows that you can customise ([S11]).
- **Overflow (•••) menu** for more actions ([S1]).
- **Auto-advance** to the next or previous thread after an action ([S3]).

## 7. Reading layout
- **Thread style** options: **side peek** (right-hand panel with adjustable width), **center peek** or **full page** ([S1], [S3]).
- **Thread counts** and **unread indicators** in the list ([S7], [S8]).

## 8. Keyboard and navigation
- **Gmail-style single-key shortcuts** ([S5]).
- **"g"-prefixed jump shortcuts** to go to views and folders ([S5]).
- **Command palette** on Cmd+K or Cmd+P, a keyboard path to every action ([S1], [S5], [S11]).

## 9. Notifications
- **Desktop notifications**, set per view and per sender ([S3]).

## 10. Appearance and accessibility
- **Themes**: system, light and dark ([S3]).
- **High-contrast mode** ([S3]).
- **Language** setting ([S3]).

## 11. Notion integration
- Links email to your Notion workspace, with pages @-mentioned in drafts and Notion AI running across both ([S2], [S7], [S11]).
- **Notion Calendar** integration for scheduling ([S7]).
- Views, properties and grouping use the **same model as Notion databases** ([S4], [S11]).

## 12. Privacy and security
- Built on infrastructure from **Skiff**, which Notion acquired ([S10], [S15]).
- **Compliance support**, including HIPAA-eligible use on qualifying plans ([S13], [S15]).
