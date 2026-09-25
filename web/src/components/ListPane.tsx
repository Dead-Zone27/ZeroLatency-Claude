'use client';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { updateSettings, updateView, useAccountData, useSettings, type PropertyDef, type PropertyValue } from '@/lib/client/store';
import { ALL_HOVER_ACTIONS, groupThreads, type HoverAction } from '@/lib/shared/views';
import { formatListDate, participantLabel } from '@/lib/shared/compose';
import type { Label, ThreadSummary } from '@/lib/shared/types';
import { Glyph, Icon, StatusDot } from './icons';
import { Check, IconButton, Spinner } from './ui';
import { FOLDERS, useMail } from './mail-context';
import { LabelChip, LabelMenu, RemindMenu } from './ThreadMenus';
import { FilterMenu } from './FilterMenu';
import { GroupByMenu } from './GroupByMenu';

interface ListState { q: string; threads: ThreadSummary[]; next: string | null; loading: boolean; loadingMore: boolean; error: string | null }

export function ListPane({ state, selected, setSelected, onLoadMore, onRetry, searchOpen, setSearchOpen, onOpenSidebar }: {
  state: ListState;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  onOpenSidebar: () => void;
}) {
  const { nav, activeView, labels, me, openThreadId, openThread, act } = useMail();
  const data = useAccountData();
  const view = activeView;
  const props = useMemo(() => (view ? data.properties[view.id] ?? [] : []), [view, data.properties]);
  const groups = useMemo(() => {
    const groupBy = view?.groupBy ?? (nav.kind === 'folder' && ['drafts', 'spam', 'trash'].includes(nav.id) ? { kind: 'none' as const } : { kind: 'date' as const });
    const prop = groupBy.kind === 'property' ? props.find((p) => p.id === groupBy.propertyId) : undefined;
    return groupThreads(state.threads, groupBy, {
      me, labels,
      propertyValue: prop ? (id) => {
        const v = data.values[id]?.[prop.id];
        const opt = prop.options.find((o) => o.id === (Array.isArray(v) ? v[0] : v)) ?? prop.options.find((o) => o.id === prop.defaultOptionId);
        return opt?.name ?? null;
      } : undefined,
      propertyOptions: prop?.options.map((o) => o.name),
    });
  }, [state.threads, view, nav, props, me, labels, data.values]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !state.next) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) onLoadMore(); }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [state.next, onLoadMore]);

  const shown = view?.shown ?? ['from', 'subject', 'labels', 'date', 'files'];
  const hover = view?.hoverActions ?? ALL_HOVER_ACTIONS.filter((a) => a !== 'star');
  const allSelected = state.threads.length > 0 && state.threads.every((t) => selected.has(t.id));

  return (
    <section className="zl-listpane" aria-label="Thread list">
      {searchOpen ? <SearchBar onClose={() => setSearchOpen(false)} /> : (
        <ViewHeader
          allSelected={allSelected}
          someSelected={selected.size > 0 && !allSelected}
          onSelectAll={(v) => setSelected(v ? new Set(state.threads.map((t) => t.id)) : new Set())}
          onOpenSidebar={onOpenSidebar}
        />
      )}
      <div>
        {selected.size ? (
          <BulkBar ids={[...selected]} threads={state.threads} onDone={() => setSelected(new Set())} />
        ) : null}
        {state.error ? (
          <div className="zl-banner zl-banner--error" role="alert"><Icon name="important" />{state.error}<button className="zl-btn zl-btn--text zl-btn--sm" style={{ marginLeft: 'auto' }} onClick={onRetry}>Retry</button></div>
        ) : null}
      </div>
      <div className="zl-scroll">
        {state.loading ? <div className="zl-loadmore" aria-busy="true"><Spinner /></div> : null}
        {!state.loading && !state.error && !state.threads.length ? (
          <div className="zl-empty">
            <Icon name={nav.kind === 'search' ? 'search' : 'inbox'} />
            <strong>{nav.kind === 'search' ? 'No results' : view ? 'Nothing here' : 'No conversations'}</strong>
            <span>{nav.kind === 'search' ? 'Try different words or Gmail search operators.' : view ? 'Threads that match this view’s filters will appear here.' : 'This folder is empty.'}</span>
          </div>
        ) : null}
        <ul className="zl-list" role="listbox" aria-label="Threads" aria-multiselectable="true">
          {groups.map((g) => (
            <GroupBlock key={g.key} id={g.key} title={g.title} monogram={g.monogram}>
              {g.threads.map((t) => (
                <Row
                  key={t.id}
                  t={t}
                  me={me}
                  labels={labels}
                  shown={shown}
                  hover={hover}
                  props={props}
                  values={data.values[t.id]}
                  open={openThreadId === t.id}
                  checked={selected.has(t.id)}
                  isSent={nav.kind === 'folder' && nav.id === 'sent'}
                  onOpen={() => openThread(t.id)}
                  onCheck={(v) => { const n = new Set(selected); if (v) n.add(t.id); else n.delete(t.id); setSelected(n); }}
                  act={act}
                />
              ))}
            </GroupBlock>
          ))}
        </ul>
        <div ref={sentinel} />
        {state.loadingMore ? <div className="zl-loadmore"><Spinner /></div> : null}
      </div>
    </section>
  );
}

