import 'server-only';
import { z } from 'zod';
import { env } from './env';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export class AIError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  choices?: { message?: { content?: string | null; refusal?: string | null }; finish_reason?: string }[];
  error?: { message?: string; type?: string; code?: string };
}

/**
 * Calls Chat Completions with a strict JSON schema and validates the result with zod.
 * Uses only parameters that every current chat model accepts (no temperature / max_tokens),
 * so OPENAI_MODEL can point at a reasoning or non-reasoning model.
 */
export async function chatJson<T>(opts: {
  messages: ChatMessage[];
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  validator: z.ZodType<T>;
  maxTokens?: number;
  fetchImpl?: typeof fetch;
}): Promise<T> {
  const { openaiApiKey, openaiModel } = env();
  if (!openaiApiKey) throw new AIError('AI is not configured: set OPENAI_API_KEY on the server.', 503);
  const doFetch = opts.fetchImpl ?? fetch;
  let lastErr: AIError | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await doFetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: openaiModel,
          messages: opts.messages,
          response_format: { type: 'json_schema', json_schema: { name: opts.schemaName, strict: true, schema: opts.jsonSchema } },
          max_completion_tokens: opts.maxTokens ?? 4000,
        }),
        signal: AbortSignal.timeout(90_000),
        cache: 'no-store',
      });
    } catch (e) {
      lastErr = new AIError(`Could not reach OpenAI: ${(e as Error).message}`, 502);
      continue;
    }
    const body = (await res.json().catch(() => ({}))) as ChatResponse;
    if (res.status === 429 || res.status >= 500) {
      lastErr = new AIError(body.error?.message ?? `OpenAI is busy (${res.status}). Try again.`, res.status === 429 ? 429 : 502);
      if (body.error?.code === 'insufficient_quota') break;
      await new Promise((r) => setTimeout(r, 600 * 2 ** attempt));
      continue;
    }
    if (!res.ok) {
      const msg = body.error?.message ?? `OpenAI error ${res.status}`;
      throw new AIError(res.status === 401 ? 'OpenAI rejected the API key. Check OPENAI_API_KEY.' : msg, res.status === 401 ? 503 : 502);
    }
    const choice = body.choices?.[0];
    if (choice?.message?.refusal) throw new AIError(`The model declined: ${choice.message.refusal}`, 422);
    const content = choice?.message?.content;
    if (!content) {
      throw new AIError(choice?.finish_reason === 'length' ? 'The AI response was cut off. Try a shorter request.' : 'The AI returned an empty response.', 502);
    }
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { throw new AIError('The AI returned malformed JSON.', 502); }
    const v = opts.validator.safeParse(parsed);
    if (!v.success) throw new AIError('The AI response did not match the expected shape.', 502);
    return v.data;
  }
  throw lastErr ?? new AIError('OpenAI request failed.', 502);
}
