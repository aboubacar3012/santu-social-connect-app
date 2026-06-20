import type { EventTypeFilter } from '@/components/events/event-floating-filters';
import { listEventsApi } from '@/services/event-list.service';
import type { EventItem } from '@/types/event';

export const eventsQueryKeys = {
  all: ['events'] as const,
  list: (typeFilter: EventTypeFilter) => [...eventsQueryKeys.all, 'list', typeFilter] as const,
};

export async function fetchEventsList(typeFilter: EventTypeFilter): Promise<EventItem[]> {
  const { events } = await listEventsApi({
    type: typeFilter === 'All' ? undefined : typeFilter,
  });
  return events;
}
