import { z } from 'zod';
import { body, withErrors } from '@/lib/server/api';
import { revokeToken } from '@/lib/server/google-oauth';
import { readSession, writeSession } from '@/lib/server/session';

const Body = z.object({ accountId: z.string().optional(), all: z.boolean().optional(), revoke: z.boolean().optional() });

export async function POST(req: Request) {
  return withErrors(req, async () => {
    const b = await body(req, Body);
    const s = await readSession();
    const removing = b.all ? s.accounts : s.accounts.filter((a) => a.id === (b.accountId ?? s.activeId));
    if (b.revoke) await Promise.all(removing.map((a) => revokeToken(a.refreshToken)));
    const ids = new Set(removing.map((a) => a.id));
    const accounts = s.accounts.filter((a) => !ids.has(a.id));
    const activeId = accounts.some((a) => a.id === s.activeId) ? s.activeId : (accounts[0]?.id ?? null);
    await writeSession({ v: 1, accounts, activeId });
    return { ok: true, remaining: accounts.length };
  });
}
