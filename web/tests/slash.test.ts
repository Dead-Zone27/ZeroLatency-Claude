import { describe, expect, it } from 'vitest';
import { rankSlash, slashQuery, type SlashCommand } from '@/lib/shared/slash';

describe('slashQuery', () => {
  it('triggers at the start of a line or after a space, not inside words, URLs or dates', () => {
    expect(slashQuery('/')).toBe('');
    expect(slashQuery('/bul')).toBe('bul');
    expect(slashQuery('Hi Priya, /date')).toBe('date');
    expect(slashQuery('see (/link')).toBe('link');
    expect(slashQuery('and/or')).toBeNull();
    expect(slashQuery('https://x.io/')).toBeNull();
    expect(slashQuery('due 1/2')).toBeNull();
    expect(slashQuery('/bulleted list')).toBe('bulleted list');
    expect(slashQuery('/bul  ')).toBeNull();
  });
});

describe('rankSlash', () => {
  const items: SlashCommand[] = [
    { key: 'h2', label: 'Heading', group: 'Format', icon: 'text' },
    { key: 'ul', label: 'Bulleted list', group: 'Format', icon: 'group', keywords: ['bullet', 'ul'] },
    { key: 'ol', label: 'Numbered list', group: 'Format', icon: 'list', keywords: ['ordered'] },
    { key: 'date', label: 'Today’s date', group: 'Insert', icon: 'cal', keywords: ['now'] },
    { key: 'short', label: 'Make shorter', group: 'AI', icon: 'sparkle', keywords: ['concise'] },
  ];
  const keys = (q: string) => rankSlash(items, q).map((r) => r.item.key);
  it('orders prefix matches first and matches keywords, groups and loose spellings', () => {
    expect(keys('')).toEqual(['h2', 'ul', 'ol', 'date', 'short']);
    expect(keys('list')).toEqual(['ul', 'ol']);
    expect(keys('bu')).toEqual(['ul']);
    expect(keys('ordered')).toEqual(['ol']);
    expect(keys('ai')).toEqual(['short']);
    expect(keys('nmbrd')).toEqual(['ol']);
    expect(keys('date')).toEqual(['date']);
    expect(keys('zzz')).toEqual([]);
  });
  it('reports the matched part of the label for highlighting', () => {
    expect(rankSlash(items, 'list')[0]!.match).toEqual([9, 13]);
  });
});
