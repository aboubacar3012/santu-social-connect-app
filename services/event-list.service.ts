import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { ListEventsApiResponse } from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export type ListEventsQuery = {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Récupère la liste des événements publiés.
 */
export async function listEventsApi(
  query: ListEventsQuery = {},
): Promise<ListEventsApiResponse> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);

  const qs = params.toString();
  const url = qs ? `${API_BASE}/events?${qs}` : `${API_BASE}/events`;

  const res = await fetch(url, {
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

  const data = body as Partial<ListEventsApiResponse>;
  if (!Array.isArray(data?.events)) {
    throw new Error('Réponse liste événements invalide.');
  }

  return data as ListEventsApiResponse;
}
