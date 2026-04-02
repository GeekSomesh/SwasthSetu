import { NextResponse } from 'next/server';
import { DOCTOR_ID_COOKIE_NAME, DOCTOR_SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Doctor session cleared' });

  response.cookies.set(DOCTOR_ID_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  response.cookies.set(DOCTOR_SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
  });

  return response;
}

