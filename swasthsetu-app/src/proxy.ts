import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  DOCTOR_ID_COOKIE_NAME,
  DOCTOR_SESSION_COOKIE_NAME,
  isUserRole,
  ROLE_COOKIE_NAME,
  ROLE_HOME,
  type UserRole,
} from '@/lib/auth';
import { verifyDoctorSessionToken } from '@/lib/doctor-session';

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

function redirectToRoleHome(request: NextRequest, role: UserRole) {
  return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieRole = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const role = isUserRole(cookieRole) ? cookieRole : null;

  if (pathname.startsWith('/reception')) {
    if (!role) return redirectToLogin(request);
    if (role !== 'reception') return redirectToRoleHome(request, role);
  }

  if (pathname.startsWith('/doctor')) {
    if (!role) return redirectToLogin(request);
    if (role !== 'doctor') return redirectToRoleHome(request, role);
    const doctorId = request.cookies.get(DOCTOR_ID_COOKIE_NAME)?.value;
    const sessionToken = request.cookies.get(DOCTOR_SESSION_COOKIE_NAME)?.value;
    if (!doctorId || !sessionToken) return redirectToLogin(request);
    if (!verifyDoctorSessionToken(sessionToken, doctorId)) return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reception/:path*', '/doctor/:path*'],
};
