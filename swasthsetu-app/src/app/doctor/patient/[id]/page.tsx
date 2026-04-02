'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  FileText,
  FlaskConical,
  ScanLine,
  ClipboardList,
  Filter,
  X,
  Eye,
  Plus,
  Send,
  Activity,
  Building2,
  User,
  Pill,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import {
  getPatientById,
  getAge,
  getFacilityById,
  getDoctorById,
  type MedicalRecord,
  type RecordType,
} from '@/data/mock-data';
import {
  getPatientQueueStore,
  markPatientDiagnosed,
  markPatientUnderDiagnosis,
  subscribeToPatientQueue,
  type QueueStatus,
} from '@/lib/patient-queue';
import { getDoctorCookie } from '@/lib/auth';

const recordTypeConfig: Record<
  RecordType,
  { icon: typeof FileText; label: string; bgColor: string; textColor: string; emoji: string }
> = {
  Prescription: {
    icon: Pill,
    label: 'Prescription',
    bgColor: '#fff1e8',
    textColor: '#f1662a',
    emoji: 'Rx',
  },
  LabReport: {
    icon: FlaskConical,
    label: 'Lab Report',
    bgColor: '#f8f1ea',
    textColor: '#c58145',
    emoji: 'Lab',
  },
  Scan: {
    icon: ScanLine,
    label: 'Scan / Imaging',
    bgColor: '#f8f1ea',
    textColor: '#ac7447',
    emoji: 'Scan',
  },
  DischargeSummary: {
    icon: ClipboardList,
    label: 'Discharge Summary',
    bgColor: '#f8f1ea',
    textColor: '#8f6d54',
    emoji: 'Disc',
  },
};

const queueStatusConfig: Record<
  QueueStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  Waiting: {
    label: 'Pending Review',
    bgColor: '#fff8ed',
    textColor: '#a06b36',
  },
  UnderDiagnosis: {
    label: 'Under Diagnosis',
    bgColor: '#fff1e8',
    textColor: '#f1662a',
  },
};

const THEME_ICON_ACCENT = '#f1662a';
const THEME_ICON_MUTED = '#9c8f84';
const THEME_ICON_SOFT_BG = '#f8f1ea';
const THEME_ICON_SOFT_BORDER = '#ffe7da';
const THEME_PRIMARY_GRADIENT = 'linear-gradient(145deg, #f1662a, #dc5c24)';
const THEME_AVATAR_GRADIENT = 'linear-gradient(145deg, #f1662a, #e7672f)';

type PrescriptionTemplate = {
  id: string;
  label: string;
  diagnosis: string;
  medications: string[];
  notes: string;
  followUpDays: number;
};

const prescriptionTemplates: PrescriptionTemplate[] = [
  {
    id: 'viral-fever',
    label: 'Viral Fever',
    diagnosis: 'Acute Viral Febrile Illness',
    medications: [
      'Paracetamol 650mg SOS for fever',
      'Cetirizine 10mg at bedtime for 3 days',
      'ORS 200ml after each loose stool',
    ],
    notes: 'Hydration advised. Red-flag symptoms explained: persistent fever >3 days, breathlessness, vomiting.',
    followUpDays: 3,
  },
  {
    id: 'hypertension-followup',
    label: 'Hypertension Follow-up',
    diagnosis: 'Essential Hypertension - Follow-up',
    medications: [
      'Amlodipine 5mg once daily',
      'Telmisartan 40mg once daily',
      'Low-salt diet and 30 min walk daily',
    ],
    notes: 'BP charting advised twice daily for 7 days. Avoid excess salt and OTC painkillers.',
    followUpDays: 14,
  },
  {
    id: 'diabetes-followup',
    label: 'Diabetes Follow-up',
    diagnosis: 'Type 2 Diabetes Mellitus - Routine Review',
    medications: [
      'Metformin 500mg twice daily after meals',
      'Glimepiride 1mg once daily before breakfast',
      'Foot care and daily glucose monitoring',
    ],
    notes: 'Diet counseling provided. Watch for hypoglycemia signs and maintain sugar logbook.',
    followUpDays: 15,
  },
  {
    id: 'gastritis-acidity',
    label: 'Gastritis / Acidity',
    diagnosis: 'Acid Peptic Disease / Gastritis',
    medications: [
      'Pantoprazole 40mg once daily before breakfast',
      'Antacid syrup 10ml TDS after meals',
      'Domperidone 10mg SOS for nausea',
    ],
    notes: 'Avoid spicy/oily food, tea/coffee excess, and late-night meals.',
    followUpDays: 7,
  },
];