function GroupBlock({ id, title, monogram, children }: { id: string; title: string; monogram?: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!title) return <>{children}</>;
  return (
    <>
      <li className="zl-group" id={`group-${id}`} role="presentation">
        {monogram ? <span className="zl-monogram">{monogram}</span> : null}
        <span>{title}</span>
        <span className="zl-group-actions">
          <button className="zl-btn zl-btn--text" aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)}>{collapsed ? 'Expand' : 'Collapse'}</button>
        </span>
      </li>
      {collapsed ? null : children}
    </>
  );
}

function ViewHeader({ allSelected, someSelected, onSelectAll, onOpenSidebar }: { allSelected: boolean; someSelected: boolean; onSelectAll: (v: boolean) => void; onOpenSidebar: () => void }) {
  const { nav, activeView, refreshList, openEditView, openAutoLabel } = useMail();
  const settings = useSettings();
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [groupAnchor, setGroupAnchor] = useState<HTMLElement | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const folder = nav.kind === 'folder' ? FOLDERS.find((f) => f.id === nav.id) : null;
  const hasFilters = !!activeView && activeView.filters.length > 1;

  return (
    <header className="zl-viewbar">
      <span className="zl-only-mobile"><IconButton icon="menu" label="Open sidebar" onClick={onOpenSidebar} /></span>
      {settings.sidebarCollapsed ? <IconButton icon="expand" label="Expand sidebar" onClick={() => updateSettings({ sidebarCollapsed: false })} /> : null}
      <Check checked={allSelected} mixed={someSelected} onChange={onSelectAll} label="Select all threads" />
      <h1 className="zl-viewbar-title" style={{ fontSize: 'inherit', margin: 0 }}>
        {activeView ? (
          <>
            <Glyph name={activeView.glyph} ink={activeView.ink} />
            {renaming ? (
              <input className="zl-inline-name" autoFocus defaultValue={activeView.name} aria-label="View name"
                onBlur={(e) => { const name = e.target.value.trim(); if (name) updateView(activeView.id, (v) => ({ ...v, name })); setRenaming(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(false); }} />
            ) : <span onDoubleClick={() => setRenaming(true)} title="Double-click to rename">{activeView.name}</span>}
          </>
        ) : folder ? (<><Icon name={folder.icon} className="zl-icon--lg" /><span>{folder.name}</span></>) : (<><Icon name="search" className="zl-icon--lg" /><span>Search: {nav.id}</span></>)}
      </h1>
      <div className="zl-viewbar-tools">
        {activeView ? (
          <>
            <button className="zl-btn zl-btn--secondary" onClick={() => openAutoLabel()}><Icon name="wand" />Auto label</button>
            <IconButton icon="filter" label="Filter" shortcut="Ctrl F" pressed={hasFilters} className={hasFilters ? 'is-on' : ''} onClick={(e) => setFilterAnchor(e.currentTarget)} />
            <IconButton icon="group" label="Group by" onClick={(e) => setGroupAnchor(e.currentTarget)} />
            <IconButton icon="gear" label="Edit view" shortcut="Ctrl E" onClick={() => openEditView(activeView.id)} />
          </>
        ) : null}
        <IconButton icon="refresh" label="Refresh" onClick={() => { setSpinning(true); refreshList(); setTimeout(() => setSpinning(false), 600); }} className={spinning ? 'is-on' : ''} />
      </div>
      {filterAnchor && activeView ? <FilterMenu anchor={filterAnchor} view={activeView} onClose={() => setFilterAnchor(null)} /> : null}
      {groupAnchor && activeView ? <GroupByMenu anchor={groupAnchor} view={activeView} onClose={() => setGroupAnchor(null)} /> : null}
      <ViewShortcuts onFilter={() => { const b = document.querySelector<HTMLElement>('[aria-label="Filter"]'); if (b) setFilterAnchor(b); }} onEdit={() => activeView && openEditView(activeView.id)} />
    </header>
  );
}

function ViewShortcuts({ onFilter, onEdit }: { onFilter: () => void; onEdit: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'f') { e.preventDefault(); onFilter(); }
      if (e.key === 'e') { e.preventDefault(); onEdit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFilter, onEdit]);
  return null;
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const { nav, navigate } = useMail();
  const [q, setQ] = useState(nav.kind === 'search' ? nav.id : '');
  return (
    <form className="zl-searchbar" role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate({ kind: 'search', id: q.trim() }); }}>
      <Icon name="search" className="zl-icon--lg" />
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mail (Gmail operators work: from:, has:attachment, older_than:…)" aria-label="Search mail"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} />
      <button type="submit" className="zl-btn zl-btn--primary" disabled={!q.trim()}>Search</button>
      <IconButton icon="x" label="Close search" onClick={onClose} />
    </form>
  );
}

