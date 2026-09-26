'use client';
import { useState } from 'react';
import { api } from '@/lib/client/api';
import { updateAccount, useAccountData, type AutoLabel } from '@/lib/client/store';
import { uid } from '@/lib/shared/views';
import { Icon } from './icons';
import { Dialog, IconButton, Spinner, Toggle, useToast } from './ui';
import { useMail } from './mail-context';

export const CATEGORY_SUGGESTIONS = [
  { name: 'Needs reply', description: 'Emails from real people that ask me a question or need a response from me.' },
  { name: 'Receipts', description: 'Receipts, invoices, order confirmations and payment notifications.' },
  { name: 'Newsletters', description: 'Newsletters, digests and marketing emails I subscribed to.' },
  { name: 'Travel', description: 'Flight, hotel, train and rental bookings, itineraries and check-in reminders.' },
  { name: 'Recruiting', description: 'Messages from candidates, recruiters or hiring platforms about roles.' },
  { name: 'Notifications', description: 'Automated alerts from apps and services: security, builds, shipping, account updates.' },
];

interface Draft { id: string; ruleId: string | null; name: string; description: string; enabled: boolean }

/**
 * Edit the categories Auto label sorts mail into. Each category is an auto label: a plain-language description
 * and the Gmail label it applies. Renaming renames the Gmail label (and views that filter on it); removing a
 * category stops labelling but keeps the Gmail label and the mail already labelled.
 */
export function CategoriesDialog({ onClose }: { onClose: () => void }) {
  const data = useAccountData();
  const { labels, ensureLabel, refreshLabels, aiEnabled } = useMail();
  const { push } = useToast();
  const [rows, setRows] = useState<Draft[]>(() => data.autoLabels.map((r) => ({ id: r.id, ruleId: r.id, name: r.name, description: r.description, enabled: r.enabled })));
  const [busy, setBusy] = useState(false);

  const set = (id: string, patch: Partial<Draft>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = (seed?: { name: string; description: string }) => setRows((rs) => [...rs, { id: uid('new_'), ruleId: null, name: seed?.name ?? '', description: seed?.description ?? '', enabled: true }]);
  const names = rows.map((r) => r.name.trim().toLowerCase());
  const duplicate = names.some((n, i) => n && names.indexOf(n) !== i);
  const incomplete = rows.some((r) => !r.name.trim() || r.description.trim().length < 8);
  const unused = CATEGORY_SUGGESTIONS.filter((s) => !names.includes(s.name.toLowerCase()));

  const save = async () => {
    setBusy(true);
    try {
      const next: AutoLabel[] = [];
      const renames: { from: string; to: string }[] = [];
      for (const r of rows) {
        const name = r.name.trim();
        const description = r.description.trim();
        const old = r.ruleId ? data.autoLabels.find((x) => x.id === r.ruleId) : undefined;
        if (old) {
          let labelId = old.labelId;
          const label = labels.find((l) => l.id === old.labelId);
          if (!label) labelId = (await ensureLabel(name)).id;
          else if (label.name !== name) { await api.renameLabel(label.id, name); renames.push({ from: label.name, to: name }); }
          next.push({ ...old, name, description, enabled: r.enabled, labelId });
        } else {
          const label = await ensureLabel(name);
          next.push({ id: uid('al_'), name, description, labelId: label.id, enabled: r.enabled, keepInInbox: true, createdAt: Date.now() });
        }
      }
      const changed = next.some((n) => { const o = data.autoLabels.find((x) => x.id === n.id); return !o || o.description !== n.description || o.labelId !== n.labelId; });
      updateAccount((d) => ({
        ...d,
        autoLabels: next,
        // A changed description means earlier decisions may no longer hold: let new mail be re-checked.
        autoLabelSeen: changed ? {} : d.autoLabelSeen,
        views: renames.length ? d.views.map((v) => ({
          ...v,
          name: renames.find((x) => x.from === v.name && v.autoLabelId)?.to ?? v.name,
          filters: v.filters.map((f) => (f.field === 'label' ? { ...f, values: f.values.map((val) => renames.find((x) => x.from.toLowerCase() === val.toLowerCase())?.to ?? val) } : f)),
        })) : d.views,
      }));
      await refreshLabels().catch(() => undefined);
      push({ message: 'Categories saved' });
      onClose();
    } catch (e) {
      push({ message: `Couldn’t save categories: ${(e as Error).message}`, tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Auto label categories" onClose={onClose} wide actions={
      <>
        <button className="zl-btn zl-btn--ghost" onClick={onClose}>Cancel</button>
        <button className="zl-btn zl-btn--primary" disabled={busy || incomplete || duplicate} onClick={save}>{busy ? <Spinner /> : null}Save categories</button>
      </>
    }>
      <p>Auto label sorts email into these categories. Describe each one in plain words; the name becomes a Gmail label.</p>
      {!aiEnabled ? <div className="zl-banner zl-banner--error">AI is not configured on the server (OPENAI_API_KEY).</div> : null}
      <div className="zl-cat-list">
        {rows.length === 0 ? <p className="zl-field-hint" style={{ margin: 0 }}>No categories yet. Add one or start from a suggestion.</p> : null}
        {rows.map((r) => (
          <div key={r.id} className="zl-cat-row">
            <div className="zl-cat-head">
              <input className="zl-input" value={r.name} placeholder="Category name" maxLength={60} aria-label="Category name" onChange={(e) => set(r.id, { name: e.target.value })} />
              <Toggle checked={r.enabled} label={`Use ${r.name || 'category'}`} onChange={(v) => set(r.id, { enabled: v })} />
              <IconButton icon="trash" label={`Remove ${r.name || 'category'}`} size="sm" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} />
            </div>
            <textarea className="zl-input zl-textarea" rows={2} value={r.description} placeholder="Which emails belong here?" aria-label={`Which emails belong in ${r.name || 'this category'}`} onChange={(e) => set(r.id, { description: e.target.value })} />
          </div>
        ))}
      </div>
      {duplicate ? <p className="zl-field-hint" style={{ color: 'var(--danger-text)' }}>Two categories have the same name.</p> : null}
      <div className="zl-cat-add">
        <button className="zl-btn zl-btn--secondary zl-btn--sm" onClick={() => add()}><Icon name="plus" />Add category</button>
        {unused.map((s) => <button key={s.name} className="zl-btn zl-btn--ghost zl-btn--sm" onClick={() => add(s)}>{s.name}</button>)}
      </div>
      <p className="zl-field-hint">Removing a category stops auto labelling; the Gmail label and labelled mail stay.</p>
    </Dialog>
  );
}
