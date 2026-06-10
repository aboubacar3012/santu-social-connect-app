import { toEventTypeUi } from '@/libs/event-type';
import { parseEventStatus } from '@/libs/event-status';
import type { EventItem } from '@/types/event';

type EventItemWire = Omit<EventItem, 'type' | 'status'> & {
  type: string;
  status?: string;
};

export function mapEventFromApi(event: EventItemWire): EventItem {
  return {
    ...event,
    type: toEventTypeUi(event.type),
    status: parseEventStatus(event.status),
  };
}
