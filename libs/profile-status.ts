import type { MeApiUser } from '@/types/profile';

export type UserStatusApi =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'deleted'
  | 'suspended';

export type UserRoleApi = 'freemium' | 'premium' | 'enterprise' | 'admin';

export const USER_STATUS_LABELS: Record<UserStatusApi, string> = {
  pending: 'En attente',
  active: 'Actif',
  inactive: 'Inactif',
  deleted: 'Supprimé',
  suspended: 'Suspendu',
};

export const USER_ROLE_LABELS: Record<UserRoleApi, string> = {
  freemium: 'Freemium',
  premium: 'Premium',
  enterprise: 'Enterprise',
  admin: 'Administrateur',
};

export const IDENTITY_STATUS_LABELS = {
  approved: 'Vérifiée',
  pending: 'En cours',
  rejected: 'Refusée',
  missing: 'Non soumise',
} as const;

export type DirectoryRequirement = {
  id: string;
  label: string;
  met: boolean;
};

export function formatMemberSince(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function getIdentityStatusLabel(me: MeApiUser): string {
  if (me.identityVerified || me.identityVerificationStatus === 'approved') {
    return IDENTITY_STATUS_LABELS.approved;
  }
  if (me.identityVerificationStatus === 'rejected') {
    return IDENTITY_STATUS_LABELS.rejected;
  }
  const hasDocs = Boolean(
    me.identityVerificationDocumentFront?.trim() ||
      me.identityVerificationDocumentBack?.trim() ||
      me.identityVerificationDocumentSelfie?.trim(),
  );
  return hasDocs ? IDENTITY_STATUS_LABELS.pending : IDENTITY_STATUS_LABELS.missing;
}

export function getDirectoryRequirements(me: MeApiUser): DirectoryRequirement[] {
  const hasName = Boolean(me.firstName?.trim() || me.lastName?.trim());
  const hasJob = Boolean(me.jobTitle?.trim());
  const hasLocation = Boolean(me.city?.trim() || me.quartier?.trim());

  return [
    {
      id: 'active',
      label: 'Compte actif',
      met: me.status === 'active',
    },
    {
      id: 'not-blocked',
      label: 'Compte non bloqué',
      met: me.isBlocked !== true,
    },
    {
      id: 'directory-visible',
      label: 'Profil visible dans l’annuaire',
      met: Boolean(me.directoryVisible),
    },
    {
      id: 'profile',
      label: 'Profil renseigné (nom, poste, ville)',
      met: hasName && hasJob && hasLocation,
    },
  ];
}

export function canAppearInDirectory(me: MeApiUser): boolean {
  return getDirectoryRequirements(me).every((item) => item.met);
}
