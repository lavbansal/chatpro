// Lightweight access gate: protects credit-spending endpoints with a single
// shared secret code until real authentication is added. The secret never
// reaches the browser. Unlocking sets an httpOnly cookie holding a derived
// token, which middleware verifies on every protected request.
//
// Uses only Web Crypto so it runs in both the Edge middleware and Node route
// handlers.

export const ACCESS_COOKIE = "chatpro_access";

const TOKEN_MESSAGE = "chatpro-access-v1";
const encoder = new TextEncoder();

/** Whether an access code is configured. When false, the gate is disabled. */
export function isAccessConfigured(): boolean {
  return Boolean(process.env.ACCESS_CODE);
}

/** Constant-time comparison to avoid leaking match progress through timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Derive a stable, unforgeable cookie token from the secret code. An HMAC keyed
 * by the secret cannot be recomputed without the code, so the code itself never
 * has to travel in the cookie.
 */
export async function deriveToken(code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(code),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(TOKEN_MESSAGE),
  );
  return toHex(signature);
}

/** Compare a submitted code against the configured secret. */
export function verifyAccessCode(code: string): boolean {
  const secret = process.env.ACCESS_CODE;
  if (!secret) return false;
  return timingSafeEqual(code, secret);
}

/**
 * Validate an access cookie. When no code is configured the gate is disabled
 * and every request is allowed through.
 */
export async function hasValidAccessCookie(
  token: string | undefined,
): Promise<boolean> {
  const secret = process.env.ACCESS_CODE;
  if (!secret) return true;
  if (!token) return false;
  return timingSafeEqual(token, await deriveToken(secret));
}