function BulkBar({ ids, threads, onDone }: { ids: string[]; threads: ThreadSummary[]; onDone: () => void }) {
  const { act } = useMail();
  const [labelAnchor, setLabelAnchor] = useState<HTMLElement | null>(null);
  const [remindAnchor, setRemindAnchor] = useState<HTMLElement | null>(null);
  const sel = threads.filter((t) => ids.includes(t.id));
  const anyUnread = sel.some((t) => t.unread);
  const run = (a: Parameters<typeof act>[1]) => { void act(ids, a); onDone(); };
  return (
    <div className="zl-banner" role="toolbar" aria-label="Selected threads">
      <span>{ids.length} selected</span>
      <div className="zl-bulkbar">
        <IconButton icon="archive" label="Archive" shortcut="E" onClick={() => run({ kind: 'archive' })} />
        <IconButton icon="trash" label="Move to Trash" shortcut="#" onClick={() => run({ kind: 'trash' })} />
        <IconButton icon={anyUnread ? 'read' : 'unread'} label={anyUnread ? 'Mark as read' : 'Mark as unread'} onClick={() => run({ kind: anyUnread ? 'read' : 'unread' })} />
        <IconButton icon="tag" label="Label" onClick={(e) => setLabelAnchor(e.currentTarget)} />
        <IconButton icon="clock" label="Remind me" onClick={(e) => setRemindAnchor(e.currentTarget)} />
        <IconButton icon="spam" label="Report spam" onClick={() => run({ kind: 'spam' })} />
      </div>
      <button className="zl-btn zl-btn--text zl-btn--sm" style={{ marginLeft: 'auto' }} onClick={onDone}>Clear</button>
      {labelAnchor ? <LabelMenu anchor={labelAnchor} threadIds={ids} current={sel.map((t) => t.labelIds)} onClose={() => { setLabelAnchor(null); onDone(); }} /> : null}
      {remindAnchor ? <RemindMenu anchor={remindAnchor} threadIds={ids} onClose={() => { setRemindAnchor(null); onDone(); }} /> : null}
    </div>
  );
}

