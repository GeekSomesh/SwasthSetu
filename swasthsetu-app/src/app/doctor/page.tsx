'use client';

import { useEffect, useState } from 'react';
import { Users, Clock, FileText, Activity, ArrowRight, Stethoscope, AlertTriangle } from 'lucide-react';
import { getAge, getPatientById, getRecordsByPatientId, patients, type Patient } from '@/data/mock-data';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getPatientQueueStore,
  markPatientUnderDiagnosis,
  subscribeToPatientQueue,
  type QueueStatus,
} from '@/lib/patient-queue';

type DoctorStat =
  | 'Patients Today'
  | 'Pending Review'
  | 'Records Accessed'
  | 'Consultations Done'
  | 'All Registered';
type DashboardStatus = QueueStatus | 'Diagnosed' | 'Historical';

type DashboardPatientRow = {
  patient: Patient;
  status: DashboardStatus;
  isEmergency?: boolean;
  emergencyReason?: string | null;
  checkedInAt?: string;
  completedAt?: string;
};

const statusStyles: Record<DashboardStatus, { label: string; bg: string; color: string }> = {
  Waiting: {
    label: 'Pending',
    bg: '#fffbeb',
    color: '#92400e',
  },
  UnderDiagnosis: {
    label: 'Under Diagnosis',
    bg: '#eff6ff',
    color: '#1d4ed8',
  },
  Diagnosed: {
    label: 'Diagnosed',
    bg: '#ecfdf5',
    color: '#166534',
  },
  Historical: {
    label: 'History Only',
    bg: '#f1f5f9',
    color: '#475569',
  },
};

function bySearchTerm(row: DashboardPatientRow, searchTerm: string): boolean {
  const normalized = searchTerm.toLowerCase();
  return (
    row.patient.name.toLowerCase().includes(normalized) ||
    row.patient.mobile_number.includes(searchTerm)
  );
}

function getPatientsTodayRows(
  queueRows: DashboardPatientRow[],
  completedRows: DashboardPatientRow[]
): DashboardPatientRow[] {
  const seen = new Set(queueRows.map((row) => row.patient.id));
  const fromCompleted = completedRows.filter((row) => !seen.has(row.patient.id));
  return [...queueRows, ...fromCompleted];
}

