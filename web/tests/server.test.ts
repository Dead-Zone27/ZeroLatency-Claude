import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { seal, unseal } from '@/lib/server/crypto';
import { ConfigError, configProblems, env, resetEnvCache } from '@/lib/server/env';
import { AIError, chatJson } from '@/lib/server/openai';
import { summarize, mapLimit } from '@/lib/server/gmail';

describe('cookie sealing', () => {
  it('round-trips and rejects tampering or a wrong secret', () => {
    const secret = 'x'.repeat(40);
    const token = seal({ a: 1, b: 'two' }, secret);
    expect(unseal(token, secret)).toEqual({ a: 1, b: 'two' });
    expect(unseal(token, 'y'.repeat(40))).toBeNull();
    const bad = token.slice(0, -2) + (token.endsWith('A') ? 'BB' : 'AA');
    expect(unseal(bad, secret)).toBeNull();
    expect(unseal('garbage', secret)).toBeNull();
  });
});

describe('chatJson', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.OPENAI_MODEL = 'test-model';
    process.env.SESSION_SECRET = 's'.repeat(40);
    process.env.ZL_DEMO = '1';
    resetEnvCache();
  });
  afterEach(() => {
    delete process.env.OPENAI_API_KEY; delete process.env.OPENAI_MODEL; delete process.env.ZL_DEMO;
    resetEnvCache();
  });

  const schema = { type: 'object', additionalProperties: false, required: ['body'], properties: { body: { type: 'string' } } };
  const ok = (content: unknown, status = 200) => new Response(JSON.stringify(content), { status, headers: { 'Content-Type': 'application/json' } });

  it('sends a strict json_schema request and validates the reply', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const req = JSON.parse(String(init?.body));
      expect(req.model).toBe('test-model');
      expect(req.response_format.json_schema.strict).toBe(true);
      expect(req).not.toHaveProperty('temperature');
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
      return ok({ choices: [{ message: { content: '{"body":"Hello"}' }, finish_reason: 'stop' }] });
    });
    const r = await chatJson({ messages: [{ role: 'user', content: 'x' }], schemaName: 's', jsonSchema: schema, validator: z.object({ body: z.string() }), fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ body: 'Hello' });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('retries on 429 then succeeds, and surfaces refusals and bad keys', async () => {
    let n = 0;
    const flaky = vi.fn(async () => (n++ === 0 ? ok({ error: { message: 'slow down' } }, 429) : ok({ choices: [{ message: { content: '{"body":"ok"}' } }] })));
    await expect(chatJson({ messages: [], schemaName: 's', jsonSchema: schema, validator: z.object({ body: z.string() }), fetchImpl: flaky as unknown as typeof fetch })).resolves.toEqual({ body: 'ok' });

    const refuse = vi.fn(async () => ok({ choices: [{ message: { content: null, refusal: 'no' } }] }));
    await expect(chatJson({ messages: [], schemaName: 's', jsonSchema: schema, validator: z.object({ body: z.string() }), fetchImpl: refuse as unknown as typeof fetch })).rejects.toBeInstanceOf(AIError);

    const unauth = vi.fn(async () => ok({ error: { message: 'bad key' } }, 401));
    await expect(chatJson({ messages: [], schemaName: 's', jsonSchema: schema, validator: z.object({ body: z.string() }), fetchImpl: unauth as unknown as typeof fetch })).rejects.toThrow(/OPENAI_API_KEY/);
  });

  it('rejects output that does not match the schema', async () => {
    const wrong = vi.fn(async () => ok({ choices: [{ message: { content: '{"nope":1}' } }] }));
    await expect(chatJson({ messages: [], schemaName: 's', jsonSchema: schema, validator: z.object({ body: z.string() }), fetchImpl: wrong as unknown as typeof fetch })).rejects.toThrow(/expected shape/);
  });
});

describe('gmail helpers', () => {
  it('summarises a metadata thread: participants, unread, drafts excluded from counts', () => {
    const s = summarize({
      id: 't', historyId: '9',
      messages: [
        { id: '1', threadId: 't', labelIds: ['INBOX'], internalDate: '1000', snippet: 'a', payload: { headers: [{ name: 'From', value: 'Priya <p@r.co>' }, { name: 'Subject', value: 'Hello' }] } },
        { id: '2', threadId: 't', labelIds: ['SENT'], internalDate: '2000', snippet: 'b', payload: { headers: [{ name: 'From', value: 'Me <me@x.io>' }, { name: 'To', value: 'Priya <p@r.co>' }] } },
        { id: '3', threadId: 't', labelIds: ['INBOX', 'UNREAD'], internalDate: '3000', snippet: 'c &amp; d', payload: { headers: [{ name: 'From', value: 'Priya <p@r.co>' }] } },
        { id: '4', threadId: 't', labelIds: ['DRAFT'], internalDate: '4000', snippet: 'draft', payload: { headers: [{ name: 'From', value: 'Me <me@x.io>' }] } },
      ],
    }, { attachment: new Set(['t']), calendar: new Set() });
    expect(s.subject).toBe('Hello');
    expect(s.messageCount).toBe(3);
    expect(s.participants.map((p) => p.email)).toEqual(['p@r.co', 'me@x.io']);
    expect(s.unread).toBe(true);
    expect(s.hasDraft).toBe(true);
    expect(s.lastDate).toBe(3000);
    expect(s.snippet).toBe('c & d');
    expect(s.labelIds).not.toContain('DRAFT');
    expect(s.hasAttachment).toBe(true);
    expect(s.recipients.map((a) => a.email)).toEqual(['p@r.co']);
  });

  it('mapLimit keeps order and respects the limit', async () => {
    let active = 0, peak = 0;
    const out = await mapLimit([5, 1, 3, 2, 4], 2, async (x) => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, x)); active--; return x * 10; });
    expect(out).toEqual([50, 10, 30, 20, 40]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});

describe('config checks', () => {
  const keys = ['ZL_DEMO', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const;
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => { for (const k of keys) { saved[k] = process.env[k]; delete process.env[k]; } resetEnvCache(); });
  afterEach(() => { for (const k of keys) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } resetEnvCache(); });

  it('lists every missing setting and treats empty values as unset', () => {
    process.env.SESSION_SECRET = '';
    expect(configProblems().map((p) => p.name)).toEqual(['SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);
    expect(() => env()).toThrow(ConfigError);
  });

  it('needs nothing in demo mode, even with the empty values from .env.example', () => {
    process.env.ZL_DEMO = '1';
    process.env.SESSION_SECRET = '';
    process.env.GOOGLE_CLIENT_ID = '';
    expect(configProblems()).toEqual([]);
    expect(env().demo).toBe(true);
  });

  it('rejects a short secret', () => {
    Object.assign(process.env, { SESSION_SECRET: 'short', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' });
    expect(configProblems()).toEqual([{ name: 'SESSION_SECRET', message: 'must be at least 32 characters long' }]);
  });

  it('in local development runs with no setup: sample mailbox and a saved random secret', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zl-'));
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(dir);
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(console, 'info').mockImplementation(() => {});
    try {
      expect(configProblems()).toEqual([]);
      const first = env();
      expect(first.demo).toBe(true);
      expect(first.sessionSecret.length).toBeGreaterThanOrEqual(32);
      resetEnvCache();
      expect(env().sessionSecret).toBe(first.sessionSecret);

      // With Google credentials it uses real Gmail, still without a SESSION_SECRET.
      Object.assign(process.env, { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' });
      resetEnvCache();
      expect(env().demo).toBe(false);
      process.env.ZL_DEMO = '1';
      resetEnvCache();
      expect(env().demo).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
      cwd.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
