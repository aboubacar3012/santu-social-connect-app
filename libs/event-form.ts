import type { EventFormData } from '@/components/events/create-event';
import {
  buildEventScheduleFromForm,
  dateFromTimestamp,
  isSameCalendarDay,
} from '@/libs/event-schedule';
import { resolveProfileImageUri } from '@/libs/profile';
import { resolveProfileAssetValueForApi } from '@/services/profil-edit.service';
import type { CreateEventApiPayload, EventItem } from '@/types/event';

export async function buildCreateEventPayloadFromForm(
  token: string,
  data: EventFormData,
): Promise<CreateEventApiPayload> {
  const schedule = buildEventScheduleFromForm(data);

  const payload: CreateEventApiPayload = {
    title: data.title,
    type: data.type,
    startsAt: schedule.startsAt,
    address: data.address,
    status: data.status,
  };

  if (schedule.endsAt) {
    payload.endsAt = schedule.endsAt;
  }
  if (schedule.isAllDay) {
    payload.isAllDay = true;
  }

  const description = data.description.trim();
  if (description.length > 0) {
    payload.description = description;
  }

  if (data.imageUri) {
    const imageUrl = await resolveProfileAssetValueForApi(data.imageUri, token);
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }
  }

  const linkLabel = data.linkLabel.trim();
  const linkUrl = data.linkUrl.trim();
  if (linkLabel && linkUrl) {
    payload.links = [{ label: linkLabel, url: linkUrl }];
  }

  return payload;
}

export function eventItemToFormData(event: EventItem): EventFormData {
  const startsAt = new Date(event.startsAt);
  const startDate = dateFromTimestamp(event.startsAt);
  const endDate = event.endsAt ? dateFromTimestamp(event.endsAt) : startDate;
  const isMultiDay = !isSameCalendarDay(startDate, endDate);

  let endTime: Date | null = null;
  if (event.endTime && event.endsAt) {
    const endTs = new Date(event.endsAt);
    endTime = new Date(
      endTs.getFullYear(),
      endTs.getMonth(),
      endTs.getDate(),
      endTs.getHours(),
      endTs.getMinutes(),
    );
  }

  return {
    title: event.title,
    type: event.type,
    status: event.status,
    imageUri: resolveProfileImageUri(event.image),
    description: event.description,
    startDate,
    startTime: event.isAllDay ? null : startsAt,
    endDate,
    endTime,
    isAllDay: event.isAllDay,
    isMultiDay,
    address: event.address,
    linkLabel: event.links[0]?.label ?? '',
    linkUrl: event.links[0]?.url ?? '',
  };
}

export async function buildUpdateEventPayloadFromForm(
  token: string,
  data: EventFormData,
): Promise<CreateEventApiPayload> {
  return buildCreateEventPayloadFromForm(token, data);
}
