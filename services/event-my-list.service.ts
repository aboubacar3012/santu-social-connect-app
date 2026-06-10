import { mapEventFromApi } from '@/libs/event-api';
import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { EventItem, ListMyEventsApiResponse } from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Récupère les événements publiés par l'utilisateur connecté (admin).
 */
export async function listMyEventsApi(token: string): Promise<ListMyEventsApiResponse> {
  const res = await fetch(`${API_BASE}/events/mine`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
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

  const data = body as { events?: Parameters<typeof mapEventFromApi>[0][] };
  if (!Array.isArray(data?.events)) {
    throw new Error('Réponse liste événements invalide.');
  }

  return { events: data.events.map(mapEventFromApi) };
}
