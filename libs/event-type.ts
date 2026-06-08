import type { EventType } from '@/constants/mock-events';

/** Valeurs `EventType` côté API (minuscules, anglais). */
export type EventTypeApi =
  | 'afterwork'
  | 'conference'
  | 'networking'
  | 'workshop'
  | 'concert'
  | 'exhibition'
  | 'outing'
  | 'other';

const UI_TO_API: Record<EventType, EventTypeApi> = {
  Afterwork: 'afterwork',
  Conference: 'conference',
  Networking: 'networking',
  Workshop: 'workshop',
  Concert: 'concert',
  Exposition: 'exhibition',
  Sortie: 'outing',
  Autre: 'other',
};

const API_TO_UI: Record<EventTypeApi, EventType> = {
  afterwork: 'Afterwork',
  conference: 'Conference',
  networking: 'Networking',
  workshop: 'Workshop',
  concert: 'Concert',
  exhibition: 'Exposition',
  outing: 'Sortie',
  other: 'Autre',
};

export function toEventTypeApi(type: EventType): EventTypeApi {
  return UI_TO_API[type];
}

export function toEventTypeUi(type: string): EventType {
  return API_TO_UI[type as EventTypeApi] ?? 'Autre';
}
