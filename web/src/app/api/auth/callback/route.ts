import { exchangeCode, fetchUser, OAuthError, SCOPE_GMAIL_MODIFY } from '@/lib/server/google-oauth';
import { MAX_ACCOUNTS, readSession, takeOAuthPending, writeSession } from '@/lib/server/session';

function go(origin: string, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, origin).toString(), 'Cache-Control': 'no-store' } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (reason: string) => go(url.origin, `/login?error=${encodeURIComponent(reason)}`);
  const pending = await takeOAuthPending();
  const error = url.searchParams.get('error');
  if (error) return fail(error === 'access_denied' ? 'You cancelled the Google sign-in.' : `Google sign-in failed: ${error}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!pending || !code || !state || state !== pending.state) return fail('Your sign-in session expired. Please try again.');

  try {
    const tokens = await exchangeCode(code, pending.verifier, url.origin);
    const scopes = tokens.scope.split(/\s+/).filter(Boolean);
    if (!scopes.includes(SCOPE_GMAIL_MODIFY)) {
      return fail('ZeroLatency needs permission to read and organise your Gmail. Tick the Gmail access box when signing in.');
    }
    const user = await fetchUser(tokens.access_token);
    const session = await readSession();
    const existing = session.accounts.find((a) => a.id === user.sub);
    const refreshToken = tokens.refresh_token ?? existing?.refreshToken;
    if (!refreshToken) return fail('Google did not grant offline access. Remove ZeroLatency from your Google account permissions and sign in again.');
    const others = session.accounts.filter((a) => a.id !== user.sub);
    if (others.length >= MAX_ACCOUNTS) return fail(`You can connect up to ${MAX_ACCOUNTS} accounts. Remove one first.`);
    await writeSession({
      v: 1,
      accounts: [...others, {
        id: user.sub, email: user.email, name: user.name ?? user.email, picture: user.picture ?? null,
        refreshToken, accessToken: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000, scopes,
      }],
      activeId: user.sub,
    });
    return go(url.origin, pending.returnTo);
  } catch (e) {
    if (e instanceof OAuthError) return fail(`Google sign-in failed: ${e.message}`);
    console.error('[zl] oauth callback failed', e);
    return fail('Google sign-in failed. Please try again.');
  }
}
