import 'server-only';
import { env } from './env';
import { randomToken, sha256Base64Url } from './crypto';

export const SCOPE_GMAIL_MODIFY = 'https://www.googleapis.com/auth/gmail.modify';
export const SCOPE_GMAIL_SETTINGS = 'https://www.googleapis.com/auth/gmail.settings.basic';
export const SCOPE_FREEBUSY = 'https://www.googleapis.com/auth/calendar.freebusy';
export const SCOPES = ['openid', 'email', 'profile', SCOPE_GMAIL_MODIFY, SCOPE_GMAIL_SETTINGS, SCOPE_FREEBUSY];

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

export interface OAuthStart {
  url: string;
  state: string;
  verifier: string;
}

export function redirectUri(origin: string): string {
  return `${env().appUrl ?? origin}/api/auth/callback`;
}

export function startAuth(origin: string, loginHint?: string): OAuthStart {
  const state = randomToken(24);
  const verifier = randomToken(48);
  const params = new URLSearchParams({
    client_id: env().googleClientId,
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent select_account',
    include_granted_scopes: 'true',
    state,
    code_challenge: sha256Base64Url(verifier),
    code_challenge_method: 'S256',
  });
  if (loginHint) params.set('login_hint', loginHint);
  return { url: `${AUTH_URL}?${params}`, state, verifier };
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export class OAuthError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) {
    super(message);
  }
}

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<TokenResponse> & { error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new OAuthError(json.error_description || json.error || `Token request failed (${res.status})`, json.error ?? 'token_error', res.status);
  }
  return json as TokenResponse;
}

export function exchangeCode(code: string, verifier: string, origin: string): Promise<TokenResponse> {
  return tokenRequest(new URLSearchParams({
    code,
    client_id: env().googleClientId,
    client_secret: env().googleClientSecret,
    redirect_uri: redirectUri(origin),
    grant_type: 'authorization_code',
    code_verifier: verifier,
  }));
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest(new URLSearchParams({
    refresh_token: refreshToken,
    client_id: env().googleClientId,
    client_secret: env().googleClientSecret,
    grant_type: 'refresh_token',
  }));
}

export interface GoogleUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function fetchUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new OAuthError(`Could not read the Google profile (${res.status})`, 'userinfo_error', res.status);
  const u = (await res.json()) as GoogleUser;
  if (!u.sub || !u.email) throw new OAuthError('Google did not return an email address.', 'userinfo_error', 502);
  return u;
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => undefined);
}
