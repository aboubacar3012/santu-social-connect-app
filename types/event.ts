export type EventType =
  | 'Afterwork'
  | 'Conference'
  | 'Networking'
  | 'Workshop'
  | 'Concert'
  | 'Exposition'
  | 'Sortie'
  | 'Autre';

export type EventLink = {
  label: string;
  url: string;
};

export type EventDate = {
  day: number;
  month: number;
  year: number;
};

export type EventItem = {
  id: string;
  title: string;
  type: EventType;
  image: string;
  description: string;
  date: EventDate;
  time: string;
  address: string;
  links: EventLink[];
  startsAt: number;
  status?: string;
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

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
