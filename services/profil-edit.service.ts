import * as FileSystem from 'expo-file-system/legacy';
import type { BirthDateParts, PresignResponse } from '@/types/profile';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Convertit une date ISO (`YYYY-MM-DD` / Date JSON) en 3 champs texte (jour/mois/annee)
 * adaptes aux inputs du formulaire d'edition profil.
 * ex: 2026-03-30 → 30 / 03 / 2026
 */
export function splitBirthDateIsoToFormParts(
  iso: string | null | undefined,
): BirthDateParts {
  if (!iso) return { d: '', m: '', y: '' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { d: '', m: '', y: '' };
  return {
    d: String(date.getUTCDate()).padStart(2, '0'),
    m: String(date.getUTCMonth() + 1).padStart(2, '0'),
    y: String(date.getUTCFullYear()),
  };
}

/**
 * Valide les champs jour/mois/annee du formulaire puis reconstruit une date ISO (`YYYY-MM-DD`).
 * Retourne `null` si l'une des valeurs est invalide.
 */
export function buildBirthDateIsoFromFormParts(
  day: string,
  month: string,
  year: string,
): string | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!day || !month || !year || Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCDate() !== d || dt.getUTCMonth() !== m - 1) return null;
  return dt.toISOString().slice(0, 10);
}

/** Types MIME acceptes par `POST /uploads/presign` (aligne sur le DTO API). */
const ALLOWED_PRESIGN_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
]);

/**
 * Normalise un MIME type pour qu'il corresponde exactement a la liste acceptee par l'API presign.
 * En cas de valeur inconnue, retombe sur `image/jpeg`.
 */
function normalizeContentTypeForPresign(raw: string): string {
  const t = raw.split(';')[0]?.trim().toLowerCase() ?? 'image/jpeg';
  if (t === 'image/jpg') return 'image/jpeg';
  if (ALLOWED_PRESIGN_CONTENT_TYPES.has(t)) return t;
  return 'image/jpeg';
}

/**
 * Deduit un MIME type a partir de l'extension de fichier d'une URI locale ou distante.
 * Utilise `image/jpeg` par defaut si l'extension est inconnue.
 */
function inferContentTypeFromUri(uri: string): string {
  const path = uri.split('?')[0]?.split('#')[0] ?? uri;
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

/**
 * Extrait le MIME type d'une data URL (`data:<mime>;base64,...`).
 */
function extractMimeTypeFromDataUrl(dataUrl: string): string | null {
  const m = /^data:([^;,]+)/.exec(dataUrl);
  return m?.[1]?.trim() ?? null;
}

/**
 * Convertit une chaine base64 en octets binaires, utile comme fallback d'upload.
 */
function decodeBase64ToBytes(b64: string): Uint8Array {
  const bin = globalThis.atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Uniformise la lecture des erreurs API Nest/REST (`message` string | string[]).
 * Retourne `fallback` si le corps ne contient pas de message exploitable.
 */
export function formatApiErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return fallback;
  const m = (body as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) {
    return m.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n');
  }
  return fallback;
}

/**
 * Envoie le binaire final sur l'URL presignee S3 (PUT) avec le bon `Content-Type`.
 */
async function uploadBytesToPresignedUrl(
  uploadUrl: string,
  contentType: string,
  body: Blob | Uint8Array,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: body as unknown as BodyInit,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Upload S3 ${res.status}`);
  }
}

/** `file://` : lecture binaire puis PUT ; repli base64 si `blob()` indisponible. */
async function uploadLocalFileUriToPresignedUrl(
  localUri: string,
  uploadUrl: string,
  contentType: string,
): Promise<void> {
  try {
    const fileRes = await fetch(localUri);
    const blob = await fileRes.blob();
    await uploadBytesToPresignedUrl(uploadUrl, contentType, blob);
  } catch {
    const b64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });
    const bytes = decodeBase64ToBytes(b64);
    await uploadBytesToPresignedUrl(uploadUrl, contentType, bytes);
  }
}

/**
 * Demande une URL presignee au backend, execute l'upload concret, puis retourne l'URL publique `fileUrl`.
 */
async function requestPresignAndUpload(
  token: string,
  contentType: string,
  fileName: string,
  uploadBody: (uploadUrl: string, ct: string) => Promise<void>,
): Promise<string> {
  const presignRes = await fetch(`${API_BASE}/uploads/presign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ contentType, fileName }),
  });
  const text = await presignRes.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!presignRes.ok) {
    throw new Error(formatApiErrorMessage(data, text || `Pre-upload ${presignRes.status}`));
  }
  const parsed = data as Partial<PresignResponse>;
  if (!parsed.uploadUrl || !parsed.fileUrl) {
    throw new Error('Reponse pre-upload invalide.');
  }
  const ct = normalizeContentTypeForPresign(parsed.contentType ?? contentType);
  await uploadBody(parsed.uploadUrl, ct);
  return parsed.fileUrl;
}

/**
 * Retourne une URL HTTPS (`fileUrl`) pour le PATCH, ou une chaine deja utilisable (data / http).
 * - `https?://` : inchange (deja sur S3/CDN).
 * - `file://` : pre-signature + PUT.
 * - `data:` : upload vers S3 pour ne plus envoyer de gros base64 au PATCH.
 */
export async function resolveProfileAssetValueForApi(
  uri: string | null,
  token: string,
): Promise<string> {
  if (uri === null || uri === '') return '';
  const t = uri.trim();
  if (t.startsWith('https://') || t.startsWith('http://')) return t;

  if (t.startsWith('file://')) {
    const contentType = normalizeContentTypeForPresign(inferContentTypeFromUri(t));
    const fileName = decodeURIComponent(t.split('/').pop() || 'upload.jpg').split('?')[0] || 'upload.jpg';
    return requestPresignAndUpload(token, contentType, fileName, (uploadUrl, ct) =>
      uploadLocalFileUriToPresignedUrl(t, uploadUrl, ct),
    );
  }

  if (t.startsWith('data:')) {
    const mime = extractMimeTypeFromDataUrl(t);
    const contentType = normalizeContentTypeForPresign(mime ?? 'image/jpeg');
    const fileName =
      contentType === 'image/png'
        ? 'photo.png'
        : contentType === 'image/webp'
          ? 'photo.webp'
          : contentType === 'image/heic'
            ? 'photo.heic'
            : 'photo.jpg';
    return requestPresignAndUpload(token, contentType, fileName, async (uploadUrl, ct) => {
      const blobRes = await fetch(t);
      const blob = await blobRes.blob();
      await uploadBytesToPresignedUrl(uploadUrl, ct, blob);
    });
  }

  return t;
}
