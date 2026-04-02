export type UserRole = 'reception' | 'doctor';

export const ROLE_COOKIE_NAME = 'swasthsetu-role';
export const DOCTOR_ID_COOKIE_NAME = 'swasthsetu-doctor-id';
export const DOCTOR_SESSION_COOKIE_NAME = 'swasthsetu-doctor-session';
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

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const all = document.cookie
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const matched = all.find((segment) => segment.startsWith(`${name}=`));
  if (!matched) return null;

  const raw = matched.slice(name.length + 1);
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function getDoctorCookie(): string | null {
  return readCookie(DOCTOR_ID_COOKIE_NAME);
}
