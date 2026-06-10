import { mapEventFromApi } from '@/libs/event-api';
import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { EventItem, GetEventApiResponse } from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Récupère le détail d'un événement.
 */
export async function getEventByIdApi(id: string): Promise<GetEventApiResponse> {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
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

  const data = body as { event?: Parameters<typeof mapEventFromApi>[0] };
  if (!data?.event || typeof data.event !== 'object') {
    throw new Error('Réponse détail événement invalide.');
  }

  return { event: mapEventFromApi(data.event) };
}
