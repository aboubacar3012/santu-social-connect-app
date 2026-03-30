export type IdentityVerificationStatusApi = 'pending' | 'approved' | 'rejected';
export type IdentityUiKind = 'approved' | 'pending_review' | 'pending_missing' | 'rejected';
export type ProfileIdentityStatus = 'pending' | 'approved' | 'rejected' | null | undefined;

/** Réponse typique de `GET /users/me` (sérialisation JSON Prisma). */
export type MeApiUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string;
  email?: string | null;
  emailVerified?: boolean;
  phoneE164?: string | null;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  identityVerificationStatus?: IdentityVerificationStatusApi | null;
  rejectedAt?: string | null;
  profilePicture?: string | null;
  identityVerificationDocumentFront?: string | null;
  identityVerificationDocumentBack?: string | null;
  identityVerificationDocumentSelfie?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  vehiclePlateNumber?: string | null;
};

export type ProfileViewUserLike = {
  firstName?: string | null;
  lastName?: string | null;
  phoneE164?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  vehiclePlateNumber?: string | null;
  identityVerified?: boolean;
  identityVerificationStatus?: ProfileIdentityStatus;
  rejectedAt?: string | null;
  identityVerificationDocumentFront?: string | null;
  identityVerificationDocumentBack?: string | null;
  identityVerificationDocumentSelfie?: string | null;
};

export type BirthDateParts = { d: string; m: string; y: string };

export type PresignResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
  contentType: string;
};
