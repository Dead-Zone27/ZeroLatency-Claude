import 'server-only';

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

/** Reads and validates server configuration. Throws ConfigError with a readable message when something is missing. */
export function env(): ServerEnv {
  if (cached) return cached;
  const demo = process.env.ZL_DEMO === '1';
  const sessionSecret = process.env.SESSION_SECRET ?? (demo ? 'demo-mode-session-secret-not-for-production-use' : '');
  if (sessionSecret.length < 32) throw new ConfigError('SESSION_SECRET must be set to at least 32 random characters.');
  const googleClientId = process.env.GOOGLE_CLIENT_ID ?? '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
  if (!demo && (!googleClientId || !googleClientSecret)) throw new ConfigError('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.');
  const appUrl = process.env.APP_URL?.replace(/\/+$/, '') || null;
  cached = {
    googleClientId,
    googleClientSecret,
    sessionSecret,
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() || null,
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
