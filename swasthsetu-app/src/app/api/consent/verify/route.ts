import { NextRequest, NextResponse } from 'next/server';
import { consents } from '@/data/mock-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, otp } = body;

  if (!patientId || !otp) {
    return NextResponse.json(
      { error: 'patientId and otp are required' },
      { status: 400 }
    );
  }

  const consent = consents.find(
    (c) => c.patient_id === patientId && c.otp === otp && c.status === 'Pending'
  );

  if (!consent) {
    return NextResponse.json(
      { error: 'Invalid OTP or no pending consent request' },
      { status: 401 }
    );
  }

  // Grant consent for 24 hours
  consent.status = 'Granted';
  consent.granted_at = new Date().toISOString();
  consent.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    message: 'Consent granted successfully',
    consent: {
      id: consent.id,
      status: consent.status,
      granted_at: consent.granted_at,
      expires_at: consent.expires_at,
    },
  });
}
