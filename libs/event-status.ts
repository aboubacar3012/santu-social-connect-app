export type EventStatus =
  | 'draft'
  | 'published'
  | 'cancelled'
  | 'completed'
  | 'archived';

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
  completed: 'Terminé',
  archived: 'Archivé',
};

export const EVENT_STATUS_HINTS: Record<EventStatus, string> = {
  draft: 'Non visible dans la liste publique',
  published: 'Visible par tous les membres',
  cancelled: 'Événement annulé',
  completed: 'Événement terminé',
  archived: 'Retiré de la liste active',
};

export const EVENT_STATUSES = Object.keys(EVENT_STATUS_LABELS) as EventStatus[];

export function parseEventStatus(value: string | undefined): EventStatus {
  if (value && EVENT_STATUSES.includes(value as EventStatus)) {
    return value as EventStatus;
  }
  return 'published';
}
