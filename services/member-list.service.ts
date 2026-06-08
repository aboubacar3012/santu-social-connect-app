import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { ListMembersApiResponse } from '@/types/member';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export type ListMembersQuery = {
  q?: string;
  city?: string;
  quartier?: string;
};

/**
 * Récupère la liste des membres de l'annuaire.
 */
export async function listMembersApi(
  query: ListMembersQuery = {},
): Promise<ListMembersApiResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.city) params.set('city', query.city);
  if (query.quartier) params.set('quartier', query.quartier);

  const qs = params.toString();
  const url = qs ? `${API_BASE}/members?${qs}` : `${API_BASE}/members`;

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

  const data = body as Partial<ListMembersApiResponse>;
  if (!Array.isArray(data?.members)) {
    throw new Error('Réponse liste membres invalide.');
  }

  return data as ListMembersApiResponse;
}
