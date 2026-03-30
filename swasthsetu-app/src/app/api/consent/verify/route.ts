import { NextRequest, NextResponse } from 'next/server';
import { verifyConsentStore } from '@/lib/server-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, otp } = body;

  if (!patientId || !otp) {
    return NextResponse.json(
      { error: 'patientId and otp are required' },
      { status: 400 }
    );
  }

  const consent = await verifyConsentStore(patientId, otp);

  if (!consent) {
    return NextResponse.json(
      { error: 'Invalid OTP or no pending consent request' },
      { status: 401 }
    );
  }

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
