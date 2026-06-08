import type { ProfileFormData } from '@/components/profile/update-profil';
import { resolveProfileImageUri } from '@/libs/profile';
import { getProfileDisplayName } from '@/services/profil-view.service';
import type { MeApiUser } from '@/types/profile';

export function meToProfileFormData(me: MeApiUser): ProfileFormData {
  return {
    name: getProfileDisplayName(me),
    jobTitle: me.jobTitle?.trim() ?? '',
    company: me.company?.trim() ?? '',
    city: me.city?.trim() ?? '',
    quartier: me.quartier?.trim() ?? '',
    bio: me.bio?.trim() ?? '',
    email: me.email?.trim() ?? '',
    avatarUri: resolveProfileImageUri(me.profilePicture),
    directoryVisible: Boolean(me.directoryVisible),
    showEmailInDirectory: Boolean(me.showEmailInDirectory),
    showPhoneInDirectory: Boolean(me.showPhoneInDirectory),
  };
}

export function isProfileVerified(me: MeApiUser): boolean {
  return Boolean(
    me.identityVerified || me.identityVerificationStatus === 'approved',
  );
}

export function splitDisplayName(name: string): {
  firstName: string;
  lastName: string | null;
} {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: '', lastName: null };

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string | null;
  email?: string | null;
  profilePicture?: string;
  jobTitle?: string | null;
  company?: string | null;
  quartier?: string | null;
  city?: string | null;
  bio?: string | null;
  directoryVisible?: boolean;
  showEmailInDirectory?: boolean;
  showPhoneInDirectory?: boolean;
};

export function profileFormToUpdatePayload(
  data: ProfileFormData,
  profilePicture?: string,
): UpdateProfilePayload {
  const { firstName, lastName } = splitDisplayName(data.name);

  const payload: UpdateProfilePayload = {
    firstName,
    lastName,
    email: data.email.trim() || null,
    jobTitle: data.jobTitle.trim() || null,
    company: data.company.trim() || null,
    city: data.city.trim() || null,
    quartier: data.quartier.trim() || null,
    bio: data.bio.trim() || null,
    directoryVisible: data.directoryVisible,
    showEmailInDirectory: data.showEmailInDirectory,
    showPhoneInDirectory: data.showPhoneInDirectory,
  };

  if (profilePicture !== undefined) {
    payload.profilePicture = profilePicture;
  }

  return payload;
}
