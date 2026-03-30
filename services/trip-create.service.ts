import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { CreateTripApiPayload, CreateTripApiResponse } from '@/types/trip';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Appelle l'API pour publier un trajet.
 */
export async function createTripApi(
  token: string,
  payload: CreateTripApiPayload,
): Promise<CreateTripApiResponse> {
  const res = await fetch(`${API_BASE}/trips`, {
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

  const data = body as Partial<CreateTripApiResponse>;
  if (!data?.trip || typeof data.trip !== 'object') {
    throw new Error('Réponse création trajet invalide.');
  }

  return data as CreateTripApiResponse;
}
