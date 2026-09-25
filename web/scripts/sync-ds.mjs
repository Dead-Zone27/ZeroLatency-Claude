// Copies the generated design-system CSS into the app. `--check` fails if the copies are stale.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'design-system', 'handoff');
const dest = join(here, '..', 'src', 'styles');
const files = ['tokens.css', 'components.css'];
const check = process.argv.includes('--check');
let stale = 0;
for (const f of files) {
  const from = join(src, f), to = join(dest, f);
  if (!existsSync(from)) { console.log(`skip ${f}: design-system not found`); continue; }
  const body = `/* Copied from design-system/handoff/${f} by scripts/sync-ds.mjs. Do not edit here. */\n` + readFileSync(from, 'utf8');
  const current = existsSync(to) ? readFileSync(to, 'utf8') : '';
  if (current === body) continue;
  if (check) { console.error(`stale: src/styles/${f} (run npm run sync-ds)`); stale++; continue; }
  writeFileSync(to, body); console.log(`synced ${f}`);
}
if (stale) process.exit(1);
