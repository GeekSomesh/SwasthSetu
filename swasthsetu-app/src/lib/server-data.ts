import {
  consents,
  doctors,
  facilities,
  generateOTP,
  getDoctorById,
  getFacilityById,
  getPatientById,
  getPatientByMobile,
  getRecordsByPatientId,
  medicalRecords,
  patients,
  type Consent,
  type Doctor,
  type Facility,
  type MedicalRecord,
  type Patient,
  type RecordType,
} from '@/data/mock-data';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';

type MongoDoc<T> = T & { _id?: unknown };

function stripMongoId<T>(doc: MongoDoc<T> | null): T | null {
  if (!doc) return null;
  const record = doc as MongoDoc<T> & Record<string, unknown>;
  const rest = { ...record };
  delete rest._id;
  return rest as unknown as T;
}

function stripMongoIds<T>(docs: MongoDoc<T>[]): T[] {
  return docs
    .map((doc) => stripMongoId(doc))
    .filter((doc): doc is T => Boolean(doc));
}

let baselineSeedPromise: Promise<void> | null = null;

async function ensureMongoBaselineData(): Promise<void> {
  if (!isMongoConfigured()) return;

  if (!baselineSeedPromise) {
    baselineSeedPromise = (async () => {
      const db = await getMongoDb();
      const patientsCollection = db.collection<Patient>('patients');
      const hasPatients = await patientsCollection.estimatedDocumentCount();

      if (hasPatients > 0) return;

      if (patients.length > 0) await patientsCollection.insertMany(patients);
      if (facilities.length > 0) await db.collection<Facility>('facilities').insertMany(facilities);
      if (doctors.length > 0) await db.collection<Doctor>('doctors').insertMany(doctors);
      if (medicalRecords.length > 0) {
        await db.collection<MedicalRecord>('medical_records').insertMany(medicalRecords);
      }
      if (consents.length > 0) await db.collection<Consent>('consents').insertMany(consents);

      await Promise.all([
        patientsCollection.createIndex({ id: 1 }, { unique: true }),
        patientsCollection.createIndex({ mobile_number: 1 }, { unique: true }),
        db.collection<MedicalRecord>('medical_records').createIndex({ id: 1 }, { unique: true }),
        db.collection<MedicalRecord>('medical_records').createIndex({ patient_id: 1, date: -1 }),
        db.collection<Consent>('consents').createIndex({ id: 1 }, { unique: true }),
      ]);
    })().catch((error) => {
      baselineSeedPromise = null;
      throw error;
    });
  }

  await baselineSeedPromise;
}

async function withMongoFallback<T>(
  mongoOp: () => Promise<T>,
  fallbackOp: () => T
): Promise<T> {
  if (!isMongoConfigured()) return fallbackOp();

  try {
    await ensureMongoBaselineData();
    return await mongoOp();
  } catch (error) {
    console.error('MongoDB operation failed, falling back to in-memory data.', error);
    return fallbackOp();
  }
}

export async function findPatientByMobileStore(mobile: string): Promise<Patient | null> {
  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      const doc = await db
        .collection<Patient>('patients')
        .findOne({ mobile_number: mobile });
      return stripMongoId(doc as MongoDoc<Patient> | null);
    },
    () => getPatientByMobile(mobile) ?? null
  );
}

export async function findPatientByIdStore(id: string): Promise<Patient | null> {
  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      const doc = await db.collection<Patient>('patients').findOne({ id });
      return stripMongoId(doc as MongoDoc<Patient> | null);
    },
    () => getPatientById(id) ?? null
  );
}

export async function getRecordsByPatientIdStore(patientId: string): Promise<MedicalRecord[]> {
  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      const docs = await db
        .collection<MedicalRecord>('medical_records')
        .find({ patient_id: patientId })
        .sort({ date: -1 })
        .toArray();
      return stripMongoIds(docs as MongoDoc<MedicalRecord>[]);
    },
    () => getRecordsByPatientId(patientId)
  );
}

export async function getEnrichedRecordsByPatientIdStore(patientId: string): Promise<
  Array<MedicalRecord & { facility?: Facility; doctor?: Doctor }>
