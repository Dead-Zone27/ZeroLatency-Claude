'use client';
import { useSyncExternalStore } from 'react';
import { uid, type Ink, type View } from '../shared/views';

// ---------- Types ----------

export type Theme = 'system' | 'light' | 'dark';
export type ThreadStyle = 'side' | 'center' | 'full';
export type AutoAdvance = 'next' | 'previous' | 'list';
export type FontSize = 'default' | 'large';

export interface Settings {
  theme: Theme;
  threadStyle: ThreadStyle;
  autoAdvance: AutoAdvance;
  fontSize: FontSize;
  desktopNotifications: boolean;
  /** Which revision of the app defaults this saved state has been brought up to (see initStores). */
  defaultsVersion?: number;
}

/** Bump when a default changes and existing saved state should adopt it once. */
export const DEFAULTS_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light', threadStyle: 'side', autoAdvance: 'next', fontSize: 'large', desktopNotifications: false, defaultsVersion: DEFAULTS_VERSION,
};

export type PropertyType = 'text' | 'number' | 'select' | 'multiSelect' | 'status' | 'date' | 'checkbox' | 'url';

export interface PropertyOption {
  id: string;
  name: string;
  ink: Ink;
  /** Status only: which of the four fixed states this option represents. */
  state?: 'todo' | 'progress' | 'done' | 'canceled';
}

export interface PropertyDef {
  id: string;
  name: string;
  type: PropertyType;
  options: PropertyOption[];
  defaultOptionId?: string;
}

export type PropertyValue = string | number | boolean | string[] | null;

export interface AutoLabel {
  id: string;
  name: string;
  description: string;
  labelId: string;
  enabled: boolean;
  /** Keep matching mail in the inbox (true) or move it into its own view (false: archive after labelling). */
  keepInInbox: boolean;
  createdAt: number;
}

export interface Snippet {
  id: string;
  name: string;
  /** Plain text with blank-line paragraphs. `{{availability}}` expands to open times from the calendar. */
  body: string;
}

export interface Reminder {
  at: number;
  subject: string;
}

export interface AccountData {
  onboarded: boolean;
  views: View[];
  /** Custom properties per view id. */
  properties: Record<string, PropertyDef[]>;
  /** Property values per thread id per property id. */
  values: Record<string, Record<string, PropertyValue>>;
  autoLabels: AutoLabel[];
  /** Thread id → historyId already classified by auto label. */
  autoLabelSeen: Record<string, string>;
  snippets: Snippet[];
  reminders: Record<string, Reminder>;
  labelInks: Record<string, Ink>;
  signatureOnReplies: boolean;
  signatureEnabled: boolean;
  /** Per-view notification high-water mark (newest lastDate notified). */
  notifiedUntil: Record<string, number>;
  defaultsVersion?: number;
}

export const emptyAccountData = (): AccountData => ({
  onboarded: false, views: [], properties: {}, values: {}, autoLabels: [], autoLabelSeen: {}, snippets: [], reminders: {}, labelInks: {},
  signatureOnReplies: true, signatureEnabled: false, notifiedUntil: {}, defaultsVersion: DEFAULTS_VERSION,
});

// ---------- Persistence ----------

const SETTINGS_KEY = 'zl:v1:settings';
const acctKey = (id: string) => `zl:v1:acct:${id}`;

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}

/** The defaultsVersion actually saved under `key` (load() fills missing fields from the defaults, which would hide it). */
function savedVersion(key: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return (JSON.parse(raw) as { defaultsVersion?: number }).defaultsVersion ?? 1;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked: keep in memory */ }
}

// ---------- Store ----------

type Listener = () => void;

function createStore<T>(initial: T, persistKey: () => string | null) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(next: T | ((s: T) => T)) {
      state = typeof next === 'function' ? (next as (s: T) => T)(state) : next;
      const k = persistKey();
      if (k) save(k, state);
      listeners.forEach((l) => l());
    },
    replace(next: T) {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const settingsStore = createStore<Settings>(DEFAULT_SETTINGS, () => SETTINGS_KEY);
let activeAccount: string | null = null;
export const accountStore = createStore<AccountData>(emptyAccountData(), () => (activeAccount ? acctKey(activeAccount) : null));

export function initStores(accountId: string) {
  let settings = load(SETTINGS_KEY, DEFAULT_SETTINGS);
  // v2 defaults: start in light mode (previously followed the system theme).
  const settingsVersion = savedVersion(SETTINGS_KEY);
  if (settingsVersion !== null && settingsVersion < 2) {
    settings = { ...settings, theme: settings.theme === 'system' ? 'light' : settings.theme, defaultsVersion: DEFAULTS_VERSION };
    save(SETTINGS_KEY, settings);
  }
  settingsStore.replace(settings);
  activeAccount = accountId;
  let data = load(acctKey(accountId), emptyAccountData());
  // v2 defaults: views group Unread first (previously by date). Views grouped some other way are left alone.
  const dataVersion = savedVersion(acctKey(accountId));
  if (dataVersion !== null && dataVersion < 2) {
    data = { ...data, views: data.views.map((v) => (v.groupBy.kind === 'date' ? { ...v, groupBy: { kind: 'unread' } } : v)), defaultsVersion: DEFAULTS_VERSION };
    save(acctKey(accountId), data);
  }
  accountStore.replace(data);
}

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => DEFAULT_SETTINGS);
}

const EMPTY = emptyAccountData();
export function useAccountData(): AccountData {
  return useSyncExternalStore(accountStore.subscribe, accountStore.get, () => EMPTY);
}

export function updateAccount(fn: (d: AccountData) => AccountData) {
  accountStore.set(fn);
}

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((s) => ({ ...s, ...patch }));
}

export function updateView(id: string, fn: (v: View) => View) {
  updateAccount((d) => ({ ...d, views: d.views.map((v) => (v.id === id ? fn(v) : v)) }));
}

/** Copies a view (with fresh ids and its properties) and returns the copy's id. */
export function duplicateView(view: View): string {
  const copy: View = { ...view, id: uid('v_'), name: `${view.name} copy`, filters: view.filters.map((f) => ({ ...f, id: uid('f_') })) };
  updateAccount((d) => {
    const at = d.views.findIndex((v) => v.id === view.id);
    const views = [...d.views];
    views.splice(at < 0 ? views.length : at + 1, 0, copy);
    return { ...d, views, properties: { ...d.properties, [copy.id]: d.properties[view.id] ?? [] } };
  });
  return copy.id;
}

/** Removes a view and its properties. Mail is not touched. */
export function deleteView(id: string) {
  updateAccount((d) => {
    const properties = { ...d.properties };
    delete properties[id];
    return { ...d, views: d.views.filter((v) => v.id !== id), properties };
  });
}
