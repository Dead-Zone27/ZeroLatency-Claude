'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/client/api';
import { deleteView, duplicateView, updateAccount, useAccountData } from '@/lib/client/store';
import type { Label } from '@/lib/shared/types';
import type { View } from '@/lib/shared/views';
import { Icon } from './icons';
import { Check, Dialog, Popover, useMenuKeys, useToast } from './ui';
import { useMail } from './mail-context';

/** Right-click menu for a view in the sidebar. */
export function ViewContextMenu({ view, at, onRename, onChangeIcon, onDelete, onClose }: {
  view: View;
  at: DOMRect;
  onRename: () => void;
  onChangeIcon: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { navigate, openEditView } = useMail();
  const ref = useRef<HTMLDivElement>(null);
  useMenuKeys(ref);
  const run = (fn: () => void) => () => { onClose(); fn(); };
  return (
    <Popover anchor={at} onClose={onClose} label={`${view.name} options`}>
      <div className="zl-menu" ref={ref} role="menu" style={{ width: 220 }}>
        <button className="zl-menu-item" role="menuitem" autoFocus onClick={run(onRename)}><Icon name="pen" />Rename</button>
        <button className="zl-menu-item" role="menuitem" onClick={run(onChangeIcon)}><Icon name="sparkle" />Change icon</button>
        <button className="zl-menu-item" role="menuitem" onClick={run(() => { navigate({ kind: 'view', id: view.id }); openEditView(view.id); })}><Icon name="gear" />Edit view</button>
        <button className="zl-menu-item" role="menuitem" onClick={run(() => navigate({ kind: 'view', id: duplicateView(view) }))}><Icon name="plus" />Duplicate</button>
        <div className="zl-menu-sep" />
        <button className="zl-menu-item zl-menu-item--danger" role="menuitem" onClick={run(onDelete)}><Icon name="trash" />Delete view</button>
      </div>
    </Popover>
  );
}

/** Gmail labels a view is built on (its "label is" filters and its auto label), excluding ones other views still use. */
function labelsOwnedBy(view: View, views: View[], labels: Label[], autoLabels: { id: string; labelId: string }[]): Label[] {
  const named = (v: View) => v.filters.flatMap((f) => (f.field === 'label' && f.op === 'is' ? f.values : [])).map((n) => n.toLowerCase());
  const mine = new Set(named(view));
  const auto = view.autoLabelId ? autoLabels.find((r) => r.id === view.autoLabelId) : undefined;
  const others = new Set(views.filter((v) => v.id !== view.id).flatMap(named));
  return labels.filter((l) => l.type === 'user' && !l.name.startsWith('ZeroLatency/')
    && (mine.has(l.name.toLowerCase()) || l.id === auto?.labelId) && !others.has(l.name.toLowerCase()));
}

/** Confirms deleting a view, and by default the Gmail label(s) it was built on. Keeps at least one view. */
export function DeleteViewDialog({ view, onClose, onDeleted }: { view: View; onClose: () => void; onDeleted?: () => void }) {
  const data = useAccountData();
  const { labels, refreshLabels, refreshList, refreshCounts } = useMail();
  const { push } = useToast();
  const owned = labelsOwnedBy(view, data.views, labels, data.autoLabels);
  const [alsoLabels, setAlsoLabels] = useState<Set<string>>(() => new Set(owned.map((l) => l.id)));
  const [busy, setBusy] = useState(false);
  const last = data.views.length <= 1;

  const remove = async () => {
    setBusy(true);
    const ids = owned.filter((l) => alsoLabels.has(l.id)).map((l) => l.id);
    deleteView(view.id);
    // Auto labels that would write into a label being deleted go with it.
    if (ids.length || view.autoLabelId) updateAccount((d) => ({ ...d, autoLabels: d.autoLabels.filter((r) => !ids.includes(r.labelId) && r.id !== view.autoLabelId) }));
    onClose();
    onDeleted?.();
    if (!ids.length) return;
    const failed: string[] = [];
    for (const id of ids) await api.deleteLabel(id).catch(() => failed.push(labels.find((l) => l.id === id)?.name ?? id));
    await refreshLabels().catch(() => undefined);
    refreshList(); refreshCounts();
    if (failed.length) push({ message: `View deleted, but Gmail couldn’t delete ${failed.map((n) => `“${n}”`).join(', ')}.`, tone: 'error' });
    else push({ message: ids.length === 1 ? 'View and Gmail label deleted' : `View and ${ids.length} Gmail labels deleted` });
  };

  return (
    <Dialog
      title="Delete view"
      onClose={onClose}
      actions={
        <>
          <button className="zl-btn zl-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="zl-btn zl-btn--danger-solid" disabled={last || busy} onClick={remove}>Delete</button>
        </>
      }
    >
      <p>{last ? 'This is your only view. Create another view before deleting it.' : <>Delete “{view.name}”?</>}</p>
      {!last && owned.length ? (
        <div className="zl-delete-labels">
          {owned.map((l) => (
            <Check
              key={l.id}
              checked={alsoLabels.has(l.id)}
              onChange={(v) => setAlsoLabels((cur) => { const n = new Set(cur); if (v) n.add(l.id); else n.delete(l.id); return n; })}
              label={`Also delete the Gmail label “${l.name}”`}
              visibleLabel
            />
          ))}
          <p className="zl-field-hint">Emails aren’t deleted, only the label is removed from them.</p>
        </div>
      ) : !last ? <p className="zl-field-hint">Your email isn’t affected: the view is just a saved filter.</p> : null}
    </Dialog>
  );
}
