import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isUserRole, ROLE_COOKIE_NAME, ROLE_HOME, type UserRole } from '@/lib/auth';

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reception/:path*', '/doctor/:path*'],
};
