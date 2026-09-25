'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, attachmentUrl } from '@/lib/client/api';
import { useAccountData } from '@/lib/client/store';
import { applyBlock, caretRect, currentBlock, deleteBeforeCaret, editorHtml, editorText, fileToBase64, insertHtml, MARKDOWN, saveRange, textBeforeCaret, type BlockCommand } from '@/lib/client/editor';
import { escapeHtml, forwardHtml, quoteHtml, quoteText, referencesFor, replyRecipients, subjectWithPrefix, textToHtml } from '@/lib/shared/compose';
import type { Address, OutgoingAttachment, OutgoingMessage, SendAs } from '@/lib/shared/types';
import { Icon } from './icons';
import { IconButton, Popover, Spinner, useToast } from './ui';
import { useMail, type ComposeInit } from './mail-context';
import { RecipientField } from './RecipientField';
import { SchedulePicker } from './SchedulePicker';
import { rankSlash, slashQuery, type SlashCommand } from '@/lib/shared/slash';

const MAX_TOTAL_BYTES = 24 * 1024 * 1024;

let sendAsCache: Promise<SendAs[]> | null = null;
function loadSendAs(): Promise<SendAs[]> {
  if (!sendAsCache) sendAsCache = api.sendAs().then((r) => r.sendAs).catch(() => { sendAsCache = null; return []; });
  return sendAsCache;
}

interface LocalFile { id: string; name: string; type: string; size: number; data: string | null; loading: boolean }

type SlashItem = SlashCommand;

/** AI presets that rewrite the current draft. */
const AI_PRESETS: { key: string; label: string; prompt: string; keywords: string[] }[] = [
  { key: 'improve', label: 'Improve writing', prompt: 'Improve the writing of this draft: clearer and more natural, same meaning, tone and language. Return the full edited draft.', keywords: ['rewrite', 'polish', 'better'] },
  { key: 'fix', label: 'Fix spelling & grammar', prompt: 'Fix spelling, grammar and punctuation in this draft. Change nothing else. Return the full edited draft.', keywords: ['typo', 'grammar', 'spell'] },
  { key: 'shorter', label: 'Make shorter', prompt: 'Make this draft shorter and more concise without losing anything important. Return the full edited draft.', keywords: ['concise', 'shorten', 'brief'] },
  { key: 'longer', label: 'Make longer', prompt: 'Expand this draft with a little more detail and context, without inventing facts. Return the full edited draft.', keywords: ['expand', 'elaborate'] },
  { key: 'formal', label: 'More formal', prompt: 'Rewrite this draft in a more formal, professional tone. Return the full edited draft.', keywords: ['professional', 'tone'] },
  { key: 'friendly', label: 'More friendly', prompt: 'Rewrite this draft in a warmer, friendlier tone. Return the full edited draft.', keywords: ['casual', 'warm', 'tone'] },
];

function formatDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function Composer({ init, onClose }: { init: ComposeInit; onClose: () => void }) {
  const { me, account, threads, refreshList, refreshCounts, aiEnabled, act } = useMail();
  const data = useAccountData();
  const { push } = useToast();
  const src = init.source;
  const isReply = init.mode === 'reply' || init.mode === 'replyAll' || (init.mode === 'draft' && !!init.threadId && !!src);

  // ---------- fields ----------
  const initialRcpts = useMemo(() => {
    if ((init.mode === 'reply' || init.mode === 'replyAll') && src) return replyRecipients(src, me, init.mode === 'replyAll');
    return { to: init.to ?? [], cc: init.cc ?? [] };
  }, [init, src, me]);
  const [to, setTo] = useState<Address[]>(initialRcpts.to);
  const [cc, setCc] = useState<Address[]>(initialRcpts.cc);
  const [bcc, setBcc] = useState<Address[]>(init.bcc ?? []);
  const [showCc, setShowCc] = useState(initialRcpts.cc.length > 0 || (init.bcc?.length ?? 0) > 0);
  const [subject, setSubject] = useState(() => {
    if (init.subject !== undefined) return init.subject;
    if (src && (init.mode === 'reply' || init.mode === 'replyAll')) return subjectWithPrefix(src.subject, 'Re');
    if (src && init.mode === 'forward') return subjectWithPrefix(src.subject, 'Fwd');
    return '';
  });
  const [files, setFiles] = useState<LocalFile[]>(() => (init.mode === 'forward' && src
    ? src.attachments.filter((a) => !a.inline).map((a) => ({ id: a.attachmentId, name: a.filename, type: a.mimeType, size: a.size, data: null, loading: true }))
    : []));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'sending' | 'error'>('idle');
  const [minimized, setMinimized] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [showQuote, setShowQuote] = useState(false);
  const [dragging, setDragging] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const dirty = useRef(false);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const threadId = init.threadId ?? src?.threadId;

  const participants = useMemo(() => threads.flatMap((t) => t.participants), [threads]);

  useEffect(() => {
    if (editor.current && init.bodyHtml) editor.current.innerHTML = init.bodyHtml;
    document.execCommand('defaultParagraphSeparator', false, 'p');
    if (init.mode !== 'new' || init.to?.length) setTimeout(() => editor.current?.focus(), 0);
  }, [init.bodyHtml, init.mode, init.to]);

  useEffect(() => {
    void loadSendAs().then((list) => {
      const mine = list.find((s) => s.email.toLowerCase() === me.toLowerCase()) ?? list.find((s) => s.isDefault);
      setSignature(mine?.signature ?? '');
    });
  }, [me]);

  // Forward: bring the original attachments along.
  useEffect(() => {
    if (init.mode !== 'forward' || !src) return;
    const originals = src.attachments.filter((a) => !a.inline);
    originals.forEach(async (a) => {
      try {
        const res = await fetch(attachmentUrl(account.id, src.id, a));
        if (!res.ok) throw new Error();
        const b64 = await fileToBase64(await res.blob());
        setFiles((fs) => fs.map((f) => (f.id === a.attachmentId ? { ...f, data: b64, loading: false } : f)));
      } catch {
        setFiles((fs) => fs.filter((f) => f.id !== a.attachmentId));
        push({ message: `Couldn’t attach ${a.filename}`, tone: 'error' });
      }
    });
  }, [init.mode, src, account.id, push]);

  // Reopened drafts already contain their signature and quote in the body.
  const appendExtras = init.mode !== 'draft';
  const includeSignature = appendExtras && !!signature && (!isReply && init.mode !== 'forward' ? true : data.signatureOnReplies);
  const tagline = appendExtras && data.signatureEnabled ? '<p style="color:#787774">Sent with ZeroLatency</p>' : '';

  // ---------- build ----------
  const build = useCallback((): OutgoingMessage | null => {
    const el = editor.current;
    if (!el) return null;
    let html = editorHtml(el);
    let text = editorText(el);
    if (includeSignature) { html += `<br><div class="gmail_signature">${signature}</div>`; text += `\n\n-- \n${signature.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')}`; }
    if (tagline) { html += tagline; text += '\n\nSent with ZeroLatency'; }
    if (src && (init.mode === 'reply' || init.mode === 'replyAll')) {
      html += `<br>${quoteHtml(src)}`;
      text += `\n\n${quoteText(src, src.text ?? src.snippet)}`;
    }
    if (src && init.mode === 'forward') { html += `<br>${forwardHtml(src)}`; text += `\n\n---------- Forwarded message ---------\n${src.text ?? src.snippet}`; }
    const attachments: OutgoingAttachment[] = files.filter((f) => f.data).map((f) => ({ filename: f.name, mimeType: f.type || 'application/octet-stream', data: f.data! }));
    return {
      to, cc, bcc, subject, html: `<div dir="ltr">${html}</div>`, text, attachments,
      ...(threadId && init.mode !== 'forward' ? { threadId } : {}),
      ...(src && init.mode !== 'forward' && src.messageIdHeader ? { inReplyTo: src.messageIdHeader, references: referencesFor(src) } : {}),
    };
  }, [to, cc, bcc, subject, files, src, init.mode, threadId, includeSignature, signature, tagline]);

  // ---------- draft autosave ----------
  const draftIdRef = useRef<string | null>(init.draftId ?? null);
  const hasContent = useCallback(() => {
    const body = editor.current ? editorText(editor.current) : '';
    return !!body || files.length > 0 || (init.mode === 'new' && (to.length > 0 || !!subject.trim())) || init.mode === 'draft';
  }, [files.length, init.mode, to.length, subject]);
  const saveDraft = useCallback(() => {
    const msg = build();
    if (!msg || !hasContent()) return Promise.resolve();
    setStatus('saving');
    saveChain.current = saveChain.current.then(async () => {
      try {
        const r = await api.saveDraft({ ...msg, attachments: [] }, draftIdRef.current);
        draftIdRef.current = r.draftId;
        setStatus('saved');
        dirty.current = false;
      } catch {
        setStatus('error');
      }
    });
    return saveChain.current;
  }, [build, hasContent]);

  const [tick, setTick] = useState(0);
  const touch = () => { dirty.current = true; setTick((t) => t + 1); };
  useEffect(() => {
    if (!tick) return;
    const t = setTimeout(() => { if (dirty.current) void saveDraft(); }, 2500);
    return () => clearTimeout(t);
  }, [tick, saveDraft]);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    dirty.current = true; setTick((t) => t + 1);
  }, [to, cc, bcc, subject]);

  // ---------- send ----------
  const send = async (andArchive = false) => {
    const msg = build();
    if (!msg) return;
    if (!msg.to.length && !msg.cc.length && !msg.bcc.length) { push({ message: 'Add at least one recipient.', tone: 'error' }); return; }
    if (files.some((f) => f.loading)) { push({ message: 'Attachments are still loading.' }); return; }
    if (!msg.subject.trim() && !window.confirm('Send this message without a subject?')) return;
    setStatus('sending');
    await saveChain.current;
    const toastId = push({ message: 'Message sending', busy: true });
    try {
      await api.send(msg, draftIdRef.current);
      push({ message: 'Message sent' });
      if (andArchive && threadId) await act([threadId], { kind: 'archive' }, { silent: true });
      onClose();
      refreshList();
      refreshCounts();
    } catch (e) {
      setStatus('error');
      push({ message: `Couldn’t send: ${(e as Error).message}`, tone: 'error' });
    }
    void toastId;
  };

  const discard = async () => {
    const id = draftIdRef.current;
    onClose();
    if (id) {
      await saveChain.current;
      await api.deleteDraft(id).catch(() => undefined);
      refreshCounts();
      push({ message: 'Draft discarded' });
    }
  };

  const close = async () => {
    if (dirty.current && (editor.current?.innerText.trim() || to.length || subject)) await saveDraft();
    onClose();
    if (draftIdRef.current) { push({ message: 'Draft saved' }); refreshCounts(); }
  };

  // ---------- attachments ----------
  const addFiles = async (list: FileList | File[]) => {
    const arr = [...list];
    const current = files.reduce((n, f) => n + f.size, 0);
    if (current + arr.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_BYTES) { push({ message: 'Attachments are limited to 24 MB per message.', tone: 'error' }); return; }
    for (const f of arr) {
      const id = `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`;
      setFiles((fs) => [...fs, { id, name: f.name, type: f.type, size: f.size, data: null, loading: true }]);
      const data = await fileToBase64(f);
      setFiles((fs) => fs.map((x) => (x.id === id ? { ...x, data, loading: false } : x)));
    }
    touch();
  };
  const fileInput = useRef<HTMLInputElement>(null);

  // ---------- AI ----------
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const aiRange = useRef<Range | null>(null);
  const openAi = () => { aiRange.current = saveRange(); setAiOpen(true); setAiResult(null); };
  const runAi = async (mode: 'write' | 'draft', promptOverride?: string) => {
    const prompt = promptOverride ?? aiPrompt;
    setAiBusy(true);
    try {
      const r = mode === 'draft' && threadId
        ? await api.aiDraft(threadId, prompt || undefined)
        : await api.aiWrite({ prompt, draft: editor.current ? editorText(editor.current) : '', subject, to: to.map((a) => a.email), threadId: isReply ? threadId : undefined });
      setAiResult(r.body);
    } catch (e) {
      push({ message: (e as Error).message, tone: 'error' });
    } finally {
      setAiBusy(false);
    }
  };
  const applyAi = (how: 'insert' | 'replace') => {
    if (!editor.current || !aiResult) return;
    if (how === 'replace') { editor.current.innerHTML = textToHtml(aiResult); }
    else insertHtml(editor.current, textToHtml(aiResult), aiRange.current);
    setAiOpen(false); setAiResult(null); setAiPrompt(''); touch();
  };

  // ---------- slash menu ----------
  const [slash, setSlash] = useState<{ rect: DOMRect; query: string; index: number } | null>(null);
  const [schedule, setSchedule] = useState<{ range: Range | null; snippet?: string } | null>(null);
  const subjectInput = useRef<HTMLInputElement>(null);
  const [hasDraftText, setHasDraftText] = useState(!!init.bodyHtml);
  const slashItems: SlashItem[] = [
    ...(aiEnabled ? [
      { key: 'ai', label: 'Write with AI', group: 'AI', icon: 'sparkle', hint: 'Space', keywords: ['ai', 'compose', 'generate'] },
      ...(isReply && threadId ? [{ key: 'ai:draft', label: 'Draft a reply', group: 'AI', icon: 'reply', keywords: ['respond', 'answer'] }] : []),
      ...(hasDraftText ? AI_PRESETS.map((p) => ({ key: `ai:${p.key}`, label: p.label, group: 'AI', icon: 'wand', keywords: p.keywords })) : []),
      ...(hasDraftText ? [{ key: 'ai:translate', label: 'Translate…', group: 'AI', icon: 'wand', keywords: ['language', 'french', 'spanish', 'german'] }] : []),
    ] : []),
    { key: 'schedule', label: 'Share availability', group: 'Insert', icon: 'cal', keywords: ['meeting', 'times', 'calendar', 'slots'] },
    { key: 'today', label: 'Today’s date', group: 'Insert', icon: 'cal', keywords: ['date', 'now'] },
    { key: 'tomorrow', label: 'Tomorrow’s date', group: 'Insert', icon: 'cal', keywords: ['date'] },
    { key: 'time', label: 'Current time', group: 'Insert', icon: 'clock', keywords: ['now', 'clock'] },
    { key: 'link', label: 'Link', group: 'Insert', icon: 'link', hint: '⌘K', keywords: ['url', 'href'] },
    { key: 'attach', label: 'Attach file', group: 'Insert', icon: 'clip', keywords: ['file', 'upload', 'attachment'] },
    ...data.snippets.map((sn) => ({ key: `snippet:${sn.id}`, label: sn.name, group: 'Snippets', icon: 'brackets', keywords: ['snippet', 'template'] })),
    { key: 'h2', label: 'Heading', group: 'Format', icon: 'text', hint: '#', keywords: ['title', 'h2'] },
    { key: 'bold', label: 'Bold', group: 'Format', icon: 'text', hint: '⌘B', keywords: ['strong'] },
    { key: 'italic', label: 'Italic', group: 'Format', icon: 'text', hint: '⌘I', keywords: ['emphasis'] },
    { key: 'ul', label: 'Bulleted list', group: 'Format', icon: 'group', hint: '-', keywords: ['bullet', 'ul', 'unordered'] },
    { key: 'ol', label: 'Numbered list', group: 'Format', icon: 'list', hint: '1.', keywords: ['ordered', 'ol'] },
    { key: 'quote', label: 'Quote', group: 'Format', icon: 'reply', hint: '>', keywords: ['blockquote', 'cite'] },
    { key: 'code', label: 'Code block', group: 'Format', icon: 'brackets', hint: '```', keywords: ['pre', 'monospace'] },
    { key: 'hr', label: 'Divider', group: 'Format', icon: 'minus', hint: '---', keywords: ['line', 'separator', 'rule'] },
    { key: 'clear', label: 'Clear formatting', group: 'Format', icon: 'x', keywords: ['plain', 'remove'] },
    ...(!showCc ? [{ key: 'cc', label: 'Add Cc / Bcc', group: 'Message', icon: 'person', keywords: ['copy', 'recipients'] }] : []),
    { key: 'subject', label: 'Edit subject', group: 'Message', icon: 'pen', keywords: ['title'] },
    { key: 'save', label: 'Save draft', group: 'Message', icon: 'draft', keywords: ['store'] },
    { key: 'send', label: 'Send', group: 'Message', icon: 'send', hint: '⌘↵', keywords: ['deliver'] },
  ];
  const ranked = slash ? rankSlash(slashItems, slash.query) : [];
  // Nothing matches (or a real sentence is being typed): offer to hand the words to AI.
  const askAi = aiEnabled && slash && slash.query.trim().length > 2
    ? { item: { key: 'ai:ask', label: `Ask AI: “${slash.query.trim()}”`, group: 'AI', icon: 'sparkle' } as SlashItem, match: null }
    : null;
  const filteredSlash = askAi ? [...ranked, askAi] : ranked;
  const runSlash = (item: SlashItem) => {
    const query = slash?.query ?? '';
    deleteBeforeCaret(query.length + 1);
    setSlash(null);
    const insertText = (text: string) => document.execCommand('insertText', false, text);
    if (item.key === 'ai') openAi();
    else if (item.key === 'ai:ask') { openAi(); setAiPrompt(query.trim()); void runAi('write', query.trim()); }
    else if (item.key === 'ai:draft') { openAi(); void runAi('draft', ''); }
    else if (item.key === 'ai:translate') { openAi(); setAiPrompt('Translate this draft into '); }
    else if (item.key.startsWith('ai:')) {
      const preset = AI_PRESETS.find((p) => `ai:${p.key}` === item.key);
      if (preset) { openAi(); setAiPrompt(preset.label); void runAi('write', preset.prompt); }
    }
    else if (item.key === 'schedule') setSchedule({ range: saveRange() });
    else if (item.key === 'today') insertText(formatDay(new Date()));
    else if (item.key === 'tomorrow') insertText(formatDay(new Date(Date.now() + 86_400_000)));
    else if (item.key === 'time') insertText(new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
    else if (item.key === 'link') {
      const url = window.prompt('Link URL')?.trim();
      if (url && /^(https?:|mailto:)/i.test(url)) {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) document.execCommand('createLink', false, url);
        else document.execCommand('insertHTML', false, `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>&nbsp;`);
      }
    }
    else if (item.key === 'attach') fileInput.current?.click();
    else if (item.key.startsWith('snippet:')) {
      const sn = data.snippets.find((x) => `snippet:${x.id}` === item.key);
      if (sn?.body.includes('{{availability}}')) setSchedule({ range: saveRange(), snippet: sn.body });
      else if (sn) document.execCommand('insertHTML', false, textToHtml(sn.body));
    }
    else if (item.key === 'bold') document.execCommand('bold');
    else if (item.key === 'italic') document.execCommand('italic');
    else if (item.key === 'clear') { document.execCommand('removeFormat'); document.execCommand('formatBlock', false, 'p'); }
    else if (item.key === 'cc') setShowCc(true);
    else if (item.key === 'subject') subjectInput.current?.focus();
    else if (item.key === 'save') void saveDraft().then(() => push({ message: 'Draft saved' }));
    else if (item.key === 'send') { void send(); return; }
    else applyBlock(item.key as BlockCommand);
    touch();
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); void send(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const url = window.prompt('Link URL');
      if (url && /^(https?:|mailto:)/i.test(url.trim())) document.execCommand('createLink', false, url.trim());
      return;
    }
    if (slash && filteredSlash.length) {
      const n = filteredSlash.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlash({ ...slash, index: (slash.index + 1) % n }); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlash({ ...slash, index: (slash.index - 1 + n) % n }); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { const hit = filteredSlash[Math.min(slash.index, n - 1)]; if (hit) { e.preventDefault(); runSlash(hit.item); } return; }
    }
    if (slash && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setSlash(null); return; }
    if (e.key === ' ' && editor.current) {
      const before = textBeforeCaret(editor.current);
      const md = MARKDOWN.find((m) => m.marker === before);
      if (md) { e.preventDefault(); deleteBeforeCaret(before.length); applyBlock(md.cmd); touch(); return; }
      const blockText = (currentBlock(editor.current)?.textContent ?? '').trim();
      if (aiEnabled && before === '' && blockText === '' && !e.shiftKey) { e.preventDefault(); openAi(); return; }
    }
    if (e.key === 'Enter' && editor.current && textBeforeCaret(editor.current) === '---') { e.preventDefault(); deleteBeforeCaret(3); applyBlock('hr'); touch(); }
  };

  const onEditorInput = () => {
    touch();
    if (!editor.current) return;
    setHasDraftText(editor.current.innerText.replace(/(^|\s)\/\S*$/, '').trim().length > 0);
    const query = slashQuery(textBeforeCaret(editor.current));
    if (query !== null) {
      const rect = caretRect();
      if (rect) setSlash((cur) => ({ rect, query, index: cur && cur.query === query ? cur.index : 0 }));
    } else if (slash) setSlash(null);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files.length) { e.preventDefault(); void addFiles(e.clipboardData.files); return; }
    // Paste as plain text so foreign styles and scripts never enter the message.
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, textToHtml(text).replace(/^<p>|<\/p>$/g, '').replace(/<\/p><p>/g, '<br><br>'));
  };

  const statusText = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Draft saved' : status === 'error' ? 'Not saved' : '';
  const [sendMenu, setSendMenu] = useState<HTMLElement | null>(null);

  if (minimized) {
    return (
      <div className="zl-composer is-min" role="dialog" aria-label="New message (minimised)">
        <div className="zl-composer-head"><span>{subject || 'New message'}</span><IconButton icon="chevUp" label="Expand" size="sm" onClick={() => setMinimized(false)} /><IconButton icon="x" label="Close" size="sm" onClick={close} /></div>
      </div>
    );
  }

  return (
    <div
      className={`zl-composer ${init.inline ? 'is-inline' : ''} ${dragging ? 'zl-dropzone' : ''}`}
      role="dialog"
      aria-label={init.mode === 'new' ? 'New message' : subject || 'Reply'}
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setDragging(false); void addFiles(e.dataTransfer.files); } }}
      onKeyDown={(e) => { if (e.key === 'Escape' && !slash && !aiOpen && !init.inline) { e.stopPropagation(); void close(); } }}
    >
      <div className="zl-composer-head">
        <span>{account.name}<small>{me}</small></span>
        {!init.inline ? <IconButton icon="chevDown" label="Minimise" size="sm" onClick={() => setMinimized(true)} /> : null}
        <IconButton icon="x" label="Close" size="sm" onClick={close} />
      </div>
      <RecipientField label="To" value={to} onChange={setTo} extra={participants} autoFocus={init.mode === 'new' || init.mode === 'forward'}
        trailing={!showCc ? <button type="button" className="zl-btn zl-btn--text zl-btn--sm" onClick={() => setShowCc(true)}>Cc/Bcc</button> : null} />
      {showCc ? <RecipientField label="Cc" value={cc} onChange={setCc} extra={participants} /> : null}
      {showCc ? <RecipientField label="Bcc" value={bcc} onChange={setBcc} extra={participants} /> : null}
      <div className="zl-composer-line"><input ref={subjectInput} aria-label="Subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div
        ref={editor}
        className="zl-composer-body"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Message body"
        data-placeholder={aiEnabled ? 'Write, or press space for AI, “/” for commands' : 'Write, or type “/” for commands'}
        onKeyDown={onEditorKeyDown}
        onInput={onEditorInput}
        onPaste={onPaste}
        onBlur={() => setTimeout(() => setSlash(null), 150)}
      />
      <div>
        {includeSignature || tagline ? <div className="zl-composer-quote" style={{ borderTop: 0 }} dangerouslySetInnerHTML={{ __html: `${includeSignature ? `<div>${signature}</div>` : ''}${tagline ? '<div>Sent with ZeroLatency</div>' : ''}` }} /> : null}
        {src && init.mode !== 'new' ? (
          <div className="zl-composer-quote">
            <button type="button" className="zl-btn zl-btn--text zl-btn--sm" onClick={() => setShowQuote((s) => !s)} aria-expanded={showQuote}>{showQuote ? 'Hide' : 'Show'} {init.mode === 'forward' ? 'forwarded message' : 'quoted text'}</button>
            {showQuote ? <div style={{ maxHeight: 200, overflow: 'auto', padding: '6px 0' }} dangerouslySetInnerHTML={{ __html: init.mode === 'forward' ? `<div>From: ${escapeHtml(src.from?.email ?? '')}</div><div>${escapeHtml(src.snippet)}</div>` : `<div>${escapeHtml(src.snippet)}</div>` }} /> : null}
          </div>
        ) : null}
        {files.length ? (
          <div className="zl-composer-files">
            {files.map((f) => (
              <span key={f.id} className="zl-recipient" title={f.name}>
                {f.loading ? <Spinner /> : <Icon name="clip" size={12} />}<span>{f.name}</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => { setFiles((fs) => fs.filter((x) => x.id !== f.id)); touch(); }}><Icon name="x" size={12} /></button>
              </span>
            ))}
          </div>
        ) : null}
        {aiOpen ? (
          <div className="zl-ai-bar" role="group" aria-label="Write with AI">
            <form className="zl-ai-bar-row" onSubmit={(e) => { e.preventDefault(); if (aiPrompt.trim()) void runAi('write'); }}>
              <Icon name="sparkle" />
              <input autoFocus value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder={isReply ? 'Tell AI what to write, or leave empty and draft a reply' : 'Tell AI what to write…'} aria-label="AI instruction"
                onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setAiOpen(false); editor.current?.focus(); } }} />
              {isReply && threadId ? <button type="button" className="zl-btn zl-btn--secondary zl-btn--sm" disabled={aiBusy} onClick={() => runAi('draft')}>Draft reply</button> : null}
              <button type="submit" className="zl-btn zl-btn--primary zl-btn--sm" disabled={aiBusy || !aiPrompt.trim()}>{aiBusy ? <Spinner /> : 'Write'}</button>
            </form>
            {aiResult !== null ? (
              <>
                <div className="zl-ai-result">{aiResult}</div>
                <div className="zl-ai-bar-row" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="zl-btn zl-btn--ghost zl-btn--sm" onClick={() => setAiResult(null)}>Discard</button>
                  <button type="button" className="zl-btn zl-btn--secondary zl-btn--sm" onClick={() => applyAi('replace')}>Replace draft</button>
                  <button type="button" className="zl-btn zl-btn--primary zl-btn--sm" onClick={() => applyAi('insert')}>Insert</button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="zl-composer-foot">
        <span className="zl-split">
          <button className="zl-btn zl-btn--primary" onClick={() => send()} disabled={status === 'sending'} aria-busy={status === 'sending'}>{status === 'sending' ? <Spinner /> : null}Send</button>
          <button className="zl-btn zl-btn--primary" aria-label="More send options" onClick={(e) => setSendMenu(e.currentTarget)}><Icon name="chevDown" /></button>
        </span>
        <small aria-live="polite">{statusText}</small>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {aiEnabled ? <IconButton icon="sparkle" label={isReply ? 'Write or draft reply with AI' : 'Write with AI'} onClick={openAi} /> : null}
          <IconButton icon="cal" label="Share availability" onClick={() => { editor.current?.focus(); setSchedule({ range: saveRange() }); }} />
          <IconButton icon="clip" label="Attach files" onClick={() => fileInput.current?.click()} />
          <IconButton icon="trash" label="Discard draft" onClick={discard} />
        </span>
        <input ref={fileInput} type="file" multiple hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {sendMenu ? (
        <Popover anchor={sendMenu} onClose={() => setSendMenu(null)} placement="top-start" label="Send options">
          <div className="zl-menu" style={{ width: 220 }}>
            <button className="zl-menu-item" onClick={() => { setSendMenu(null); void send(); }}>Send<span className="zl-menu-item-hint">⌘/Ctrl Enter</span></button>
            {threadId ? <button className="zl-menu-item" onClick={() => { setSendMenu(null); void send(true); }}>Send and archive</button> : null}
            <button className="zl-menu-item" onClick={() => { setSendMenu(null); void saveDraft().then(() => push({ message: 'Draft saved' })); }}>Save draft</button>
          </div>
        </Popover>
      ) : null}
      {slash && filteredSlash.length ? (
        <Popover anchor={slash.rect} onClose={() => setSlash(null)} label="Commands">
          <div className="zl-menu zl-slash-menu" role="listbox" aria-label="Commands" onMouseDown={(e) => e.preventDefault()}>
            {filteredSlash.map(({ item, match }, i) => {
              const prev = filteredSlash[i - 1];
              // Group headings only while browsing; a query shows one ranked list.
              const heading = !slash.query && (!prev || prev.item.group !== item.group) ? item.group : null;
              const active = i === Math.min(slash.index, filteredSlash.length - 1);
              return (
                <div key={item.key} style={{ display: 'contents' }}>
                  {heading ? <div className="zl-menu-label">{heading}</div> : null}
                  <button
                    role="option"
                    aria-selected={active}
                    className={`zl-menu-item ${active ? 'is-hover' : ''}`}
                    ref={active ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                    onMouseMove={() => { if (!active) setSlash({ ...slash, index: i }); }}
                    onClick={() => runSlash(item)}
                  >
                    <Icon name={item.icon} />
                    <span className="zl-slash-label">{match ? <>{item.label.slice(0, match[0])}<mark>{item.label.slice(match[0], match[1])}</mark>{item.label.slice(match[1])}</> : item.label}</span>
                    {item.hint ? <span className="zl-menu-item-hint">{item.hint}</span> : slash.query && item.key !== 'ai:ask' ? <span className="zl-menu-item-hint">{item.group}</span> : null}
                  </button>
                </div>
              );
            })}
            <div className="zl-slash-foot"><span>↑↓ to navigate</span><span>↵ to select</span><span>esc to close</span></div>
          </div>
        </Popover>
      ) : null}
      {schedule ? (
        <SchedulePicker
          onClose={() => setSchedule(null)}
          onInsert={(html) => {
            if (!editor.current) return;
            const content = schedule.snippet ? textToHtml(schedule.snippet).replace(/\{\{availability\}\}/g, `</p>${html}<p>`).replace(/<p><\/p>/g, '') : html;
            insertHtml(editor.current, content, schedule.range);
            touch();
          }}
        />
      ) : null}
    </div>
  );
}
