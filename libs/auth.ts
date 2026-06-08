import type { AuthUser } from '@/contexts/auth-context';

export function isUserAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin';
}