> {
  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      const recordDocs = await db
        .collection<MedicalRecord>('medical_records')
        .find({ patient_id: patientId })
        .sort({ date: -1 })
        .toArray();
      const records = stripMongoIds(recordDocs as MongoDoc<MedicalRecord>[]);
      const facilityIds = [...new Set(records.map((record) => record.facility_id))];
      const doctorIds = [...new Set(records.map((record) => record.doctor_id))];

      const [facilityDocs, doctorDocs] = await Promise.all([
        facilityIds.length > 0
          ? db
              .collection<Facility>('facilities')
              .find({ id: { $in: facilityIds } })
              .toArray()
          : Promise.resolve([]),
        doctorIds.length > 0
          ? db
              .collection<Doctor>('doctors')
              .find({ id: { $in: doctorIds } })
              .toArray()
          : Promise.resolve([]),
      ]);

      const facilityById = new Map(
        stripMongoIds(facilityDocs as MongoDoc<Facility>[]).map((facility) => [facility.id, facility])
      );
      const doctorById = new Map(
        stripMongoIds(doctorDocs as MongoDoc<Doctor>[]).map((doctor) => [doctor.id, doctor])
      );

      return records.map((record) => ({
        ...record,
        facility: facilityById.get(record.facility_id),
        doctor: doctorById.get(record.doctor_id),
      }));
    },
    () => {
      const records = getRecordsByPatientId(patientId);
      return records.map((record) => ({
        ...record,
        facility: getFacilityById(record.facility_id),
        doctor: getDoctorById(record.doctor_id),
      }));
    }
  );
}

type CreateRecordInput = {
  patientId: string;
  facilityId: string;
  doctorId: string;
  recordType: RecordType;
  title: string;
  notes?: string;
  diagnosis?: string;
  medications?: string[];
  documentUrl?: string;
};

export async function createMedicalRecordStore(input: CreateRecordInput): Promise<MedicalRecord> {
  const newRecord: MedicalRecord = {
    id: `rec-${Date.now()}`,
    patient_id: input.patientId,
    facility_id: input.facilityId,
    doctor_id: input.doctorId,
    record_type: input.recordType,
    date: new Date().toISOString(),
    title: input.title,
    document_url: input.documentUrl ?? '/mock/new-visit.png',
    notes: input.notes ?? '',
    diagnosis: input.diagnosis || undefined,
    medications: input.medications && input.medications.length > 0 ? input.medications : undefined,
  };

  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      await db.collection<MedicalRecord>('medical_records').insertOne(newRecord);
      return newRecord;
    },
    () => {
      medicalRecords.push(newRecord);
      return newRecord;
    }
  );
}

export async function createConsentRequestStore(
  patientId: string,
  facilityId: string
): Promise<{ consent: Consent; otp: string }> {
  const otp = generateOTP();
  const consent: Consent = {
    id: `consent-${Date.now()}`,
    patient_id: patientId,
    facility_id: facilityId,
    status: 'Pending',
    otp,
    granted_at: null,
    expires_at: null,
  };

  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      await db.collection<Consent>('consents').insertOne(consent);
      return { consent, otp };
    },
    () => {
      consents.push(consent);
      return { consent, otp };
    }
  );
}

export async function verifyConsentStore(patientId: string, otp: string): Promise<Consent | null> {
  return withMongoFallback(
    async () => {
      const db = await getMongoDb();
      const consentCollection = db.collection<Consent>('consents');
      const pending = await consentCollection.findOne({
        patient_id: patientId,
        otp,
        status: 'Pending',
      });

      const pendingConsent = stripMongoId(pending as MongoDoc<Consent> | null);
      if (!pendingConsent) return null;

      const grantedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await consentCollection.updateOne(
        { id: pendingConsent.id },
        {
          $set: {
            status: 'Granted',
            granted_at: grantedAt,
            expires_at: expiresAt,
          },
        }
      );

      return {
        ...pendingConsent,
        status: 'Granted',
        granted_at: grantedAt,
        expires_at: expiresAt,
      };
    },
    () => {
      const consent = consents.find(
        (item) => item.patient_id === patientId && item.otp === otp && item.status === 'Pending'
      );
      if (!consent) return null;

      consent.status = 'Granted';
      consent.granted_at = new Date().toISOString();
      consent.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      return consent;
    }
  );
}
