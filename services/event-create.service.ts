import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { CreateEventApiPayload, CreateEventApiResponse } from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Appelle l'API pour publier un événement (admin).
 */
export async function createEventApi(
  token: string,
  payload: CreateEventApiPayload,
): Promise<CreateEventApiResponse> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw new Error(formatApiErrorMessage(body, text || `Erreur ${res.status}`));
  }

  const data = body as Partial<CreateEventApiResponse>;
  if (!data?.event || typeof data.event !== 'object') {
    throw new Error('Réponse création événement invalide.');
  }

  return data as CreateEventApiResponse;
}
