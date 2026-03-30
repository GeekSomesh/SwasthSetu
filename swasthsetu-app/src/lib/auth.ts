export type UserRole = 'reception' | 'doctor';

export const ROLE_COOKIE_NAME = 'swasthsetu-role';
export const ROLE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

export const ROLE_HOME: Record<UserRole, string> = {
  reception: '/reception',
  doctor: '/doctor',
};

export function isUserRole(value: string | undefined | null): value is UserRole {
  return value === 'reception' || value === 'doctor';
}

export function persistRoleCookie(role: UserRole) {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; Path=/; Max-Age=${ROLE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

