import type { EventFormData } from '@/components/events/create-event';
import { resolveProfileAssetValueForApi } from '@/services/profil-edit.service';
import type { CreateEventApiPayload } from '@/types/event';

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
