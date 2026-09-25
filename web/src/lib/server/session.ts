import 'server-only';
import { cookies } from 'next/headers';
import { env } from './env';
import { seal, unseal } from './crypto';
import type { AccountInfo } from '../shared/types';

export const SESSION_COOKIE = 'zl_session';
export const OAUTH_COOKIE = 'zl_oauth';
export const MAX_ACCOUNTS = 4;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export interface StoredAccount {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  refreshToken: string;
  accessToken: string;
  /** Epoch ms when accessToken expires. */
  expiresAt: number;
  scopes: string[];
}

export interface Session {
  v: 1;
  accounts: StoredAccount[];
  activeId: string | null;
}

export interface OAuthPending {
  state: string;
  verifier: string;
  returnTo: string;
  createdAt: number;
}

/** Secure cookies on HTTPS deployments; plain HTTP only when APP_URL says so (or in development). */
function secureCookies(): boolean {
  const url = env().appUrl;
  if (url) return url.startsWith('https://');
  return process.env.NODE_ENV === 'production';
}

export async function readSession(): Promise<Session> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = raw ? unseal<Session>(raw, env().sessionSecret) : null;
  if (!s || s.v !== 1 || !Array.isArray(s.accounts)) return { v: 1, accounts: [], activeId: null };
  return s;
}

export async function writeSession(s: Session): Promise<void> {
  const jar = await cookies();
  if (s.accounts.length === 0) {
    jar.delete(SESSION_COOKIE);
    return;
  }
  jar.set(SESSION_COOKIE, seal(s, env().sessionSecret), { httpOnly: true, secure: secureCookies(), sameSite: 'lax', path: '/', maxAge: THIRTY_DAYS });
}

export async function writeOAuthPending(p: OAuthPending): Promise<void> {
  (await cookies()).set(OAUTH_COOKIE, seal(p, env().sessionSecret), { httpOnly: true, secure: secureCookies(), sameSite: 'lax', path: '/api/auth', maxAge: 600 });
}

export async function takeOAuthPending(): Promise<OAuthPending | null> {
  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: '/api/auth' });
  const p = raw ? unseal<OAuthPending>(raw, env().sessionSecret) : null;
  if (!p || Date.now() - p.createdAt > 600_000) return null;
  return p;
}

export function publicAccount(a: StoredAccount): AccountInfo {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    picture: a.picture,
    canReadFreeBusy: a.scopes.includes('https://www.googleapis.com/auth/calendar.freebusy'),
  };
}

/** Only allow same-site relative return paths. */
export function safeReturnTo(v: string | null | undefined): string {
  if (!v || !v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return '/mail';
  return v;
}
