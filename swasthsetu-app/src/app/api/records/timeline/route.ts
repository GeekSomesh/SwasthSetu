import { NextRequest, NextResponse } from 'next/server';
import {
  getRecordsByPatientId,
  getFacilityById,
  getDoctorById,
} from '@/data/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json(
      { error: 'patientId query parameter is required' },
      { status: 400 }
    );
  }

  const records = getRecordsByPatientId(patientId);

  // Enrich records with facility and doctor details
  const enrichedRecords = records.map((record) => ({
    ...record,
    facility: getFacilityById(record.facility_id),
    doctor: getDoctorById(record.doctor_id),
  }));

  return NextResponse.json({
    count: enrichedRecords.length,
    records: enrichedRecords,
  });
}
