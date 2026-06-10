import type { EventDate, EventItem, EventLink, EventType } from '@/constants/mock-events';
import type { EventStatus } from '@/libs/event-status';

export type { EventDate, EventItem, EventLink, EventType, EventStatus };

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
  endsAt?: string;
  isAllDay?: boolean;
  status?: EventStatus;
  address: string;
  links?: EventLink[];
};

export type CreateEventApiResponse = {
  event: EventItem;
};

export type ListMyEventsApiResponse = {
  events: EventItem[];
};

export type UpdateEventApiPayload = CreateEventApiPayload;

export type UpdateEventApiResponse = {
  event: EventItem;
};

export type DeleteEventApiResponse = {
  success: true;
};
