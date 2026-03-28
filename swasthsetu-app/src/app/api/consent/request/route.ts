import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, getPatientById, consents } from '@/data/mock-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, facilityId } = body;

  if (!patientId || !facilityId) {
    return NextResponse.json(
      { error: 'patientId and facilityId are required' },
      { status: 400 }
    );
  }

  const patient = getPatientById(patientId);
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const otp = generateOTP();

  // Store consent as Pending
  consents.push({
    id: `consent-${Date.now()}`,
    patient_id: patientId,
    facility_id: facilityId,
    status: 'Pending',
    otp,
    granted_at: null,
    expires_at: null,
  });

  // In production, this would send an actual SMS
  return NextResponse.json({
    message: `OTP sent to +91 ${patient.mobile_number}`,
    otp_hint: otp, // Only for demo purposes
  });
}
