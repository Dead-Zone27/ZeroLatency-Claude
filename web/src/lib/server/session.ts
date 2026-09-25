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

// Browsers drop cookies over 4096 bytes, and four accounts' tokens exceed that, so the sealed session is split
// across zl_session, zl_session.1, zl_session.2 … Each chunk stays well under the limit.
const CHUNK = 3800;
const MAX_CHUNKS = 6;

function chunkName(i: number): string {
  return i === 0 ? SESSION_COOKIE : `${SESSION_COOKIE}.${i}`;
}

export async function readSession(): Promise<Session> {
  const jar = await cookies();
  let raw = '';
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = jar.get(chunkName(i))?.value;
    if (!part) break;
    raw += part;
  }
  const s = raw ? unseal<Session>(raw, env().sessionSecret) : null;
  if (!s || s.v !== 1 || !Array.isArray(s.accounts)) return { v: 1, accounts: [], activeId: null };
  return s;
}

export async function writeSession(s: Session): Promise<void> {
  const jar = await cookies();
  const sealed = s.accounts.length ? seal(s, env().sessionSecret) : '';
  const parts: string[] = [];
  for (let i = 0; i < sealed.length; i += CHUNK) parts.push(sealed.slice(i, i + CHUNK));
  if (parts.length > MAX_CHUNKS) throw new Error('Session is too large to store in cookies.');
  const opts = { httpOnly: true, secure: secureCookies(), sameSite: 'lax' as const, path: '/', maxAge: THIRTY_DAYS };
  parts.forEach((p, i) => jar.set(chunkName(i), p, opts));
  for (let i = parts.length; i < MAX_CHUNKS; i++) if (jar.get(chunkName(i))) jar.delete(chunkName(i));
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
