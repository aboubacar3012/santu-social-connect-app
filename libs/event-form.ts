import type { EventFormData } from '@/components/events/create-event';
import { resolveProfileImageUri } from '@/libs/profile';
import { resolveProfileAssetValueForApi } from '@/services/profil-edit.service';
import type { CreateEventApiPayload, EventItem } from '@/types/event';

export function mergeEventDateTime(eventDate: Date, eventTime: Date): string {
  const out = new Date(eventDate);
  out.setHours(eventTime.getHours(), eventTime.getMinutes(), 0, 0);
  return out.toISOString();
}

export async function buildCreateEventPayloadFromForm(
  token: string,
  data: EventFormData,
): Promise<CreateEventApiPayload> {
  const payload: CreateEventApiPayload = {
    title: data.title,
    type: data.type,
    startsAt: mergeEventDateTime(data.eventDate, data.eventTime),
    address: data.address,
  };

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
  const eventDate = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate(),
  );

  return {
    title: event.title,
    type: event.type,
    imageUri: resolveProfileImageUri(event.image),
    description: event.description,
    eventDate,
    eventTime: startsAt,
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