function PropertyCell({ def, value }: { def: PropertyDef; value: PropertyValue | undefined }) {
  const v = value ?? (def.defaultOptionId && (def.type === 'status' || def.type === 'select') ? def.defaultOptionId : null);
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return null;
  switch (def.type) {
    case 'select': case 'status': case 'multiSelect': {
      const ids = Array.isArray(v) ? v : [String(v)];
      return (
        <>
          {ids.map((id) => {
            const o = def.options.find((x) => x.id === id);
            if (!o) return null;
            if (def.type === 'status' && o.state) {
              return <span key={id} className={`zl-status zl-status--${o.state}`} style={{ fontSize: 'var(--text-xs)' }}><StatusDot state={o.state} />{o.name}</span>;
            }
            return <span key={id} className={`zl-tag ${o.ink === 'gray' ? '' : `zl-tag--${o.ink}`}`}><span>{o.name}</span></span>;
          })}
        </>
      );
    }
    case 'checkbox': return v ? <Icon name="checkbox" /> : null;
    case 'date': return <span className="zl-row-prop">{new Date(String(v)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
    default: return <span className="zl-row-prop" title={String(v)}>{String(v)}</span>;
  }
}

const Row = memo(function Row({ t, me, labels, shown, hover, props, values, open, checked, isSent, onOpen, onCheck, act }: {
  t: ThreadSummary; me: string; labels: Label[]; shown: string[]; hover: HoverAction[]; props: PropertyDef[]; values?: Record<string, PropertyValue>;
  open: boolean; checked: boolean; isSent: boolean; onOpen: () => void; onCheck: (v: boolean) => void; act: ReturnType<typeof useMail>['act'];
}) {
  const [labelAnchor, setLabelAnchor] = useState<HTMLElement | null>(null);
  const [remindAnchor, setRemindAnchor] = useState<HTMLElement | null>(null);
  const userLabels = labels.filter((l) => l.type === 'user' && t.labelIds.includes(l.id) && !l.name.startsWith('ZeroLatency/'));
  const who = participantLabel(t.participants, me, t.messageCount);
  const has = (k: string) => shown.includes(k);
  const customShown = props.filter((p) => has(`prop:${p.id}`));

  const actions: Record<HoverAction, React.ReactNode> = {
    archive: <IconButton key="a" icon="archive" label="Archive" shortcut="E" onClick={(e) => { e.stopPropagation(); void act([t.id], { kind: 'archive' }); }} />,
    trash: <IconButton key="t" icon="trash" label="Move to Trash" shortcut="#" onClick={(e) => { e.stopPropagation(); void act([t.id], { kind: 'trash' }); }} />,
    read: <IconButton key="r" icon={t.unread ? 'read' : 'unread'} label={t.unread ? 'Mark as read' : 'Mark as unread'} onClick={(e) => { e.stopPropagation(); void act([t.id], { kind: t.unread ? 'read' : 'unread' }); }} />,
    remind: <IconButton key="m" icon="clock" label="Remind me" shortcut="H" onClick={(e) => { e.stopPropagation(); setRemindAnchor(e.currentTarget); }} />,
    label: <IconButton key="l" icon="tag" label="Label" onClick={(e) => { e.stopPropagation(); setLabelAnchor(e.currentTarget); }} />,
    star: <IconButton key="s" icon={t.starred ? 'starFill' : 'star'} label={t.starred ? 'Unstar' : 'Star'} shortcut="S" onClick={(e) => { e.stopPropagation(); void act([t.id], { kind: t.starred ? 'unstar' : 'star' }); }} />,
  };

  const sender = isSent
    ? `To: ${(t.recipients.length ? t.recipients : t.participants).filter((p) => p.email.toLowerCase() !== me.toLowerCase()).map((p) => p.name || p.email).join(', ') || 'me'}`
    : who.names;

  return (
    <li
      className={`zl-row ${t.unread ? 'zl-row--unread' : ''} ${checked ? 'is-checked' : ''} ${has('from') ? '' : 'zl-row--simple'}`}
      role="option"
      aria-selected={open || checked}
      tabIndex={0}
      data-thread-id={t.id}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onOpen(); }}
    >
      <Check checked={checked} onChange={onCheck} label={`Select ${t.subject || 'thread'}`} />
      <span className="zl-row-dot" aria-label={t.unread ? 'Unread' : undefined} />
      {has('from') ? (
        <span className="zl-row-from">
          {sender}{who.count && !isSent ? <span className="zl-row-count">{who.count}</span> : null}
          {t.hasDraft ? <span className="zl-row-draft">{' '}Draft</span> : null}
        </span>
      ) : null}
      <span className="zl-row-subject">
        {has('subject') ? (t.subject || '(no subject)') : null}
        {has('snippet') && t.snippet ? <span className="zl-row-snippet">{has('subject') ? ' · ' : ''}{t.snippet}</span> : null}
      </span>
      <span className="zl-row-meta">
        {customShown.map((p) => <PropertyCell key={p.id} def={p} value={values?.[p.id]} />)}
        {t.starred ? <Icon name="starFill" className="zl-row-star" /> : null}
        {has('labels') ? userLabels.slice(0, 2).map((l) => <LabelChip key={l.id} label={l} />) : null}
        {has('labels') && userLabels.length > 2 ? <span className="zl-tag-more">+{userLabels.length - 2}</span> : null}
        {has('files') && t.hasCalendar ? <Icon name="cal" /> : null}
        {has('files') && t.hasAttachment ? <Icon name="clip" /> : null}
      </span>
      <span className="zl-row-time">{has('date') ? formatListDate(t.lastDate) : ''}</span>
      <span className="zl-row-actions" onClick={(e) => e.stopPropagation()}>{hover.map((h) => actions[h])}</span>
      {labelAnchor ? <LabelMenu anchor={labelAnchor} threadIds={[t.id]} current={[t.labelIds]} onClose={() => setLabelAnchor(null)} /> : null}
      {remindAnchor ? <RemindMenu anchor={remindAnchor} threadIds={[t.id]} onClose={() => setRemindAnchor(null)} /> : null}
    </li>
  );
});
