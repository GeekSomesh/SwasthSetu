import { NextRequest, NextResponse } from 'next/server';
import { getDoctorById } from '@/data/mock-data';
import {
  DOCTOR_ID_COOKIE_NAME,
  DOCTOR_SESSION_COOKIE_NAME,
  ROLE_COOKIE_MAX_AGE_SECONDS,
  ROLE_COOKIE_NAME,
} from '@/lib/auth';
import { verifyDoctorPin } from '@/lib/doctor-credentials';
import { createDoctorSessionToken } from '@/lib/doctor-session';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const doctorId = typeof body?.doctorId === 'string' ? body.doctorId.trim() : '';
  const department = typeof body?.department === 'string' ? body.department.trim() : '';
  const passcode = typeof body?.passcode === 'string' ? body.passcode.trim() : '';

  if (!doctorId || !department || !passcode) {
    return NextResponse.json(
      { error: 'doctorId, department, and passcode are required' },
      { status: 400 }
    );
  }

  const doctor = getDoctorById(doctorId);
  if (!doctor) {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  }

  if (doctor.specialty !== department) {
    return NextResponse.json(
      { error: 'Department does not match selected doctor' },
      { status: 403 }
    );
  }

  if (!verifyDoctorPin(doctorId, passcode)) {
    return NextResponse.json({ error: 'Invalid doctor passcode' }, { status: 401 });
  }

  const response = NextResponse.json({
    message: 'Doctor authentication successful',
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
    },
  });

  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set(ROLE_COOKIE_NAME, 'doctor', {
    path: '/',
    maxAge: ROLE_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure,
  });

  response.cookies.set(DOCTOR_ID_COOKIE_NAME, doctor.id, {
    path: '/',
    maxAge: ROLE_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure,
  });

  response.cookies.set(DOCTOR_SESSION_COOKIE_NAME, createDoctorSessionToken(doctor.id), {
    path: '/',
    maxAge: ROLE_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure,
    httpOnly: true,
  });

  return response;
}

