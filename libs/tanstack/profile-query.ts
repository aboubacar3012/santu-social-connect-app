import { getMeApi } from '@/services/profile.service';
import type { MeApiUser } from '@/types/profile';

export const profileQueryKeys = {
  all: ['profile'] as const,
  me: (userId?: string | null) => [...profileQueryKeys.all, 'me', userId ?? 'anonymous'] as const,
};

export async function fetchProfileMe(token: string): Promise<MeApiUser> {
  const { user } = await getMeApi(token);
  return user;
}
