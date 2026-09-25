import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface ServerEnv {
  googleClientId: string;
  googleClientSecret: string;
  sessionSecret: string;
  openaiApiKey: string | null;
  openaiModel: string;
  appUrl: string | null;
  demo: boolean;
}

let cached: ServerEnv | null = null;

export class ConfigError extends Error {}

export interface ConfigProblem {
  name: string;
  message: string;
}

const DEMO_SECRET = 'demo-mode-session-secret-not-for-production-use';
const DEV_SECRET_FILE = '.zl-dev-secret';

/** `next dev` only. Production (Vercel, `next start`) and tests never use the local fallbacks below. */
function isLocalDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

function hasGoogle(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

/**
 * ZL_DEMO=1 forces the sample mailbox. In local development it is also used automatically while the Google
 * credentials are missing (ZL_DEMO=0 turns that off), so the app runs with no setup at all.
 */
function isDemo(): boolean {
  const v = process.env.ZL_DEMO?.trim().toLowerCase();
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return isLocalDev() && !hasGoogle();
}

/** A random secret kept in a git-ignored file so local sign-ins survive dev-server restarts. */
function localDevSecret(): string {
  const file = path.join(process.cwd(), DEV_SECRET_FILE);
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch {
    // Not created yet.
  }
  const secret = crypto.randomBytes(32).toString('base64url');
  try {
    fs.writeFileSync(file, secret + '\n', { mode: 0o600 });
  } catch {
    // Read-only folder: fall back to a per-process secret (restarting signs you out).
  }
  return secret;
}

/** Lists missing or invalid settings without throwing, so pages can show setup instructions instead of crashing. */
export function configProblems(): ConfigProblem[] {
  const demo = isDemo();
  const out: ConfigProblem[] = [];
  // Empty values (e.g. a copied .env.example) count as unset.
  const secret = process.env.SESSION_SECRET?.trim() || '';
  if (secret && secret.length < 32) out.push({ name: 'SESSION_SECRET', message: 'must be at least 32 characters long' });
  else if (!secret && !demo && !isLocalDev()) out.push({ name: 'SESSION_SECRET', message: 'is not set' });
  if (!demo && !process.env.GOOGLE_CLIENT_ID?.trim()) out.push({ name: 'GOOGLE_CLIENT_ID', message: 'is not set' });
  if (!demo && !process.env.GOOGLE_CLIENT_SECRET?.trim()) out.push({ name: 'GOOGLE_CLIENT_SECRET', message: 'is not set' });
  return out;
}

/** Reads and validates server configuration. Throws ConfigError with a readable message when something is missing. */
export function env(): ServerEnv {
  if (cached) return cached;
  const problems = configProblems();
  if (problems.length) throw new ConfigError(problems.map((p) => `${p.name} ${p.message}.`).join(' '));
  const demo = isDemo();
  const sessionSecret = process.env.SESSION_SECRET?.trim() || (isLocalDev() ? localDevSecret() : DEMO_SECRET);
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '';
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() || null;
  if (isLocalDev()) {
    const mail = demo ? 'sample mailbox (add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local for real Gmail)' : 'Gmail';
    const ai = openaiApiKey ? `OpenAI (${process.env.OPENAI_MODEL?.trim() || 'gpt-5-mini'})` : demo ? 'canned demo text (set OPENAI_API_KEY for real AI)' : 'off (set OPENAI_API_KEY)';
    console.info(`[zerolatency] mail: ${mail} · AI: ${ai}`);
  }
  const appUrl = process.env.APP_URL?.replace(/\/+$/, '') || null;
  cached = {
    googleClientId,
    googleClientSecret,
    sessionSecret,
    openaiApiKey,
    openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-5-mini',
    appUrl,
    demo,
  };
  return cached;
}

/** For tests. */
export function resetEnvCache() {
  cached = null;
}
