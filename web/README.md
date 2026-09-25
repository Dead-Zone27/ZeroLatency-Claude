# ZeroLatency Mail (web app)

An email client for Gmail and Google Workspace. It reproduces the feature set in [`../research/notion-mail-features.md`](../research/notion-mail-features.md), styled with the ZeroLatency design system (`../design-system`). It works on top of Gmail through the Gmail API, and uses the OpenAI API for its AI features.

## Features

| Area | What works |
|---|---|
| Accounts | Google sign-in (OAuth 2.0 + PKCE), up to 4 accounts with a switcher, two-way Gmail sync (every change is a Gmail API call) |
| Inbox organisation | Custom views = saved Gmail queries, auto-generated default views (onboarding), templates, suggested views from frequent senders and domains, filters (mailbox, read state, attachment, calendar invite, starred, important, label, from/to/cc/bcc, subject, date, Gmail category, raw Gmail search), group by (date, starred, important, sender, domain, keywords, label, unread, custom property), per-view icons and colours, reorder by drag, rename, duplicate, delete |
| Properties | Show/hide/reorder From, Subject, Preview, Label, Date, Files; custom Text, Number, Select, Multi-select, Status, Date, Checkbox, URL properties per view, editable from the thread |
| AI (OpenAI) | Auto labels from a plain-language description (applied as real Gmail labels, optionally moved out of the inbox), “Auto label similar”, Write with AI (space on an empty line, or the AI button), draft a reply in your own tone (few-shot from your sent mail), thread summaries with action items |
| Composer | Rich editor with Markdown shortcuts (`-`, `1.`, `#`, `>`, triple backtick, `---`) and `/` commands, recipient chips with autocomplete, Cc/Bcc, attachments (picker, drag and drop, paste), forward with original attachments, reply/reply all with quoted history, Gmail signature, autosaved Gmail drafts, Send and archive, ⌘/Ctrl+Enter |
| Snippets | Reusable text with an `{{availability}}` token |
| Scheduling | `/schedule` → week grid showing your Google Calendar busy times; pick slots to insert as a list |
| Thread actions | Archive, trash/restore, read/unread, star, label (create inline), remind me (Later today, Tomorrow, Weekend, Next week, custom), spam/not spam, unsubscribe link, open in Gmail, bulk actions, customisable hover actions, undo |
| Reading | Side peek, centre peek or full page; sandboxed HTML email (no scripts or forms) with inline images; quoted text collapsed; attachments download |
| Keyboard | Gmail-style single keys, `g` jumps, `1–9` views, ⌘/Ctrl+K command palette, Ctrl+F filter, Ctrl+E edit view, `?` list |
| Settings | Theme (system/light/dark), thread style, auto-advance, font size, AI and auto labels, Gmail filters (list/create/delete), snippets, signature options, desktop notifications per view, accounts |

Views, properties, snippets, reminders and settings are stored in the browser (`localStorage`, per Google account). Labels, filters, drafts and mail live in Gmail.

## Run it locally

```bash
cd web
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local — then fill it in (see below)
npm run dev                  # http://localhost:3000
```

`.env.local` goes in the `web` folder, next to `package.json`. Next.js reads it only at startup, so restart `npm run dev` after editing it.

**Testing shortcut (local `npm run dev` only).** Nothing is required to start:

- Without `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, the app opens a built-in sample mailbox. Set `ZL_DEMO=0` to turn this off.
- Without `SESSION_SECRET`, a random one is generated and saved in `web/.zl-dev-secret` (git-ignored).
- With `OPENAI_API_KEY` set, the AI features call OpenAI for real, including on the sample mailbox; without it they return canned text.
- The terminal prints which mail and AI mode is active.

Production (`next build` + `next start`, Vercel) never uses these shortcuts: until the required variables are set, it shows a setup page listing what is missing. `npm run dev:demo` forces the sample mailbox even when Google credentials are set.

### 1. Google Cloud setup (once)

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. Go to **APIs & Services → Library** and enable the **Gmail API** and the **Google Calendar API**.
3. Go to **APIs & Services → OAuth consent screen**:
   - User type **External**. Fill in the app name, support email and developer contact.
   - Add the scopes `openid`, `email`, `profile`, `https://www.googleapis.com/auth/gmail.modify`, `https://www.googleapis.com/auth/gmail.settings.basic` and `https://www.googleapis.com/auth/calendar.freebusy`.
   - While the app is in **Testing**, add your Google account(s) under **Test users**. `gmail.modify` is a restricted scope: using it with accounts other than your test users requires Google's verification (including a security assessment).
4. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**, application type **Web application**. Add the authorised redirect URI `http://localhost:3000/api/auth/callback`, plus `https://<your-domain>/api/auth/callback` for production.
5. Put the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 2. OpenAI

Put an API key in `OPENAI_API_KEY`, in `.env.local` locally or in your host's environment variables. Never commit it. `OPENAI_MODEL` defaults to `gpt-5-mini`. Any chat model that supports structured outputs works.

### 3. Session secret

`SESSION_SECRET` must be at least 32 random characters:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Deploy (Vercel)

Import the repository, set **Root Directory** to `web`, and add the environment variables from `.env.example` (with `APP_URL=https://<your-domain>`). Add the production redirect URI to the Google OAuth client.

Vercel limits request bodies to 4.5 MB, so larger attachments fail there. Self-host (`npm run build && npm start`) to send attachments up to Gmail's 25 MB limit.

## Checks

```bash
npm run check     # design-system CSS in sync, typecheck, lint, unit tests
npm run build
```

## Security notes

- Google tokens are stored only in an encrypted, `HttpOnly`, `SameSite=Lax` cookie (AES-256-GCM, keyed by `SESSION_SECRET`). There is no database.
- State-changing API routes reject cross-site requests (Origin check), and every request body is validated with zod.
- HTML email renders in a sandboxed iframe with no scripts, forms or same-window navigation, and a restrictive CSP.
- Attachments other than images and PDFs are always served as downloads, under a `sandbox` CSP.
- Email content sent to OpenAI is fenced as untrusted data. AI output only fills your composer (it never sends), and auto labels can only apply labels you created.

## Known limits

- Auto labels, reminders and notifications run while ZeroLatency is open in a browser (there is no background worker). Gmail filters (Settings → Gmail filters) run all the time.
- Reminders use a `ZeroLatency/Reminders` Gmail label, and the due time is stored in the browser that set it.
- Views and properties are per browser. They are not synced between devices.
- Scheduling inserts the times you pick into the email. It does not create a public booking page.
