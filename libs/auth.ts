import type { AuthUser } from '@/contexts/auth-context';

export function isUserAdmin(user: AuthUser | null | undefined): boolean {
  console.log('user', user);
  return user?.role === 'admin';
}
