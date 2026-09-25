'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/client/api';
import { formatListDate } from '@/lib/shared/compose';
import type { ThreadSummary } from '@/lib/shared/types';
import { Icon } from './icons';

const DELAY_MS = 550;
const MAX_CHARS = 420;

/** Latest-message text per thread version, shared across hovers. */
const cache = new Map<string, string>();

function plain(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('style, script, head, .gmail_quote, blockquote').forEach((n) => n.remove());
  return (doc.body.textContent ?? '').replace(/ /g, ' ');
}

function tidy(text: string): string {
  // Drop quoted replies ("On … wrote:" and "> " lines), collapse whitespace, trim to a short excerpt.
  const cut = text.split(/\n\s*On .{3,200}wrote:\s*\n/)[0]!;
  const body = cut.split('\n').filter((l) => !l.trimStart().startsWith('>')).join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return body.length > MAX_CHARS ? `${body.slice(0, MAX_CHARS).trimEnd()}…` : body;
}

/**
 * A small read-only card describing a thread, shown after the pointer rests on a row. It never takes focus or
 * pointer events, so it can't get in the way of clicking.
 */
export function HoverPreview({ thread, rect, me }: { thread: ThreadSummary; rect: DOMRect; me: string }) {
  const key = `${thread.id}:${thread.historyId}`;
  const [shown, setShown] = useState(false);
  const [body, setBody] = useState<{ key: string; text: string } | null>(() => (cache.has(key) ? { key, text: cache.get(key)! } : null));
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [key]);

  useEffect(() => {
    if (!shown || cache.has(key)) return;
    let alive = true;
    api.thread(thread.id).then((d) => {
      const last = [...d.messages].reverse().find((m) => !m.labelIds.includes('DRAFT'));
      const text = tidy(last ? (last.text ?? (last.html ? plain(last.html) : last.snippet)) : thread.snippet);
      cache.set(key, text);
      if (alive) setBody({ key, text });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [shown, key, thread.id, thread.snippet]);

  // Below the row, starting under the subject; above it when there is no room below.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!shown || !el) return;
    const h = el.offsetHeight, w = el.offsetWidth;
    const left = Math.max(8, Math.min(rect.left + Math.min(rect.width * 0.3, 240), window.innerWidth - w - 8));
    const top = rect.bottom + 6 + h > window.innerHeight - 8 ? Math.max(8, rect.top - h - 6) : rect.bottom + 6;
    setPos({ top, left });
  }, [shown, rect, body]);

  if (!shown) return null;
  const others = thread.participants.filter((p) => p.email.toLowerCase() !== me.toLowerCase());
  const from = others[others.length - 1] ?? thread.participants[0];
  const text = body && body.key === key ? body.text : thread.snippet;
  return createPortal(
    <div ref={ref} className="zl-hover-preview" role="tooltip" style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}>
      <header>
        <strong>{from?.name || from?.email || '(unknown)'}</strong>
        {from?.name ? <small>{from.email}</small> : <small />}
        <time>{formatListDate(thread.lastDate)}</time>
      </header>
      <h4>{thread.subject || '(no subject)'}</h4>
      <p>{text || 'No preview available.'}</p>
      <footer>
        {thread.messageCount > 1 ? <span>{thread.messageCount} messages</span> : null}
        {thread.participants.length > 2 ? <span>{thread.participants.length} people</span> : null}
        {thread.hasAttachment ? <span><Icon name="clip" /> Attachment</span> : null}
        {thread.hasCalendar ? <span><Icon name="cal" /> Invitation</span> : null}
      </footer>
    </div>,
    document.body,
  );
}
