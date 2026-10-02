/**
 * SERVER ONLY — signs the Interview Intelligence entitlement assertion (proposed C10).
 * Imported by app/api/interview-intelligence/token/route.ts and nothing else; the private
 * key must never reach the browser bundle.
 */
import { createPrivateKey, randomUUID, sign } from 'crypto';

export interface AssertionInput {
  sub: string;
  email: string;
  tier: 'free' | 'lite' | 'pro';
  subExp: string | null;
  admin: boolean;
}

export const ASSERTION_LIFETIME_S = 300;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Env UIs often store PEMs with literal "\n"; normalise before parsing. */
export function normalisePem(raw: string | undefined | null): string | null {
  if (!raw) return null;
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

/** Returns { token, exp } or throws if the key is missing or not Ed25519. */
export function signAssertion(input: AssertionInput, pem: string, kid = 'k1', nowS = Math.floor(Date.now() / 1000)) {
  const key = createPrivateKey(pem);
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('II signing key must be Ed25519');
  const claims = {
    iss: 'mece-app',
    aud: 'mece-interview-intelligence',
    sub: input.sub,
    email: input.email,
    tier: input.tier,
    sub_exp: input.subExp,
    ent: input.tier === 'pro' ? ['interview_intelligence'] : [],
    adm: input.admin,
    iat: nowS,
    nbf: nowS,
    exp: nowS + ASSERTION_LIFETIME_S,
    jti: randomUUID(),
    ver: 1,
  };
  const signingInput = `${b64url(JSON.stringify({ alg: 'EdDSA', typ: 'JWT', kid }))}.${b64url(JSON.stringify(claims))}`;
  // Ed25519 takes no digest algorithm: crypto.sign(null, ...).
  const signature = sign(null, Buffer.from(signingInput), key);
  return { token: `${signingInput}.${b64url(signature)}`, exp: claims.exp };
}
