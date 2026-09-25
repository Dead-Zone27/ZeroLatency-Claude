/** Slash-command helpers for the composer: detecting the trigger and ranking commands. */

export interface SlashCommand {
  key: string;
  label: string;
  group: string;
  icon: string;
  hint?: string;
  keywords?: string[];
}

export interface RankedCommand<T extends SlashCommand = SlashCommand> {
  item: T;
  /** [start, end) of the label to highlight, when the query matched the label directly. */
  match: [number, number] | null;
}

/**
 * Returns the query typed after a "/" that starts a word (at the start of the line or after a space or bracket),
 * or null when the caret is not in a slash command. "and/or", URLs and dates like 1/2 never trigger it.
 */
export function slashQuery(textBeforeCaret: string): string | null {
  const m = /(?:^|[\s(])\/([^\s/][^/\n]{0,23}|)$/.exec(textBeforeCaret);
  if (!m) return null;
  const q = m[1]!;
  // Two spaces in a row, or a trailing space after a word nobody matched, end the command.
  if (/\s\s/.test(q)) return null;
  return q;
}

function subsequence(hay: string, needle: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
}

/** Ranks commands for a query: label prefix > word prefix > substring > keyword > loose subsequence. */
export function rankSlash<T extends SlashCommand>(items: T[], rawQuery: string): RankedCommand<T>[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return items.map((item) => ({ item, match: null }));
  const scored: { item: T; score: number; match: [number, number] | null; order: number }[] = [];
  items.forEach((item, order) => {
    const label = item.label.toLowerCase();
    const at = label.indexOf(q);
    let score = 0;
    if (label.startsWith(q)) score = 5;
    else if (at > 0 && /[\s(“"'-]/.test(label[at - 1]!)) score = 4;
    else if (at > 0) score = 3;
    else if ((item.keywords ?? []).some((k) => k.toLowerCase().startsWith(q))) score = 2;
    else if (item.group.toLowerCase().startsWith(q)) score = 1.5;
    else if (q.length > 2 && subsequence(label.replace(/\s+/g, ''), q.replace(/\s+/g, ''))) score = 1;
    if (score) scored.push({ item, score, match: at >= 0 ? [at, at + q.length] : null, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map(({ item, match }) => ({ item, match }));
}
