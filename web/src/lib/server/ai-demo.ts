import 'server-only';
// Canned AI output for the offline demo when no OPENAI_API_KEY is configured. Never used with a real account.
import type { ThreadDetail, ThreadSummary } from '../shared/types';
import type { AutoLabelRule, ThreadAISummary } from './ai';

export function demoSummary(t: ThreadDetail): ThreadAISummary {
  const people = [...new Set(t.messages.map((m) => m.from?.name || m.from?.email).filter(Boolean))].join(', ');
  return {
    summary: `${people} discussed “${t.subject}” across ${t.messages.length} message${t.messages.length === 1 ? '' : 's'}. (Demo summary: connect OpenAI for real summaries.)`,
    keyPoints: t.messages.slice(-3).map((m) => m.snippet.slice(0, 90)),
    actionItems: [],
  };
}

export function demoDraft(t: ThreadDetail): string {
  const first = t.messages[t.messages.length - 1]?.from?.name?.split(' ')[0] ?? 'there';
  return `Hi ${first},\n\nThanks for the note. I’ll take a look and get back to you by tomorrow.\n\n(Demo draft: connect OpenAI for real drafts.)`;
}

export function demoWrite(prompt: string, draft: string): string {
  return draft ? `${draft}\n\n[Demo edit for: ${prompt}]` : `[Demo text for: ${prompt}]`;
}

export function demoClassify(rules: AutoLabelRule[], threads: ThreadSummary[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const t of threads) {
    const hay = `${t.subject} ${t.snippet} ${t.participants.map((p) => p.email).join(' ')}`.toLowerCase();
    const hits = rules.filter((r) => `${r.name} ${r.description}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3).some((w) => hay.includes(w)));
    out.set(t.id, hits.map((r) => r.id));
  }
  return out;
}
