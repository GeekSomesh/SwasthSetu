import { NextRequest, NextResponse } from 'next/server';
import { type RecordType } from '@/data/mock-data';
import { createMedicalRecordStore } from '@/lib/server-data';

const VALID_RECORD_TYPES: RecordType[] = [
  'Prescription',
  'LabReport',
  'Scan',
  'DischargeSummary',
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, facilityId, doctorId, recordType, title, notes, diagnosis, medications } = body;

  if (!patientId || !facilityId || !doctorId || !recordType || !title) {
    return NextResponse.json(
      { error: 'patientId, facilityId, doctorId, recordType, and title are required' },
      { status: 400 }
    );
  }

  if (!VALID_RECORD_TYPES.includes(recordType as RecordType)) {
    return NextResponse.json(
      { error: 'Invalid recordType. Must be Prescription, LabReport, Scan, or DischargeSummary.' },
      { status: 400 }
    );
  }

  const parsedMedications = Array.isArray(medications)
    ? medications.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;

  const newRecord = await createMedicalRecordStore({
    patientId,
    facilityId,
    doctorId,
    recordType: recordType as RecordType,
    title,
    notes: typeof notes === 'string' ? notes : '',
    diagnosis: typeof diagnosis === 'string' ? diagnosis : undefined,
    medications: parsedMedications,
  });

  return NextResponse.json({
    message: 'Record uploaded and synced successfully',
    record: newRecord,
  });
}
