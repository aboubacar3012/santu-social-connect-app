import type {
  IdentityUiKind,
  ProfileViewUserLike,
} from '@/types/profile';

export function getProfileDisplayName(u: ProfileViewUserLike): string {
  const a = u.firstName?.trim();
  const b = u.lastName?.trim();
  if (a && b) return `${a} ${b}`;
  if (a) return a;
  if (b) return b;
  const p = u.phoneE164?.trim();
  if (p) return p;
  return 'Profil';
}

export function getProfileInitials(u: ProfileViewUserLike): string {
  const a = u.firstName?.trim()?.[0];
  const b = u.lastName?.trim()?.[0];
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase().slice(0, 2);
  const digits = u.phoneE164?.replace(/\D/g, '') ?? '';
  if (digits.length >= 2) return digits.slice(-2);
  return '?';
}

export function formatProfileBirthLine(iso?: string | null): string {
  if (!iso) return 'Date de naissance non renseignée';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date de naissance non renseignée';
  return `Né(e) le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

export function formatProfileMemberLine(iso?: string | null): string {
  if (!iso) return 'Date d’inscription indisponible';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date d’inscription indisponible';
  return `Membre depuis ${d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
}

export function formatProfileVehicleTitle(u: ProfileViewUserLike): string {
  const brand = u.vehicleBrand?.trim();
  const model = u.vehicleModel?.trim();
  if (brand && model) return `${brand} · ${model}`;
  if (brand) return brand;
  if (model) return model;
  return 'Véhicule non renseigné';
}

export function formatProfilePlate(u: ProfileViewUserLike): string {
  const p = u.vehiclePlateNumber?.trim();
  return p ? `Immat. ${p}` : 'Immatriculation non renseignée';
}

export function hasAnyIdentityDocuments(u: ProfileViewUserLike | null | undefined): boolean {
  if (!u) return false;
  return Boolean(
    u.identityVerificationDocumentFront?.trim() ||
      u.identityVerificationDocumentBack?.trim() ||
      u.identityVerificationDocumentSelfie?.trim(),
  );
}

export function getIdentityVerificationPresentation(me: ProfileViewUserLike | null): {
  kind: IdentityUiKind;
  headline: string;
  detail: string;
  badge: string;
} {
  const status = me?.identityVerificationStatus ?? 'pending';

  if (status === 'rejected') {
    const dateStr = me?.rejectedAt
      ? new Date(me.rejectedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      : null;
    return {
      kind: 'rejected',
      headline: 'Pièce d’identité refusée',
      detail: dateStr
        ? `Refusée le ${dateStr}. Soumettez de nouveaux documents depuis « Modifier le profil ».`
        : 'Votre demande a été refusée. Mettez à jour vos documents depuis « Modifier le profil ».',
      badge: 'Refusé',
    };
  }

  if (status === 'approved' || me?.identityVerified) {
    return {
      kind: 'approved',
      headline: 'Identité vérifiée',
      detail:
        'Votre pièce d’identité a été acceptée. Les passagers voient que votre profil est vérifié.',
      badge: 'Vérifié',
    };
  }

  const hasDocs = hasAnyIdentityDocuments(me);
  if (!hasDocs) {
    return {
      kind: 'pending_missing',
      headline: 'Pièce d’identité',
      detail:
        'Ajoutez le recto, le verso et un selfie pour lancer la vérification.',
      badge: 'À compléter',
    };
  }

  return {
    kind: 'pending_review',
    headline: 'Vérification en cours',
    detail:
      'Nous examinons vos documents. Vous serez informé·e lorsque la décision sera prise.',
    badge: 'En examen',
  };
}