export default function PatientTimelinePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const patient = getPatientById(patientId);
  const startInNewVisitMode = searchParams.get('newVisit') === '1';

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<RecordType | 'All'>('All');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showNewVisit, setShowNewVisit] = useState(startInNewVisitMode);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newVisitData, setNewVisitData] = useState({
    diagnosis: '',
    medications: '',
    notes: '',
    followUp: '',
  });
  const [queueStore, setQueueStore] = useState(() => getPatientQueueStore());
  const queryDoctorId = searchParams.get('doctorId');
  const cookieDoctorId = getDoctorCookie();
  const fallbackDoctorId = 'doc-001';
  const activeDoctorId =
    queryDoctorId && getDoctorById(queryDoctorId)
      ? queryDoctorId
      : cookieDoctorId && getDoctorById(cookieDoctorId)
        ? cookieDoctorId
        : fallbackDoctorId;
  const activeDoctor = getDoctorById(activeDoctorId);

  useEffect(() => {
    const unsubscribe = subscribeToPatientQueue((nextStore) => {
      setQueueStore(nextStore);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    markPatientUnderDiagnosis(patientId, activeDoctorId);
  }, [activeDoctorId, patientId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTimeline() {
      try {
        const response = await fetch(`/api/records/timeline?patientId=${encodeURIComponent(patientId)}`);
        if (!response.ok) {
          throw new Error(`Timeline fetch failed with status ${response.status}`);
        }

        const payload = (await response.json()) as { records?: MedicalRecord[] };
        if (!isMounted) return;
        setRecords(Array.isArray(payload.records) ? payload.records : []);
      } catch (error) {
        console.error('Failed to fetch timeline records from API.', error);
        if (!isMounted) return;
        toast.error('Could not load timeline from server.');
      }
    }

    loadTimeline();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  if (!patient) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6f635b' }}>Patient not found</p>
        <Link
          href={`/doctor?doctorId=${encodeURIComponent(activeDoctorId)}`}
          style={{ color: THEME_ICON_ACCENT, marginTop: '16px', display: 'inline-block' }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredRecords =
    activeFilter === 'All'
      ? records
      : records.filter((r) => r.record_type === activeFilter);

  const filterOptions: (RecordType | 'All')[] = [
    'All',
    'Prescription',
    'LabReport',
    'Scan',
    'DischargeSummary',
  ];

  const queueEntry = queueStore.queue.find((entry) => entry.patientId === patientId);
  const isAssignedToAnotherDoctor =
    Boolean(queueEntry?.doctorId) && queueEntry?.doctorId !== activeDoctorId;
  const queueStatus = isAssignedToAnotherDoctor ? null : queueEntry?.status ?? null;
  const selectedTemplate =
    prescriptionTemplates.find((template) => template.id === selectedTemplateId) ?? null;

  const handleMarkDiagnosed = () => {
    const marked = markPatientDiagnosed(patientId, activeDoctorId);
    if (!marked) {
      toast.info('Patient is not in active queue.', {
        description: 'Only patients assigned to your queue can be marked diagnosed.',
      });
      return;
    }

    setQueueStore(getPatientQueueStore());
    toast.success('Patient marked diagnosed', {
      description: 'Consultation is now counted under "Consultations Done".',
    });
  };

  const buildFollowUpDate = (daysFromNow: number): string => {
    const next = new Date();
    next.setDate(next.getDate() + daysFromNow);
    return next.toISOString().slice(0, 10);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.info('Select a prescription template first.');
      return;
    }

    setNewVisitData((prev) => ({
      ...prev,
      diagnosis: selectedTemplate.diagnosis,
      medications: selectedTemplate.medications.join('\n'),
      notes: selectedTemplate.notes,
      followUp: buildFollowUpDate(selectedTemplate.followUpDays),
    }));

    toast.success(`Applied template: ${selectedTemplate.label}`);
  };

  const handleClearTemplate = () => {
    setSelectedTemplateId('');
    setNewVisitData({
      diagnosis: '',
      medications: '',
      notes: '',
      followUp: '',
    });
  };

  const handleNewVisitSubmit = async () => {
    const parsedMedications = newVisitData.medications
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/records/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient?.id ?? patientId,
          facilityId: activeDoctor?.facility_id ?? 'fac-001',
          doctorId: activeDoctor?.id ?? activeDoctorId,
          recordType: 'Prescription',
          title: selectedTemplate
            ? `${selectedTemplate.label} - ${new Date().toLocaleDateString('en-IN')}`
            : `Visit Note - ${new Date().toLocaleDateString('en-IN')}`,
          notes: newVisitData.notes || 'Clinical notes recorded.',
          diagnosis: newVisitData.diagnosis || 'N/A',
          medications: parsedMedications.length > 0 ? parsedMedications : ['No medications entered.'],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Upload failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { record?: MedicalRecord };
      if (payload.record) {
        setRecords((prev) => [payload.record as MedicalRecord, ...prev]);
      }

      toast.success('Visit note saved & synced to patient timeline!', {
        description: 'Added as a prescription record for this patient.',
        duration: 5000,
      });

      setShowNewVisit(false);
      setSelectedTemplateId('');
      setNewVisitData({ diagnosis: '', medications: '', notes: '', followUp: '' });
    } catch (error) {
      console.error('Failed to upload visit note.', error);
      toast.error('Could not save visit note to server.');
    }
  };

  return (
    <div>
      {/* Back Button + Patient Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href={`/doctor?doctorId=${encodeURIComponent(activeDoctorId)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#6f635b',
            textDecoration: 'none',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          Back to Patients
        </Link>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: THEME_AVATAR_GRADIENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {patient.avatar_initials}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                {patient.name}
              </h2>
              <p style={{ fontSize: '13px', color: '#6f635b', marginTop: '2px' }}>
                {patient.gender} - {getAge(patient.date_of_birth)} years - Blood Group:{' '}
                {patient.blood_group} - Mobile: +91 {patient.mobile_number}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {queueStatus && (
              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: queueStatusConfig[queueStatus].bgColor,
                  color: queueStatusConfig[queueStatus].textColor,
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {queueStatusConfig[queueStatus].label}
              </span>
            )}
            {isAssignedToAnotherDoctor && (
              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Assigned to another doctor
              </span>
            )}
            <button suppressHydrationWarning
              onClick={handleMarkDiagnosed}
              disabled={!queueStatus || isAssignedToAnotherDoctor}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: queueStatus && !isAssignedToAnotherDoctor ? THEME_PRIMARY_GRADIENT : '#e2e8f0',
                color: queueStatus && !isAssignedToAnotherDoctor ? '#ffffff' : '#9c8f84',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow:
                  queueStatus && !isAssignedToAnotherDoctor
                    ? '0 12px 24px -18px rgba(220, 92, 36, 0.82)'
                    : 'none',
              }}
            >
              <Activity size={16} />
              Mark Diagnosed
            </button>
            <button suppressHydrationWarning
              onClick={() => setShowNewVisit(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: THEME_PRIMARY_GRADIENT,
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 12px 24px -18px rgba(220, 92, 36, 0.82)',
              }}
            >
              <Plus size={16} />
              New Visit Note
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          padding: '8px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            color: '#9c8f84',
          }}
        >
          <Filter size={16} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Filter:</span>
        </div>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;
          const config = filter !== 'All' ? recordTypeConfig[filter] : null;
          const count =
            filter === 'All'
              ? records.length
              : records.filter((r) => r.record_type === filter).length;

          return (
            <button suppressHydrationWarning
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive
                  ? config
                    ? config.bgColor
                    : '#f1662a'
                  : 'transparent',
                color: isActive
                  ? config
                    ? config.textColor
                    : '#ffffff'
                  : '#6f635b',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              {config && <span>{config.emoji}</span>}
              {filter === 'All' ? 'All Records' : config?.label}
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: isActive
                    ? 'rgba(0,0,0,0.1)'
                    : '#f1f5f9',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record, i) => {
            const config = recordTypeConfig[record.record_type];
            const facility = getFacilityById(record.facility_id);
            const doctor = getDoctorById(record.doctor_id);
            const Icon = config.icon;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                layout
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedRecord(record)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = THEME_ICON_SOFT_BORDER;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Top Row: Badge + Date */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        background: config.bgColor,
                        color: config.textColor,
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon size={14} />
                      {config.label}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      {record.title}
                    </h4>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6f635b',
                      fontSize: '13px',
                    }}
                  >
                    <Calendar size={14} color={THEME_ICON_MUTED} />
                    {new Date(record.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Source Tags */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <Building2 size={14} color={THEME_ICON_ACCENT} />
                    <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>
                      {facility?.name || 'Unknown Facility'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <User size={14} color={THEME_ICON_ACCENT} />
                    <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>
                      {doctor?.name || 'Unknown Doctor'}
                      {doctor?.specialty && (
                        <span style={{ color: '#9c8f84' }}> - {doctor.specialty}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <p style={{ fontSize: '13px', color: '#6f635b', lineHeight: 1.6, marginBottom: '14px' }}>
                  {record.notes}
                </p>

                {/* Diagnosis & Medications (if present) */}
                {(record.diagnosis || record.medications) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '14px',
                    }}
                  >
                    {record.diagnosis && (
                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '4px',
                          }}
                        >
                          <AlertTriangle size={12} color="#dc2626" />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#dc2626',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Diagnosis
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 500 }}>
                          {record.diagnosis}
                        </p>
                      </div>
                    )}
                    {record.medications && record.medications.length > 0 && (
                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: THEME_ICON_SOFT_BG,
                          border: `1px solid ${THEME_ICON_SOFT_BORDER}`,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '4px',
                          }}
                        >
                          <Pill size={12} color={THEME_ICON_ACCENT} />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#f1662a',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Medications
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {record.medications.map((med) => (
                            <span
                              key={med}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: THEME_ICON_SOFT_BORDER,
                                fontSize: '11px',
                                color: '#134e4a',
                                fontWeight: 500,
                              }}
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* View Document Button */}
                <button suppressHydrationWarning
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecord(record);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#f1662a',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} />
                  View Full Document
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px dashed #e2e8f0',
            }}
          >
            <FileText size={48} color={THEME_ICON_MUTED} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '15px', color: '#6f635b', fontWeight: 500 }}>
              No records found for this filter
            </p>
            <p style={{ fontSize: '13px', color: '#9c8f84', marginTop: '4px' }}>
              Try selecting a different record type
            </p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Document Viewer Drawer (Right Side) */}
      {/* ============================================ */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 100,
                backdropFilter: 'blur(4px)',
              }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '560px',
                height: '100vh',
                background: '#ffffff',
                zIndex: 101,
                boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: recordTypeConfig[selectedRecord.record_type].bgColor,
                        color: recordTypeConfig[selectedRecord.record_type].textColor,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {recordTypeConfig[selectedRecord.record_type].emoji}{' '}
                      {recordTypeConfig[selectedRecord.record_type].label}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedRecord.title}
                  </h3>
                </div>
                <button suppressHydrationWarning
                  onClick={() => setSelectedRecord(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} color={THEME_ICON_MUTED} />
                </button>
              </div>

              {/* Drawer Meta */}
              <div
                style={{
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color={THEME_ICON_MUTED} />
                  <span style={{ fontSize: '12px', color: '#6f635b' }}>
                    {new Date(selectedRecord.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color={THEME_ICON_ACCENT} />
                  <span style={{ fontSize: '12px', color: '#6f635b' }}>
                    {getFacilityById(selectedRecord.facility_id)?.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color={THEME_ICON_ACCENT} />
                  <span style={{ fontSize: '12px', color: '#6f635b' }}>
                    {getDoctorById(selectedRecord.doctor_id)?.name}
                  </span>
                </div>
              </div>

              {/* Document Preview Area */}
              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                {/* Mock Document Viewer */}
                <div
                  style={{
                    borderRadius: '16px',
                    background: '#f1f5f9',
                    border: '2px dashed #cbd5e1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    marginBottom: '24px',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: recordTypeConfig[selectedRecord.record_type].bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <FileText
                      size={28}
                      color={recordTypeConfig[selectedRecord.record_type].textColor}
                    />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    {selectedRecord.title}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9c8f84' }}>
                    Document preview  -  {selectedRecord.document_url}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9c8f84', marginTop: '8px' }}>
                    In production, the actual PDF/Image will render here
                  </p>
                </div>

                {/* Clinical Notes */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#9c8f84',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}
                  >
                    Clinical Notes
                  </h4>
                  <p style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.6 }}>
                    {selectedRecord.notes}
                  </p>
                </div>

                {selectedRecord.diagnosis && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      marginBottom: '16px',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#dc2626',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '8px',
                      }}
                    >
                      Diagnosis
                    </h4>
                    <p style={{ fontSize: '13px', color: '#7f1d1d', fontWeight: 500 }}>
                      {selectedRecord.diagnosis}
                    </p>
                  </div>
                )}

                {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: THEME_ICON_SOFT_BG,
                      border: `1px solid ${THEME_ICON_SOFT_BORDER}`,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#f1662a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '8px',
                      }}
                    >
                      Medications Prescribed
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedRecord.medications.map((med, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: THEME_ICON_SOFT_BORDER,
                          }}
                        >
                          <Pill size={14} color={THEME_ICON_ACCENT} />
                          <span style={{ fontSize: '13px', color: '#134e4a', fontWeight: 500 }}>
                            {med}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* New Visit Form Modal */}
      {/* ============================================ */}
      <AnimatePresence>
        {showNewVisit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewVisit(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 100,
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 101,
                padding: '12px',
              }}
            >
              <div
                style={{
                  width: 'min(560px, 90vw)',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  background: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                  overflow: 'auto',
                }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '24px 28px',
                  background: 'linear-gradient(135deg, #fff1e8, #f5efea)',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    New Visit Note
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6f635b', marginTop: '2px' }}>
                    For {patient.name}  -  {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button suppressHydrationWarning
                  onClick={() => setShowNewVisit(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} color={THEME_ICON_MUTED} />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: '24px 28px' }}>
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6f635b',
                      marginBottom: '8px',
                    }}
                  >
                    Structured Prescription Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Select a template...</option>
                    {prescriptionTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button suppressHydrationWarning
                      type="button"
                      onClick={handleApplyTemplate}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${THEME_ICON_SOFT_BORDER}`,
                        background: THEME_ICON_SOFT_BG,
                        color: '#f1662a',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      Apply Template
                    </button>
                    <button suppressHydrationWarning
                      type="button"
                      onClick={handleClearTemplate}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#6f635b',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6f635b',
                      marginBottom: '8px',
                    }}
                  >
                    Diagnosis
                  </label>
                  <input suppressHydrationWarning
                    type="text"
                    placeholder="e.g. Viral Fever, Upper Respiratory Infection"
                    value={newVisitData.diagnosis}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, diagnosis: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#f8fafc',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6f635b',
                      marginBottom: '8px',
                    }}
                  >
                    Medications Prescribed
                  </label>
                  <textarea
                    placeholder="One medication per line&#10;e.g. Paracetamol 500mg TDS&#10;Amoxicillin 250mg BD"
                    value={newVisitData.medications}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, medications: e.target.value })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#f8fafc',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6f635b',
                      marginBottom: '8px',
                    }}
                  >
                    Clinical Notes
                  </label>
                  <textarea
                    placeholder="Observations, examination findings, advice given..."
                    value={newVisitData.notes}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, notes: e.target.value })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#f8fafc',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6f635b',
                      marginBottom: '8px',
                    }}
                  >
                    Follow-up Date
                  </label>
                  <input suppressHydrationWarning
                    type="date"
                    value={newVisitData.followUp}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, followUp: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#f8fafc',
                    }}
                  />
                </div>

                <button suppressHydrationWarning
                  onClick={handleNewVisitSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: THEME_PRIMARY_GRADIENT,
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 12px 24px -18px rgba(220, 92, 36, 0.82)',
                  }}
                >
                  <Send size={16} />
                  Save Visit & Sync to Timeline
                </button>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
