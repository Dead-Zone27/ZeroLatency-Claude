# Decisions & Assumptions Log

| # | Date | Decision | Why |
|---|---|---|---|
| D1 | 2026-09-25 | The project lives at `Documents\CodingPractice\zerolatency\` on the user's PC. | The user chose a folder on their computer, and CodingPractice was the closest match. |
| D2 | 2026-09-25 | The work runs in the cloud workspace and is synced to the PC folder at the end of each phase. | This session has no shell on the PC, only file transfer, and npm, git and Playwright are available in the cloud. |
| D3 | 2026-09-25 | Brand = "ZeroLatency", design system = "ZeroLatency DS". | User input. |
| D4 | 2026-09-25 | Phase 1 research recommends SITE_PURPOSE, and the Lead confirms it at the Phase 1 gate. | The user asked for the research phase to define the purpose. |
| D5 | 2026-09-25 | The default repo name is `zerolatency-site`, not `mail-site`. | It matches the brand. |
| D6 | 2026-09-25 | Notion Mail shut down on 2026-09-22 (verified). The research uses help-center pages and reviews instead of the retired product page. | The product page now redirects. |
| D7 | 2026-09-25 | SITE_PURPOSE = **marketing landing site for ZeroLatency, an agent-first AI email assistant** (Option B from the brief, using Option A's page anatomy). | The user asked for research to define it, and it fits both the brand name and the market shift. |
| D8 | 2026-09-25 | Cloud egress blocks notion.com, vercel.com and Google Fonts, but GitHub and npm are allowed. Fonts are therefore self-hosted via @fontsource, and the Vercel import/deploy runs in the browser after the user signs in. | Verified through the proxy status. |
| D9 | 2026-09-25 | Research screenshots are captured through the built-in browser on the user's PC. | The cloud sandbox can't reach notion.com. |
| D10 | 2026-09-25 | Claude Design = the Claude Design System artifact type (published in the user's claude.ai account). No manual browser session was needed. | It's the same Claude-hosted design-system product, and no login step was required. |
| D11 | 2026-09-25 | Accent "Slipstream" teal-cyan; fonts Instrument Sans and IBM Plex Mono; Tailwind v4 with a CSS-variable bridge; `fg-*` text and `elevation-*` shadow utilities. | Designer's choices, accepted by the Lead. |
| D12 | 2026-09-25 | ZeroLatency DS rebuilt as **v2** from the 200 uploaded reference app frames (`ScreenShotFrames100/`, `ScreenShotFrames200/`), replacing the v1 "Slipstream" DS. It uses warm gray grounds, one blue accent (#1c72d6), nine tag inks, the system UI font and measured densities. This supersedes D11 and the research brief's "don't copy colours" rule for the visual language. The reference product's name, logos, icons, copy and screenshots are still never used. | The user asked for the DS to be re-created from the images of the actual app. Measurements and frame references are in `design-system/frame-audit.md`. |
| D13 | 2026-09-25 | Source values that miss WCAG AA were adjusted only where they carry readable text (`text-subtle`, `accent` nudged from #1e77dd to #1c72d6). Placeholders and decorative glyph inks keep their source values and are listed as exempt in `contrast-report.md`. | This keeps the reference look while every text pair still passes AA in both themes. |
