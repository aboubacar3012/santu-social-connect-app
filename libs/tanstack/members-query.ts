import { listMembersApi } from '@/services/member-list.service';
import type { Member } from '@/types/member';

export const membersQueryKeys = {
  all: ['members'] as const,
  list: () => [...membersQueryKeys.all, 'list'] as const,
};

export async function fetchMembersList(): Promise<Member[]> {
  const { members } = await listMembersApi();
  return members;
}
