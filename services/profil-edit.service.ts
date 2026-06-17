import type { BirthDateParts } from '@/types/profile';

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

/** Types MIME acceptes par l'API d'upload (`POST /uploads/file`). */
const ALLOWED_UPLOAD_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
]);

/**
 * Normalise un MIME type pour qu'il corresponde exactement a la liste acceptee par l'API upload.
 * En cas de valeur inconnue, retombe sur `image/jpeg`.
 */
function normalizeContentTypeForUpload(raw: string): string {
  const t = raw.split(';')[0]?.trim().toLowerCase() ?? 'image/jpeg';
  if (t === 'image/jpg') return 'image/jpeg';
  if (ALLOWED_UPLOAD_CONTENT_TYPES.has(t)) return t;
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

type UploadFileResponse = {
  fileUrl?: string;
};

async function uploadAssetViaApi(
  token: string,
  body: FormData,
): Promise<string> {
  const res = await fetch(`${API_BASE}/uploads/file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body,
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(formatApiErrorMessage(data, text || `Upload ${res.status}`));
  }
  const parsed = data as UploadFileResponse;
  if (!parsed.fileUrl) {
    throw new Error('Reponse upload invalide.');
  }
  return parsed.fileUrl;
}

async function uploadLocalFileUriViaApi(
  token: string,
  localUri: string,
  contentType: string,
  fileName: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: contentType,
    name: fileName,
  } as unknown as Blob);
  return uploadAssetViaApi(token, formData);
}

async function uploadDataUrlViaApi(
  token: string,
  dataUrl: string,
  contentType: string,
  fileName: string,
): Promise<string> {
  const blobRes = await fetch(dataUrl);
  const blob = await blobRes.blob();
  const formData = new FormData();
  formData.append('file', blob, fileName);
  return uploadAssetViaApi(token, formData);
}

/**
 * Retourne une URL HTTPS (`fileUrl`) pour le PATCH, ou une chaine deja utilisable (data / http).
 * - `https?://` : inchange (deja sur S3/CDN).
 * - `file://` : upload multipart vers l'API.
 * - `data:` : upload via API en multipart.
 */
export async function resolveProfileAssetValueForApi(
  uri: string | null,
  token: string,
): Promise<string> {
  if (uri === null || uri === '') return '';
  const t = uri.trim();
  if (t.startsWith('https://') || t.startsWith('http://')) return t;

  if (t.startsWith('file://')) {
    const contentType = normalizeContentTypeForUpload(inferContentTypeFromUri(t));
    const fileName = decodeURIComponent(t.split('/').pop() || 'upload.jpg').split('?')[0] || 'upload.jpg';
    return uploadLocalFileUriViaApi(token, t, contentType, fileName);
  }

  if (t.startsWith('data:')) {
    const mime = extractMimeTypeFromDataUrl(t);
    const contentType = normalizeContentTypeForUpload(mime ?? 'image/jpeg');
    const fileName =
      contentType === 'image/png'
        ? 'photo.png'
        : contentType === 'image/webp'
          ? 'photo.webp'
          : contentType === 'image/heic'
            ? 'photo.heic'
            : 'photo.jpg';
    return uploadDataUrlViaApi(token, t, contentType, fileName);
  }

  return t;
}
