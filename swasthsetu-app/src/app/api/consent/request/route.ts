import { NextRequest, NextResponse } from 'next/server';
import { createConsentRequestStore, findPatientByIdStore } from '@/lib/server-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, facilityId } = body;

  if (!patientId || !facilityId) {
    return NextResponse.json(
      { error: 'patientId and facilityId are required' },
      { status: 400 }
    );
  }

  const patient = await findPatientByIdStore(patientId);
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const { otp } = await createConsentRequestStore(patientId, facilityId);

  // In production, this would send an actual SMS
  return NextResponse.json({
    message: `OTP sent to +91 ${patient.mobile_number}`,
    otp_hint: otp, // Only for demo purposes
  });
}
