import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { env } from '@/lib/server/env';
import { readSession } from '@/lib/server/session';
import { MailApp } from '@/components/MailApp';

export const metadata = { title: 'ZeroLatency' };

export default async function MailPage() {
  await connection();
  if (!env().demo) {
    const s = await readSession();
    if (!s.accounts.length) redirect('/login');
  }
  return <MailApp />;
}
