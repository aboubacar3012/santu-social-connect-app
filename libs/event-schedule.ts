import type { EventDate, EventItem } from '@/constants/mock-events';
import { formatEventDate } from '@/constants/mock-events';
import type { EventFormData } from '@/components/events/create-event';

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

export function startOfDay(date: Date): Date {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function endOfDay(date: Date): Date {
  const out = new Date(date);
  out.setHours(23, 59, 59, 999);
  return out;
}

export function mergeDateAndTime(date: Date, time: Date): Date {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameEventDate(a: EventDate, b: EventDate): boolean {
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

export function formatEventDateRange(start: EventDate, end: EventDate): string {
  if (start.year === end.year && start.month === end.month) {
    const month = MONTH_LABELS[start.month - 1] ?? '';
    return `${start.day} – ${end.day} ${month} ${start.year}`;
  }
  if (start.year === end.year) {
    const startMonth = MONTH_LABELS[start.month - 1] ?? '';
    const endMonth = MONTH_LABELS[end.month - 1] ?? '';
    return `${start.day} ${startMonth} – ${end.day} ${endMonth} ${start.year}`;
  }
  return `${formatEventDate(start)} – ${formatEventDate(end)}`;
}

export function formatEventSchedule(
  event: Pick<
    EventItem,
    'date' | 'time' | 'endDate' | 'endTime' | 'isAllDay' | 'startsAt' | 'endsAt'
  >,
): { dateLabel: string; time: string } {
  const multiDay = event.endDate !== null && !isSameEventDate(event.date, event.endDate);

  if (event.isAllDay) {
    return {
      dateLabel: multiDay && event.endDate
        ? formatEventDateRange(event.date, event.endDate)
        : formatEventDate(event.date),
      time: 'Toute la journée',
    };
  }

  if (event.endTime && multiDay && event.endDate) {
    return {
      dateLabel: formatEventDateRange(event.date, event.endDate),
      time: `${event.time} – ${event.endTime}`,
    };
  }

  if (event.endTime && event.endTime !== event.time) {
    return {
      dateLabel: formatEventDate(event.date),
      time: `${event.time} – ${event.endTime}`,
    };
  }

  return {
    dateLabel: formatEventDate(event.date),
    time: event.time,
  };
}

export function getEventEndTimestamp(event: Pick<EventItem, 'startsAt' | 'endsAt'>): number {
  return event.endsAt ?? event.startsAt;
}

export function isEventPast(event: Pick<EventItem, 'startsAt' | 'endsAt'>): boolean {
  return getEventEndTimestamp(event) < Date.now();
}

export function buildEventScheduleFromForm(data: EventFormData): {
  startsAt: string;
  endsAt?: string;
  isAllDay: boolean;
} {
  const endDay = data.isMultiDay ? data.endDate : data.startDate;

  if (data.isAllDay) {
    return {
      startsAt: startOfDay(data.startDate).toISOString(),
      endsAt: endOfDay(endDay).toISOString(),
      isAllDay: true,
    };
  }

  if (!data.startTime) {
    throw new Error('Heure de début requise');
  }

  const startsAt = mergeDateAndTime(data.startDate, data.startTime);

  if (data.endTime) {
    const endsAt = mergeDateAndTime(endDay, data.endTime);
    if (endsAt.getTime() < startsAt.getTime()) {
      throw new Error('La fin doit être postérieure au début');
    }
    return {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      isAllDay: false,
    };
  }

  return {
    startsAt: startsAt.toISOString(),
    isAllDay: false,
  };
}

export function dateFromTimestamp(ts: number): Date {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
