import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { ListTripsApiResponse } from '@/types/trip';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Récupère la liste des trajets publiés.
 */
export async function listPublishedTripsApi(): Promise<ListTripsApiResponse> {
  const res = await fetch(`${API_BASE}/trips`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
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

  const data = body as Partial<ListTripsApiResponse>;
  if (!Array.isArray(data?.trips)) {
    throw new Error('Réponse liste trajets invalide.');
  }

  return data as ListTripsApiResponse;
}
