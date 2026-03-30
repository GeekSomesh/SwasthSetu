import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedRecordsByPatientIdStore } from '@/lib/server-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json(
      { error: 'patientId query parameter is required' },
      { status: 400 }
    );
  }

  const enrichedRecords = await getEnrichedRecordsByPatientIdStore(patientId);

  return NextResponse.json({
    count: enrichedRecords.length,
    records: enrichedRecords,
  });
}
