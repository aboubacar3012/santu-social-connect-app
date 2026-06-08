import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { GetMemberApiResponse } from '@/types/member';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Récupère le profil public d'un membre.
 */
export async function getMemberByIdApi(id: string): Promise<GetMemberApiResponse> {
  const res = await fetch(`${API_BASE}/members/${id}`, {
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

  const data = body as Partial<GetMemberApiResponse>;
  if (!data?.member || typeof data.member !== 'object') {
    throw new Error('Réponse détail membre invalide.');
  }

  return data as GetMemberApiResponse;
}
