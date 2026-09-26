/**
 * Column layout for list rows, driven by the order of a view's shown properties. Every column has a stable width
 * (sized from the list's width via container units), so rows stay aligned in any order; only the subject flexes.
 */

export type RowCell = 'from' | 'subject' | 'labels' | 'files' | 'date' | `prop:${string}`;

const WIDTH: Record<'from' | 'subject' | 'labels' | 'files' | 'date', string> = {
  from: 'clamp(80px, 20cqi, 200px)',
  subject: 'minmax(96px, 1fr)',
  labels: 'clamp(56px, 20cqi, 200px)',
  files: '40px',
  date: '72px',
};
const PROP_WIDTH = 'clamp(64px, 13cqi, 150px)';

export function rowCells(shown: readonly string[], customIds: readonly string[]): RowCell[] {
  const cells: RowCell[] = [];
  for (const k of shown) {
    // The preview text lives in the subject cell; on its own it takes the subject's place.
    const key = k === 'snippet' ? 'subject' : k;
    if (cells.includes(key as RowCell)) continue;
    if (key === 'from' || key === 'subject' || key === 'labels' || key === 'files' || key === 'date') cells.push(key);
    else if (key.startsWith('prop:') && customIds.includes(key.slice(5))) cells.push(key as RowCell);
  }
  // Something has to take the free space.
  if (!cells.includes('subject')) cells.splice(Math.min(1, cells.length), 0, 'subject');
  return cells;
}

/** grid-template-columns for a row: checkbox + unread dot, then the cells in order. */
export function rowTemplate(cells: readonly RowCell[]): string {
  return ['20px', '8px', ...cells.map((c) => (c.startsWith('prop:') ? PROP_WIDTH : WIDTH[c as keyof typeof WIDTH]))].join(' ');
}

export const DEFAULT_SHOWN = ['from', 'subject', 'labels', 'files', 'date'];
/** The previous default order (date before files), which rendered files first anyway. */
export const LEGACY_DEFAULT_SHOWN = ['from', 'subject', 'labels', 'date', 'files'];
