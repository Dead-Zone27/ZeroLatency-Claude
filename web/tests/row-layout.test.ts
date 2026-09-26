import { describe, expect, it } from 'vitest';
import { rowCells, rowTemplate } from '@/lib/shared/row-layout';

describe('row layout', () => {
  it('follows the shown order and folds the preview into the subject cell', () => {
    expect(rowCells(['from', 'subject', 'snippet', 'labels', 'files', 'date'], [])).toEqual(['from', 'subject', 'labels', 'files', 'date']);
    expect(rowCells(['date', 'subject', 'from'], [])).toEqual(['date', 'subject', 'from']);
    expect(rowCells(['snippet', 'from'], [])).toEqual(['subject', 'from']);
  });
  it('keeps custom properties that exist and always has a flexible subject column', () => {
    expect(rowCells(['from', 'prop:a', 'prop:gone', 'date'], ['a'])).toEqual(['from', 'subject', 'prop:a', 'date']);
    expect(rowTemplate(['from', 'subject', 'date'])).toBe('20px 8px clamp(80px, 20cqi, 200px) minmax(96px, 1fr) 72px');
  });
});
