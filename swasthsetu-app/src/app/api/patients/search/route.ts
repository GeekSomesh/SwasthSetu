import { NextRequest, NextResponse } from 'next/server';
import { findPatientByMobileStore } from '@/lib/server-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mobile } = body;

  if (!mobile || mobile.length < 10) {
    return NextResponse.json(
      { error: 'Please provide a valid 10-digit mobile number' },
      { status: 400 }
    );
  }

  const patient = await findPatientByMobileStore(mobile);

  if (!patient) {
    return NextResponse.json(
      { error: 'No patient found with this mobile number' },
      { status: 404 }
    );
  }

  return NextResponse.json({ patient });
}
