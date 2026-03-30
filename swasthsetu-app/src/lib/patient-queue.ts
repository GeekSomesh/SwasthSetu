export type QueueStatus = 'Waiting' | 'UnderDiagnosis';

export interface QueuePatientEntry {
  patientId: string;
  status: QueueStatus;
  tokenNumber: number;
  checkedInAt: string;
  diagnosisStartedAt: string | null;
  updatedAt: string;
  doctorId: string;
}

export interface CompletedConsultationEntry {
  patientId: string;
  tokenNumber: number;
  checkedInAt: string;
  diagnosisStartedAt: string | null;
  completedAt: string;
  doctorId: string;
}

export interface PatientQueueStore {
  queue: QueuePatientEntry[];
  completed: CompletedConsultationEntry[];
  lastTokenNumber: number;
}

const STORAGE_KEY = 'swasthsetu-patient-queue-v2';
const CHANGE_EVENT = 'swasthsetu-patient-queue:changed';
const DEFAULT_DOCTOR_ID = 'doc-001';

function createEmptyStore(): PatientQueueStore {
  return { queue: [], completed: [], lastTokenNumber: 0 };
}

function isQueueStatus(value: unknown): value is QueueStatus {
  return value === 'Waiting' || value === 'UnderDiagnosis';
}

function normalizeStore(value: unknown): PatientQueueStore {
  if (!value || typeof value !== 'object') return createEmptyStore();

  const raw = value as {
    queue?: unknown;
    completed?: unknown;
    lastTokenNumber?: unknown;
  };

  let fallbackTokenCounter = 0;

  const queue = Array.isArray(raw.queue)
    ? raw.queue.reduce<QueuePatientEntry[]>((acc, entry) => {
        if (!entry || typeof entry !== 'object') return acc;
        const item = entry as Partial<QueuePatientEntry>;

        if (
          typeof item.patientId !== 'string' ||
          !isQueueStatus(item.status) ||
          typeof item.checkedInAt !== 'string' ||
          typeof item.updatedAt !== 'string' ||
          typeof item.doctorId !== 'string'
        ) {
          return acc;
        }

        fallbackTokenCounter += 1;
        const tokenNumber =
          typeof item.tokenNumber === 'number' && Number.isFinite(item.tokenNumber)
            ? item.tokenNumber
            : fallbackTokenCounter;

        acc.push({
          patientId: item.patientId,
          status: item.status,
          tokenNumber,
          checkedInAt: item.checkedInAt,
          diagnosisStartedAt:
            typeof item.diagnosisStartedAt === 'string' ? item.diagnosisStartedAt : null,
          updatedAt: item.updatedAt,
          doctorId: item.doctorId,
        });
        return acc;
      }, [])
    : [];

  const completed = Array.isArray(raw.completed)
    ? raw.completed.reduce<CompletedConsultationEntry[]>((acc, entry) => {
        if (!entry || typeof entry !== 'object') return acc;
        const item = entry as Partial<CompletedConsultationEntry>;
        if (
          typeof item.patientId !== 'string' ||
          typeof item.completedAt !== 'string' ||
          typeof item.doctorId !== 'string'
        ) {
          return acc;
        }

        fallbackTokenCounter += 1;
        const tokenNumber =
          typeof item.tokenNumber === 'number' && Number.isFinite(item.tokenNumber)
            ? item.tokenNumber
            : fallbackTokenCounter;

        const checkedInAt =
          typeof item.checkedInAt === 'string' ? item.checkedInAt : item.completedAt;

        acc.push({
          patientId: item.patientId,
          tokenNumber,
          checkedInAt,
          diagnosisStartedAt:
            typeof item.diagnosisStartedAt === 'string' ? item.diagnosisStartedAt : null,
          completedAt: item.completedAt,
          doctorId: item.doctorId,
        });

        return acc;
      }, [])
    : [];

  const inferredMaxToken = [...queue, ...completed].reduce(
    (max, item) => Math.max(max, item.tokenNumber),
    0
  );

  const lastTokenNumber =
    typeof raw.lastTokenNumber === 'number' && Number.isFinite(raw.lastTokenNumber)
      ? Math.max(raw.lastTokenNumber, inferredMaxToken)
      : inferredMaxToken;

  return { queue, completed, lastTokenNumber };
}