export default function DoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStat, setActiveStat] = useState<DoctorStat>('Pending Review');
  const [actionMessage, setActionMessage] = useState('Showing patients pending review.');
  const [queueStore, setQueueStore] = useState(() => getPatientQueueStore());

  useEffect(() => {
    const unsubscribe = subscribeToPatientQueue((nextStore) => {
      setQueueStore(nextStore);
    });
    return unsubscribe;
  }, []);

  const queueRows = queueStore.queue.reduce<DashboardPatientRow[]>((acc, entry) => {
    const patient = getPatientById(entry.patientId);
    if (!patient) return acc;
    acc.push({
      patient,
      status: entry.status,
      isEmergency: entry.isEmergency,
      emergencyReason: entry.emergencyReason,
      checkedInAt: entry.checkedInAt,
    });
    return acc;
  }, []);

  const completedRows = [...queueStore.completed]
    .reverse()
    .reduce<DashboardPatientRow[]>((acc, entry) => {
      const patient = getPatientById(entry.patientId);
      if (!patient) return acc;
      acc.push({
        patient,
        status: 'Diagnosed',
        isEmergency: entry.wasEmergency,
        emergencyReason: entry.emergencyReason,
        completedAt: entry.completedAt,
      });
      return acc;
    }, []);

  const patientsTodayRows = getPatientsTodayRows(queueRows, completedRows);
  const pendingReviewRows = queueRows.filter((row) => row.status === 'Waiting');
  const emergencyWaitingRows = pendingReviewRows.filter((row) => row.isEmergency);
  const hasEmergencyWaiting = emergencyWaitingRows.length > 0;
  const emergencyInQueueCount = queueRows.filter((row) => row.isEmergency).length;
  const emergencyReasonPreview =
    emergencyWaitingRows.find((row) => row.emergencyReason)?.emergencyReason ?? null;
  const activeUnderDiagnosisRow =
    queueRows.find((row) => row.status === 'UnderDiagnosis') ?? null;
  const nextNonEmergencyWaitingRow = [...pendingReviewRows]
    .filter((row) => !row.isEmergency)
    .sort((a, b) => {
      const aTime = Date.parse(a.checkedInAt ?? '');
      const bTime = Date.parse(b.checkedInAt ?? '');
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return aTime - bTime;
    })[0] ?? null;
  const recordsAccessedRows = queueRows.filter((row) => row.status === 'UnderDiagnosis');
  const consultationsDoneRows = completedRows;

  const handleReviewEmergencyQueue = () => {
    setActiveStat('Pending Review');

    if (activeUnderDiagnosisRow) {
      setActionMessage(
        `Complete current consultation first: ${activeUnderDiagnosisRow.patient.name}.`
      );
      return;
    }

    if (!hasEmergencyWaiting) {
      setActionMessage('No emergency patient is waiting right now.');
      return;
    }

    setActionMessage('Emergency queue is active. Doctor can choose any emergency patient to open.');
  };

  const queueStatusByPatientId = new Map(
    queueRows.map((row) => [row.patient.id, row] as const)
  );
  const completedStatusByPatientId = new Map(
    completedRows.map((row) => [row.patient.id, row] as const)
  );

  const allRegisteredRows: DashboardPatientRow[] = patients.map((patient) => {
    const queueRow = queueStatusByPatientId.get(patient.id);
    if (queueRow) return queueRow;
    const completedRow = completedStatusByPatientId.get(patient.id);
    if (completedRow) return completedRow;
    return {
      patient,
      status: 'Historical',
    };
  });

  const stats = [
    {
      label: 'Patients Today' as const,
      value: String(patientsTodayRows.length),
      icon: Users,
      color: '#0f766e',
      bg: '#f0fdfa',
      message: 'Showing all checked-in and diagnosed patients for today.',
    },
    {
      label: 'Pending Review' as const,
      value: String(pendingReviewRows.length),
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
      message: 'Showing patients pending review.',
    },
    {
      label: 'Records Accessed' as const,
      value: String(recordsAccessedRows.length),
      icon: FileText,
      color: '#3b82f6',
      bg: '#eff6ff',
      message: 'Showing patients currently under diagnosis.',
    },
    {
      label: 'Consultations Done' as const,
      value: String(consultationsDoneRows.length),
      icon: Activity,
      color: '#10b981',
      bg: '#ecfdf5',
      message: 'Showing patients marked diagnosed by doctors.',
    },
    {
      label: 'All Registered' as const,
      value: String(allRegisteredRows.length),
      icon: Users,
      color: '#334155',
      bg: '#f1f5f9',
      message:
        'Showing complete patient registry for historical review and fresh prescriptions.',
    },
  ];

  let scopedRows: DashboardPatientRow[] = patientsTodayRows;
  if (activeStat === 'Pending Review') scopedRows = pendingReviewRows;
  if (activeStat === 'Records Accessed') scopedRows = recordsAccessedRows;
  if (activeStat === 'Consultations Done') scopedRows = consultationsDoneRows;
  const rowsForDisplay =
    activeStat === 'All Registered' ? allRegisteredRows : scopedRows;

  const listTitle =
    activeStat === 'All Registered' ? 'All Registered Patients' : activeStat;
  const listSubtitle =
    activeStat === 'All Registered'
      ? 'Full patient registry view for historical review and fresh prescriptions.'
      : 'Click on a patient to open timeline and continue consultation';

  const patientList = rowsForDisplay
    .filter((row) => bySearchTerm(row, searchTerm))
    .sort((a, b) => {
      if (activeStat === 'Pending Review') {
        if (Boolean(a.isEmergency) !== Boolean(b.isEmergency)) {
          return a.isEmergency ? -1 : 1;
        }

        const aCheckInTime = Date.parse(a.checkedInAt ?? '');
        const bCheckInTime = Date.parse(b.checkedInAt ?? '');
        if (Number.isNaN(aCheckInTime) && Number.isNaN(bCheckInTime)) return 0;
        if (Number.isNaN(aCheckInTime)) return 1;
        if (Number.isNaN(bCheckInTime)) return -1;
        return aCheckInTime - bCheckInTime;
      }

      const aTime = Date.parse(a.completedAt ?? a.checkedInAt ?? '');
      const bTime = Date.parse(b.completedAt ?? b.checkedInAt ?? '');
      return Number.isNaN(aTime) || Number.isNaN(bTime) ? 0 : bTime - aTime;
    });

  return (
    <div>
      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
          gap: '16px',
          marginBottom: '8px',
        }}
      >
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => {
              setActiveStat(stat.label);
              setActionMessage(stat.message);
            }}
            style={{
              background: activeStat === stat.label ? '#e0f2fe' : '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: activeStat === stat.label ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                {stat.label}
              </p>
            </div>
          </button>
        ))}
      </div>
      {actionMessage && (
        <div
          style={{
            marginBottom: '24px',
            color: '#0369a1',
            padding: '12px 16px',
            background: '#e0f2fe',
            borderRadius: '12px',
            border: '1px solid #7dd3fc',
          }}
        >
          {actionMessage}
        </div>
      )}
      {emergencyInQueueCount > 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#b91c1c" />
            <div>
              <p style={{ fontSize: '13px', color: '#7f1d1d', fontWeight: 700 }}>
                {emergencyInQueueCount} emergency patient(s) in queue.
              </p>
              {emergencyReasonPreview && (
                <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '2px' }}>
                  Latest reason: {emergencyReasonPreview}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleReviewEmergencyQueue}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #fca5a5',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Review Emergency Queue
          </button>
        </div>
      )}

      {/* Patient List */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {listTitle}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              {listSubtitle}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              width: '280px',
            }}
          >
            <Stethoscope size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1.1fr 1fr 0.5fr',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#f8fafc',
            marginBottom: '8px',
          }}
        >
          {['Patient', 'Mobile', 'Age', 'Gender', 'Status', 'Records', ''].map((h) => (
            <p
              key={h}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {h}
            </p>
          ))}
        </div>

        {/* Patient Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {patientList.length === 0 ? (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                borderRadius: '14px',
                border: '1px dashed #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <p style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                No patients found for this view
              </p>
            </div>
          ) : (
            patientList.map((row, i) => {
              const records = getRecordsByPatientId(row.patient.id);
              const isWaiting = row.status === 'Waiting';
              const isEmergencyWaiting = isWaiting && Boolean(row.isEmergency);
              const isNextNonEmergencyWaiting =
                isWaiting &&
                !row.isEmergency &&
                nextNonEmergencyWaitingRow?.patient.id === row.patient.id;
              const isConsultationLocked = Boolean(
                activeUnderDiagnosisRow && activeUnderDiagnosisRow.patient.id !== row.patient.id
              );
              const canOpenWaitingRow = isEmergencyWaiting
                ? !isConsultationLocked
                : !hasEmergencyWaiting &&
                    Boolean(isNextNonEmergencyWaiting) &&
                    !isConsultationLocked;
              const canOpenRow = !isWaiting || canOpenWaitingRow;
              const waitingBlockedLabel = isConsultationLocked
                ? 'In Queue'
                : hasEmergencyWaiting && !row.isEmergency
                  ? 'Emergency First'
                  : 'In Queue';
              const actionLabel =
                row.status === 'Historical'
                  ? 'Add Rx'
                  : isWaiting && !canOpenRow
                    ? waitingBlockedLabel
                    : 'Open';
              const timelineHref =
                row.status === 'Historical'
                  ? `/doctor/patient/${row.patient.id}?newVisit=1`
                  : `/doctor/patient/${row.patient.id}`;
              return (
                <motion.div
                  key={`${row.patient.id}-${row.completedAt ?? row.checkedInAt ?? i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={timelineHref}
                    onClick={(event) => {
                      if (row.status === 'Waiting') {
                        if (
                          activeUnderDiagnosisRow &&
                          activeUnderDiagnosisRow.patient.id !== row.patient.id
                        ) {
                          event.preventDefault();
                          setActionMessage(
                            `Complete current consultation first: ${activeUnderDiagnosisRow.patient.name}.`
                          );
                          return;
                        }

                        if (!row.isEmergency && hasEmergencyWaiting) {
                          event.preventDefault();
                          setActionMessage(
                            'Emergency patient is waiting. Select any emergency case first.'
                          );
                          return;
                        }

                        if (
                          !row.isEmergency &&
                          nextNonEmergencyWaitingRow &&
                          nextNonEmergencyWaitingRow.patient.id !== row.patient.id
                        ) {
                          event.preventDefault();
                          setActionMessage(
                            `Queue order active. Next patient: ${nextNonEmergencyWaitingRow.patient.name}.`
                          );
                          return;
                        }

                        const moved = markPatientUnderDiagnosis(row.patient.id);
                        if (!moved) {
                          event.preventDefault();
                          setActionMessage(
                            'Could not move patient to consultation. Check queue order and active consultation lock.'
                          );
                          return;
                        }

                        setQueueStore(getPatientQueueStore());
                      }
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1.1fr 1fr 0.5fr',
                      padding: '16px',
                      borderRadius: '14px',
                      textDecoration: 'none',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      cursor: canOpenRow ? 'pointer' : 'not-allowed',
                      opacity: canOpenRow ? 1 : 0.75,
                    }}
                    onMouseEnter={(e) => {
                      if (!canOpenRow) return;
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      if (!canOpenRow) return;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {/* Name + Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {row.patient.avatar_initials}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                            {row.patient.name}
                          </p>
                          {row.isEmergency && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                fontSize: '10px',
                                fontWeight: 800,
                                letterSpacing: '0.03em',
                                textTransform: 'uppercase',
                              }}
                            >
                              Emergency
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{row.patient.blood_group}</p>
                        {row.isEmergency && row.emergencyReason && (
                          <p
                            style={{
                              marginTop: '3px',
                              fontSize: '11px',
                              color: '#991b1b',
                              fontWeight: 600,
                            }}
                          >
                            Reason: {row.emergencyReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569' }}>+91 {row.patient.mobile_number}</p>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{getAge(row.patient.date_of_birth)} yrs</p>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{row.patient.gender}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: statusStyles[row.status].bg,
                          color: statusStyles[row.status].color,
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {statusStyles[row.status].label}
                      </span>
                      {row.isEmergency && row.status !== 'Diagnosed' && (
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          Emergency
                        </span>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: records.length > 0 ? '#d1fae5' : '#f1f5f9',
                          color: records.length > 0 ? '#065f46' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {records.length} records
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#0f766e',
                        }}
                      >
                        {actionLabel}
                      </span>
                      <ArrowRight size={16} color="#94a3b8" />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
