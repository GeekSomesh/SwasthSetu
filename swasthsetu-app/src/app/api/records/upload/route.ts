import { NextRequest, NextResponse } from 'next/server';
import { medicalRecords } from '@/data/mock-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, facilityId, doctorId, recordType, title, notes, diagnosis, medications } = body;

  if (!patientId || !facilityId || !doctorId || !recordType || !title) {
    return NextResponse.json(
      { error: 'patientId, facilityId, doctorId, recordType, and title are required' },
      { status: 400 }
    );
  }

  const newRecord = {
    id: `rec-${Date.now()}`,
    patient_id: patientId,
    facility_id: facilityId,
    doctor_id: doctorId,
    record_type: recordType,
    date: new Date().toISOString().split('T')[0],
    title,
    document_url: '/mock/new-visit.png',
    notes: notes || '',
    diagnosis: diagnosis || undefined,
    medications: medications || undefined,
  };

  // Add to in-memory store
  medicalRecords.push(newRecord);

  return NextResponse.json({
    message: 'Record uploaded and synced successfully',
    record: newRecord,
  });
}
