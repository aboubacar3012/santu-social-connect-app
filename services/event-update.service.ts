import { toEventTypeApi, toEventTypeUi } from '@/libs/event-type';
import { formatApiErrorMessage } from '@/services/profil-edit.service';
import type {
  EventItem,
  UpdateEventApiPayload,
  UpdateEventApiResponse,
} from '@/types/event';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

type EventItemWire = Omit<EventItem, 'type'> & { type: string };

function mapEventFromApi(event: EventItemWire): EventItem {
  return {
    ...event,
    type: toEventTypeUi(event.type),
  };
}

/**
 * Met à jour un événement (admin, organisateur).
 */
export async function updateEventApi(
  token: string,
  eventId: string,
  payload: UpdateEventApiPayload,
): Promise<UpdateEventApiResponse> {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      type: toEventTypeApi(payload.type),
    }),
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

  const data = body as { event?: EventItemWire };
  if (!data?.event || typeof data.event !== 'object') {
    throw new Error('Réponse mise à jour événement invalide.');
  }

  return { event: mapEventFromApi(data.event) };
}
