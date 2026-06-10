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

import type { EventStatus } from '@/libs/event-status';

export type EventItem = {
  id: string;
  title: string;
  type: EventType;
  image: string;
  description: string;
  date: EventDate;
  time: string;
  endDate: EventDate | null;
  endTime: string | null;
  isAllDay: boolean;
  address: string;
  links: EventLink[];
  status: EventStatus;
  startsAt: number;
  endsAt: number | null;
};

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Afterwork: 'Afterwork',
  Conference: 'Conférence',
  Networking: 'Networking',
  Workshop: 'Atelier',
  Concert: 'Concert',
  Exposition: 'Exposition',
  Sortie: 'Sortie',
  Autre: 'Autre',
};

export function formatEventDate(date: EventDate): string {
  const month = MONTH_LABELS[date.month - 1] ?? '';
  return `${date.day} ${month} ${date.year}`;
}

function buildStartsAt(date: EventDate, time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(date.year, date.month - 1, date.day, hours, minutes).getTime();
}

function dateFromDaysFromNow(days: number): EventDate {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
}

function mockEvent(
  partial: Omit<EventItem, 'startsAt' | 'endsAt' | 'endDate' | 'endTime' | 'isAllDay' | 'status'> & {
    startsAt?: number;
    endsAt?: number | null;
    endDate?: EventDate | null;
    endTime?: string | null;
    isAllDay?: boolean;
    status?: EventStatus;
  },
): EventItem {
  const startsAt = partial.startsAt ?? buildStartsAt(partial.date, partial.time);
  return {
    endDate: null,
    endTime: null,
    isAllDay: false,
    endsAt: null,
    status: 'published',
    ...partial,
    startsAt,
  };
}

export const MOCK_EVENTS: EventItem[] = [
  mockEvent({
    id: '1',
    title: 'Afterwork fondateurs — Vieux-Port',
    type: 'Afterwork',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    description:
      'Rencontre informelle entre fondateurs marseillais autour d’un verre, avec pitches éclair et échanges libres.',
    date: dateFromDaysFromNow(4),
    time: '19:00',
    address: '12 Quai du Port, 13002 Marseille',
    links: [
      { label: 'Billetterie', url: 'https://example.com/afterwork-vieux-port' },
      { label: 'Site', url: 'https://example.com' },
    ],
  }),
  mockEvent({
    id: '2',
    title: 'Pitch & pizza — Joliette',
    type: 'Networking',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    description:
      'Soirée networking avec présentations de projets locaux, suivies d’un moment convivial autour de pizzas artisanales.',
    date: dateFromDaysFromNow(6),
    time: '18:30',
    address: '45 Rue de la République, 13002 Marseille',
    links: [{ label: "S'inscrire", url: 'https://example.com/pitch-pizza' }],
  }),
  mockEvent({
    id: '3',
    title: 'Levée de fonds : retours d’expérience',
    type: 'Conference',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    description:
      'Conférence avec entrepreneurs et investisseurs marseillais : parcours, erreurs à éviter et bonnes pratiques pour lever des fonds.',
    date: dateFromDaysFromNow(10),
    time: '09:30',
    address: '2 Place de la Major, 13002 Marseille',
    links: [
      { label: 'Programme', url: 'https://example.com/levee-fonds' },
      { label: 'LinkedIn', url: 'https://linkedin.com' },
    ],
  }),
  mockEvent({
    id: '4',
    title: 'Atelier personal branding',
    type: 'Workshop',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    description:
      'Atelier pratique pour travailler votre image de marque, votre pitch et votre présence sur les réseaux professionnels.',
    date: dateFromDaysFromNow(12),
    time: '14:00',
    address: '18 Cours Julien, 13006 Marseille',
    links: [{ label: 'Réserver', url: 'https://example.com/branding' }],
  }),
  mockEvent({
    id: '5',
    title: 'Breakfast entrepreneurs — Prado',
    type: 'Networking',
    image: 'https://images.unsplash.com/photo-1528605114965-762b8517a3e0?w=800&q=80',
    description:
      'Petit-déjeuner networking pour démarrer la journée, rencontrer d’autres entrepreneurs et partager vos actualités.',
    date: dateFromDaysFromNow(14),
    time: '08:00',
    address: '88 Avenue du Prado, 13008 Marseille',
    links: [{ label: 'Billetterie', url: 'https://example.com/breakfast-prado' }],
  }),
  mockEvent({
    id: '6',
    title: 'Speed networking — La Plaine',
    type: 'Networking',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    description:
      'Sessions de rencontres rapides en one-to-one pour élargir votre réseau professionnel en une soirée.',
    date: dateFromDaysFromNow(-5),
    time: '18:00',
    address: '5 Boulevard Chave, 13005 Marseille',
    links: [{ label: 'Replay', url: 'https://example.com/speed-networking' }],
  }),
];

export function findEventById(id: string): EventItem | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function isEventPast(event: EventItem): boolean {
  const end = event.endsAt ?? event.startsAt;
  return end < Date.now();
}
