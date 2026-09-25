import { configProblems, env } from '@/lib/server/env';
import { startAuth } from '@/lib/server/google-oauth';
import { safeReturnTo, writeOAuthPending } from '@/lib/server/session';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
  if (configProblems().length) return Response.redirect(new URL('/login', url.origin), 303);
  if (env().demo) return Response.redirect(new URL(returnTo, url.origin), 303);
  const hint = url.searchParams.get('hint') ?? undefined;
  const start = startAuth(url.origin, hint);
  await writeOAuthPending({ state: start.state, verifier: start.verifier, returnTo, createdAt: Date.now() });
  return new Response(null, { status: 303, headers: { Location: start.url, 'Cache-Control': 'no-store' } });
}
