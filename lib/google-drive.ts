import crypto from 'crypto';

/**
 * Minimal Google Drive client (service account, zero dependencies).
 * Used as the Deck Vault storage backend — files live in a private Drive
 * folder shared with the service account, and are only ever served to users
 * by streaming through our own API after an entitlement check. Drive is an
 * implementation detail; nothing Google-branded reaches the browser.
 *
 * Required env:
 *   GOOGLE_SA_CLIENT_EMAIL  — service account email
 *   GOOGLE_SA_PRIVATE_KEY   — its private key (PEM; \n may be escaped)
 *   GDRIVE_FOLDER_ID        — the Drive folder shared with the service account
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/drive';

/** storage_path prefix that marks a Drive-backed file (vs legacy bucket path). */
export const GDRIVE_PREFIX = 'gdrive:';

export function isDrivePath(storagePath: string): boolean {
  return storagePath.startsWith(GDRIVE_PREFIX);
}

export function driveFileId(storagePath: string): string {
  return storagePath.slice(GDRIVE_PREFIX.length);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getFolderId(): string {
  const folder = process.env.GDRIVE_FOLDER_ID?.replace(/^"|"$/g, '').trim();
  if (!folder) throw new Error('GDRIVE_FOLDER_ID is missing');
  return folder;
}

function getCreds() {
  // Option 1: Base64-encoded JSON file (Bulletproof method)
  if (process.env.GOOGLE_SA_CREDENTIALS) {
    try {
      const json = JSON.parse(Buffer.from(process.env.GOOGLE_SA_CREDENTIALS, 'base64').toString('utf-8'));
      return { email: json.client_email, key: json.private_key };
    } catch (e: any) {
      throw new Error(`Failed to parse GOOGLE_SA_CREDENTIALS: ${e.message}`);
    }
  }

  // Option 2: Individual variables
  const email = process.env.GOOGLE_SA_CLIENT_EMAIL?.replace(/^"|"$/g, '').replace(/'/g, '').trim();
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY || '';
  
  if (!email || !rawKey) {
    throw new Error('Google Drive storage is not configured (Provide GOOGLE_SA_CREDENTIALS base64 string OR individual vars)');
  }

  // Reconstruct the PEM defensively to ignore all mangled newlines, spaces, or quotes from Vercel env vars
  const b64 = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\\r/g, '')
    .replace(/\s+/g, '')
    .replace(/["']/g, '');
    
  if (b64.length < 100) {
     throw new Error('GOOGLE_SA_PRIVATE_KEY looks truncated or corrupted. It must be the full RSA private key.');
  }
    
  const key = `-----BEGIN PRIVATE KEY-----\n${b64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

  return { email, key };
}

// Module-scoped token cache (per lambda instance).
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  // --- OPTION A: OAuth2 Refresh Token (Personal Google Accounts) ---
  if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_CLIENT_SECRET) {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_DRIVE_CLIENT_ID.trim(),
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET.trim(),
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN.trim(),
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error(`OAuth2 refresh failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
    return cachedToken.token;
  }

  // --- OPTION B: Service Account JWT ---
  const { email, key } = getCreds();
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat,
    exp: iat + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key);
  const jwt = `${unsigned}.${b64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Drive auth failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

/**
 * Start a resumable upload session in the vault folder. The returned URL is
 * itself the credential — the admin's browser PUTs the file bytes directly to
 * Google, bypassing our serverless body-size limits. `origin` must be the
 * uploading page's origin so Google attaches CORS headers to the session.
 */
export async function createUploadSession(
  filename: string,
  mimeType: string,
  origin: string
): Promise<string> {
  const folder = getFolderId();
  const token = await getAccessToken();
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        Origin: origin,
      },
      body: JSON.stringify({ name: filename, parents: [folder] }),
    }
  );
  if (!res.ok) {
    throw new Error(`Drive session failed: ${res.status} ${await res.text()}`);
  }
  const location = res.headers.get('location');
  if (!location) throw new Error('Drive did not return an upload session URL');
  return location;
}

/** Fetch a file's stored NAME (metadata only). Returns null on any failure. */
export async function fetchFileName(fileId: string): Promise<string | null> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=name&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.name === 'string' ? data.name : null;
  } catch {
    return null;
  }
}

/** Fetch a file's bytes as a streaming Response (alt=media). */
export async function fetchFileStream(fileId: string): Promise<Response> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok || !res.body) {
    throw new Error(`Drive fetch failed: ${res.status} ${await res.text().catch(() => '')}`);
  }
  return res;
}

/** Permanently delete a file the service account owns. */
export async function deleteFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Drive delete failed: ${res.status} ${await res.text()}`);
  }
}
