import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

// AES-256-GCM sealing for cookie payloads. Format: base64url(iv[12] | tag[16] | ciphertext).

function keyFrom(secret: string): Buffer {
  return createHash('sha256').update(`zl-session:${secret}`).digest();
}

export function seal(value: unknown, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(secret), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64url');
}

export function unseal<T>(token: string, secret: string): T | null {
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length < 29) return null;
    const decipher = createDecipheriv('aes-256-gcm', keyFrom(secret), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const pt = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]);
    return JSON.parse(pt.toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function sha256Base64Url(input: string): string {
  return createHash('sha256').update(input).digest('base64url');
}
