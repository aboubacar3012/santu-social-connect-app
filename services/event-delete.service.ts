import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type { DeleteEventApiResponse } from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Supprime un événement (admin, organisateur).
 */
export async function deleteEventApi(
  token: string,
  eventId: string,
): Promise<DeleteEventApiResponse> {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'DELETE',
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

  const data = body as { success?: boolean };
  if (data?.success !== true) {
    throw new Error('Réponse suppression événement invalide.');
  }

  return { success: true };
}