function readStore(): PatientQueueStore {
  if (typeof window === 'undefined') return createEmptyStore();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyStore();

  try {
    const parsed: unknown = JSON.parse(raw);
    return normalizeStore(parsed);
  } catch {
    return createEmptyStore();
  }
}

function writeStore(next: PatientQueueStore): PatientQueueStore {
  if (typeof window === 'undefined') return next;

  const safe = normalizeStore(next);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  return safe;
}

function updateStore(updater: (current: PatientQueueStore) => PatientQueueStore): PatientQueueStore {
  const current = readStore();
  const next = normalizeStore(updater(current));
  return writeStore(next);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPatientQueueStore(): PatientQueueStore {
  return readStore();
}

export function subscribeToPatientQueue(listener: (store: PatientQueueStore) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const notify = () => listener(readStore());

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) notify();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, notify as EventListener);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, notify as EventListener);
  };
}

export function enqueuePatient(patientId: string, doctorId = DEFAULT_DOCTOR_ID): PatientQueueStore {
  return updateStore((store) => {
    const timestamp = nowIso();
    const existing = store.queue.find((item) => item.patientId === patientId);
    const queueWithoutPatient = store.queue.filter((item) => item.patientId !== patientId);
    const nextTokenNumber = existing ? existing.tokenNumber : store.lastTokenNumber + 1;

    const nextEntry: QueuePatientEntry = {
      patientId,
      status: 'Waiting',
      tokenNumber: nextTokenNumber,
      checkedInAt: timestamp,
      diagnosisStartedAt: null,
      updatedAt: timestamp,
      doctorId: existing?.doctorId ?? doctorId,
    };

    return {
      ...store,
      queue: [...queueWithoutPatient, nextEntry],
      lastTokenNumber: Math.max(store.lastTokenNumber, nextTokenNumber),
    };
  });
}

export function markPatientUnderDiagnosis(patientId: string, doctorId = DEFAULT_DOCTOR_ID): boolean {
  let changed = false;

  updateStore((store) => {
    const timestamp = nowIso();

    const queue = store.queue.map((item) => {
      if (item.patientId !== patientId) return item;
      if (item.status === 'UnderDiagnosis') return item;
      changed = true;
      return {
        ...item,
        status: 'UnderDiagnosis' as QueueStatus,
        diagnosisStartedAt: item.diagnosisStartedAt ?? timestamp,
        doctorId: doctorId || item.doctorId,
        updatedAt: timestamp,
      };
    });

    return changed ? { ...store, queue } : store;
  });

  return changed;
}

export function markPatientDiagnosed(patientId: string, doctorId = DEFAULT_DOCTOR_ID): boolean {
  let changed = false;

  updateStore((store) => {
    const queueEntry = store.queue.find((item) => item.patientId === patientId);
    if (!queueEntry) return store;

    changed = true;
    const completedAt = nowIso();

    return {
      queue: store.queue.filter((item) => item.patientId !== patientId),
      completed: [
        ...store.completed,
        {
          patientId,
          tokenNumber: queueEntry.tokenNumber,
          checkedInAt: queueEntry.checkedInAt,
          diagnosisStartedAt: queueEntry.diagnosisStartedAt,
          completedAt,
          doctorId: queueEntry.doctorId || doctorId,
        },
      ],
      lastTokenNumber: Math.max(store.lastTokenNumber, queueEntry.tokenNumber),
    };
  });

  return changed;
}

export function getPatientQueueStatus(patientId: string): QueueStatus | null {
  const queueEntry = readStore().queue.find((item) => item.patientId === patientId);
  return queueEntry?.status ?? null;
}
