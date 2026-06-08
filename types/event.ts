import type { EventDate, EventItem, EventLink, EventType } from '@/constants/mock-events';

export type { EventDate, EventItem, EventLink, EventType };

export type ListEventsApiResponse = {
  events: EventItem[];
};

export type GetEventApiResponse = {
  event: EventItem;
};

export type CreateEventApiPayload = {
  title: string;
  type: EventType;
  imageUrl?: string;
  description?: string;
  startsAt: string;
  address: string;
  links?: EventLink[];
};

export type CreateEventApiResponse = {
  event: EventItem;
};
