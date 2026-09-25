import { z } from 'zod';
import { body, HttpError, withErrors } from '@/lib/server/api';
import { readSession, writeSession } from '@/lib/server/session';

export async function POST(req: Request) {
  return withErrors(req, async () => {
    const { accountId } = await body(req, z.object({ accountId: z.string().min(1) }));
    const s = await readSession();
    if (!s.accounts.some((a) => a.id === accountId)) throw new HttpError('Unknown account.', 404);
    await writeSession({ ...s, activeId: accountId });
    return { ok: true };
  });
}
