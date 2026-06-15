import {
  formatApiErrorMessage,
  resolveProfileAssetValueForApi,
} from '@/services/profil-edit.service';
import type { MeApiUser } from '@/types/profile';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export type GetMeApiResponse = {
  user: MeApiUser;
};

export type UpdateMeApiResponse = {
  user: MeApiUser;
};

export type DeleteAccountApiResponse = {
  success: true;
};

export type UpdateProfileApiPayload = Record<string, unknown>;

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Récupère le profil de l'utilisateur connecté.
 */
export async function getMeApi(token: string): Promise<GetMeApiResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(formatApiErrorMessage(body, `Erreur ${res.status}`));
  }

  const data = body as Partial<GetMeApiResponse>;
  if (!data?.user || typeof data.user !== 'object') {
    throw new Error('Réponse profil invalide.');
  }

  return data as GetMeApiResponse;
}

/**
 * Met à jour partiellement le profil utilisateur.
 */
export async function updateProfileApi(
  token: string,
  payload: UpdateProfileApiPayload,
): Promise<UpdateMeApiResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(formatApiErrorMessage(body, `Erreur ${res.status}`));
  }

  const data = body as Partial<UpdateMeApiResponse>;
  if (!data?.user || typeof data.user !== 'object') {
    throw new Error('Réponse mise à jour profil invalide.');
  }

  return data as UpdateMeApiResponse;
}

/**
 * Upload la photo de profil si nécessaire, puis met à jour le profil.
 */
export async function updateProfileWithAvatarApi(
  token: string,
  payload: UpdateProfileApiPayload,
  avatarUri: string | null | undefined,
): Promise<UpdateMeApiResponse> {
  const nextPayload = { ...payload };

  if (avatarUri !== undefined) {
    nextPayload.profilePicture = await resolveProfileAssetValueForApi(
      avatarUri,
      token,
    );
  }

  return updateProfileApi(token, nextPayload);
}

/**
 * Supprime le compte utilisateur (suppression logique côté API).
 */
export async function deleteAccountApi(token: string): Promise<DeleteAccountApiResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(formatApiErrorMessage(body, `Erreur ${res.status}`));
  }

  const data = body as Partial<DeleteAccountApiResponse>;
  if (!data?.success) {
    throw new Error('Réponse suppression de compte invalide.');
  }

  return data as DeleteAccountApiResponse;
}
