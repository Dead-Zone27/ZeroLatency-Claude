# ZeroLatency — Project Plan

**Lead:** Claude (Cowork) · **Started:** 2026-09-25 (NZ time)

## Inputs
| Input | Value |
|---|---|
| BRAND NAME | ZeroLatency |
| SITE_PURPOSE | To be defined by Phase 1 research (default guess: a marketing site for an AI email client under the ZeroLatency brand) |
| REPO + HOST | GitHub repo `zerolatency-site` → Vercel |
| PROJECT_FOLDER (user's computer) | `C:\Users\reiva\Documents\CodingPractice\zerolatency\` |
| Working copy (cloud workspace) | `/home/claude/zerolatency/` (build, git and screenshots run here, and the result is synced to the folder above) |

## Folder structure
```
zerolatency/
  research/       notion-mail-brief.md, screenshots/, sources.md
  design-system/  tokens.json, components.md, design-system-link.txt, handoff/
  site/           Next.js codebase (git repo)
  docs/           plan.md, decisions.md, review-log.md, qa-report.md, FINAL-REPORT.md, screens-local/
```

## Phases and gates
| # | Phase | Owner (subagent) | Output | Gate |
|---|---|---|---|---|
| 1 | Research on Notion Mail and a recommended SITE_PURPOSE | Researcher | research/* | Lead review PASS |
| 2 | ZeroLatency DS (original, brand-neutral) | DS Designer | design-system/* | Lead review PASS |
| 3a | Build the Next.js site, then push and deploy | Frontend Builder | site/*, docs/screens-local/* | build and lint clean, Lead review |
| 3b | Independent QA (local and live) | QA Reviewer | docs/qa-report.md | no High or Medium issues (max 3 rounds) |
| — | Final handover | Lead | docs/FINAL-REPORT.md | the live URL has been verified |

## Review loop
Each output is scored against its acceptance checklist and logged in `docs/review-log.md` as PASS or REVISE, with numbered fixes. A task gets at most 3 revision rounds before the Lead fixes it or escalates.

## Known blockers ahead
- Phase 2: Claude Design needs a claude.ai login in the browser. If it isn't reachable, the fallback is a Design System artifact.
- Phase 3: pushing to GitHub and deploying to Vercel need the user's auth. The Lead will stop and ask then.
