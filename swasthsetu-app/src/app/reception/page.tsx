'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Phone, UserCheck, Clock, ArrowRight, Shield, Users, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  doctors,
  getPatientById,
  getAge,
  generateOTP,
  getDoctorById,
  facilities,
  type Patient,
} from '@/data/mock-data';
import {
  enqueuePatient,
  getPatientQueueStore,
  markPatientUnderDiagnosis,
  subscribeToPatientQueue,
  type QueueStatus,
} from '@/lib/patient-queue';

type ReceptionStat = 'Patients Today' | 'Consents Pending' | 'Records Synced' | 'In Queue';

type ReceptionQueueRow = {
  patient: Patient;
  status: QueueStatus;
  tokenNumber: number;
  doctorId: string;
  doctorName: string;
  department: string;
  isEmergency: boolean;
  emergencyReason: string | null;
  checkedInAt: string;
  diagnosisStartedAt: string | null;
  updatedAt: string;
};

type PendingConsentEntry = {
  patientId: string;
  patientName: string;
  mobile: string;
  otp: string;
  requestedAt: string;
  attempts: number;
};

type QueuePriorityMode = 'default' | 'long-wait' | 'elderly';

const THEME_AVATAR_BG = 'linear-gradient(145deg, #f1662a, #e7672f)';
const THEME_PRIMARY_BUTTON_BG = '#f1662a';
const THEME_PRIMARY_BUTTON_BORDER = '#dc5c24';
const THEME_PRIMARY_BUTTON_SHADOW = '0 12px 24px -16px rgba(220, 92, 36, 0.8)';
const THEME_ICON_ACCENT = '#f1662a';
const THEME_ICON_MUTED = '#9c8f84';
const THEME_ICON_CHIP_BG = '#fff1e8';

export default function ReceptionPage() {
  const lookupSectionRef = useRef<HTMLDivElement | null>(null);
  const queueSectionRef = useRef<HTMLDivElement | null>(null);

  const [searchMobile, setSearchMobile] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [isEmergencyCase, setIsEmergencyCase] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [foundPatientRecordCount, setFoundPatientRecordCount] = useState(0);
  const [foundPatientFacilityIds, setFoundPatientFacilityIds] = useState<string[]>([]);
  const [consentGranted, setConsentGranted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeStat, setActiveStat] = useState<ReceptionStat>('In Queue');
  const [queuePriorityMode, setQueuePriorityMode] = useState<QueuePriorityMode>('default');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [nowTs, setNowTs] = useState(() => new Date().getTime());
  const [queueStore, setQueueStore] = useState(() => getPatientQueueStore());
  const [pendingConsents, setPendingConsents] = useState<PendingConsentEntry[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPatientQueue((nextStore) => {
      setQueueStore(nextStore);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(new Date().getTime());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPatientTimelineSummary() {
      if (!foundPatient) {
        setFoundPatientRecordCount(0);
        setFoundPatientFacilityIds([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/records/timeline?patientId=${encodeURIComponent(foundPatient.id)}`
        );
        if (!response.ok) {
          throw new Error(`Timeline fetch failed with status ${response.status}`);
        }

        const payload = (await response.json()) as {
          records?: Array<{ facility_id?: string }>;
        };
        if (!isMounted) return;

        const records = Array.isArray(payload.records) ? payload.records : [];
        const facilityIds = [
          ...new Set(
            records
              .map((record) => record.facility_id)
              .filter((facilityId): facilityId is string => Boolean(facilityId))
          ),
        ];

        setFoundPatientRecordCount(records.length);
        setFoundPatientFacilityIds(facilityIds);
      } catch (error) {
        console.error('Failed to fetch patient timeline summary.', error);
        if (!isMounted) return;
        setFoundPatientRecordCount(0);
        setFoundPatientFacilityIds([]);
      }
    }

    loadPatientTimelineSummary();

    return () => {
      isMounted = false;
    };
  }, [foundPatient]);

  const queuedPatients: ReceptionQueueRow[] = queueStore.queue
    .map((entry) => {
      const patient = getPatientById(entry.patientId);
      if (!patient) return null;
      const assignedDoctor = getDoctorById(entry.doctorId);
      const fallbackDoctorName = `Doctor ${entry.doctorId}`;
      const fallbackDepartment = 'General Medicine';

      return {
        patient,
        status: entry.status,
        tokenNumber: entry.tokenNumber,
        doctorId: entry.doctorId,
        doctorName: assignedDoctor?.name ?? fallbackDoctorName,
        department: assignedDoctor?.specialty ?? fallbackDepartment,
        isEmergency: entry.isEmergency,
        emergencyReason: entry.emergencyReason,
        checkedInAt: entry.checkedInAt,
        diagnosisStartedAt: entry.diagnosisStartedAt,
        updatedAt: entry.updatedAt,
      };
    })
    .filter((item): item is ReceptionQueueRow => Boolean(item));

  const getWaitingMinutes = (checkedInAt: string) =>
    Math.max(0, Math.floor((nowTs - new Date(checkedInAt).getTime()) / 60000));

  const scrollToSection = (section: 'lookup' | 'queue') => {
    const targetRef = section === 'lookup' ? lookupSectionRef : queueSectionRef;
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const runSearchByMobile = async (mobile: string) => {
    if (mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSearchMobile(mobile);
    setIsSearching(true);
    setConsentGranted(false);
    setShowOTP(false);
    setOtpDigits(['', '', '', '']);
    setIsEmergencyCase(false);
    setEmergencyReason('');

    try {
      const response = await fetch('/api/patients/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        setFoundPatient(null);
        setSearchDone(true);
        setSelectedDepartment('');
        setSelectedDoctorId('');
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(payload?.error ?? 'No patient found with this mobile number');
        return;
      }

      const payload = (await response.json()) as { patient?: Patient };
      const patient = payload.patient ?? null;
      setFoundPatient(patient);
      setSearchDone(true);

      if (!patient) {
        setSelectedDepartment('');
        setSelectedDoctorId('');
        toast.error('No patient found with this mobile number');
        return;
      }

      const existingQueueEntry = queueStore.queue.find((entry) => entry.patientId === patient.id);
      const existingAssignedDoctor = existingQueueEntry
        ? getDoctorById(existingQueueEntry.doctorId)
        : null;

      if (existingAssignedDoctor) {
        setSelectedDepartment(existingAssignedDoctor.specialty);
        setSelectedDoctorId(existingAssignedDoctor.id);
      } else {
        setSelectedDepartment('');
        setSelectedDoctorId('');
      }

      const pendingConsent = pendingConsents.find((entry) => entry.patientId === patient.id);
      if (pendingConsent) {
        setShowOTP(true);
        toast.info(`Pending consent found for ${patient.name}`, {
          description: 'You can verify existing OTP or resend a new one.',
        });
      } else {
        toast.success(`Patient found: ${patient.name}`);
      }
    } catch (error) {
      console.error('Failed to search patient by mobile.', error);
      setFoundPatient(null);
      setSearchDone(true);
      setSelectedDepartment('');
      setSelectedDoctorId('');
      toast.error('Unable to search patient right now.');
    } finally {
      setIsSearching(false);
    }
  };

  const issueConsentOtp = async (patient: Patient, mode: 'new' | 'resend') => {
    const requestedAt = new Date().toISOString();
    const defaultFacilityId = facilities[0]?.id ?? 'fac-001';
    let otp = generateOTP();

    try {
      const response = await fetch('/api/consent/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          facilityId: defaultFacilityId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Consent request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { otp_hint?: string };
      otp = payload.otp_hint ?? otp;
    } catch (error) {
      console.error('Failed to request consent OTP via API.', error);
      toast.error('Unable to request OTP from server.');
      return;
    }

    setShowOTP(true);
    setConsentGranted(false);
    setOtpDigits(['', '', '', '']);

    setPendingConsents((prev) => {
      const existing = prev.find((item) => item.patientId === patient.id);
      const nextAttempts = existing ? existing.attempts + 1 : 1;
      const rest = prev.filter((item) => item.patientId !== patient.id);

      const nextEntry: PendingConsentEntry = {
        patientId: patient.id,
        patientName: patient.name,
        mobile: patient.mobile_number,
        otp,
        requestedAt,
        attempts: nextAttempts,
      };

      return [nextEntry, ...rest].slice(0, 12);
    });

    toast.info(
      `${mode === 'resend' ? 'OTP resent' : 'OTP sent'} to ****${patient.mobile_number.slice(-4)}`,
      {
        description: `Demo OTP: ${otp}`,
        duration: 10000,
      }
    );
  };

  const handleSearch = () => {
    runSearchByMobile(searchMobile);
  };

  const handleRequestConsent = () => {
    if (!foundPatient) {
      toast.error('Search and select a patient first');
      return;
    }
    issueConsentOtp(foundPatient, 'new');
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otpDigits.join('');
    if (!foundPatient) {
      toast.error('Search and select a patient first');
      return;
    }

    if (!selectedDepartment) {
      toast.error('Select a department before handover');
      return;
    }

    if (!selectedDoctorId) {
      toast.error('Select assigned doctor before handover');
      return;
    }

    try {
      const response = await fetch('/api/consent/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: foundPatient.id,
          otp: enteredOTP,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `OTP verification failed with status ${response.status}`);
      }

      setConsentGranted(true);
      toast.success('Consent granted! Records are now accessible.', {
        description: 'Access valid for 24 hours',
        duration: 5000,
      });

      setPendingConsents((prev) =>
        prev.filter((entry) => entry.patientId !== foundPatient.id)
      );
      const nextStore = enqueuePatient(foundPatient.id, {
        doctorId: selectedDoctorId,
        isEmergency: isEmergencyCase,
        emergencyReason: emergencyReason.trim() || null,
      });
      setQueueStore(nextStore);
      setIsEmergencyCase(false);
      setEmergencyReason('');
      setActiveStat('In Queue');
      setQueuePriorityMode('long-wait');
      scrollToSection('queue');
    } catch (error) {
      console.error('Failed to verify OTP via API.', error);
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const recordCount = foundPatient ? foundPatientRecordCount : 0;

  const sourceFacilities = foundPatient ? foundPatientFacilityIds : [];

  const foundPatientQueueEntry = foundPatient
    ? queuedPatients.find((row) => row.patient.id === foundPatient.id)
    : undefined;

  const departmentOptions = useMemo(
    () =>
      [...new Set(doctors.map((doctor) => doctor.specialty))].sort((a, b) =>
        a.localeCompare(b, 'en-IN')
      ),
    []
  );

  const doctorsForSelectedDepartment = useMemo(
    () =>
      doctors.filter((doctor) =>
        selectedDepartment ? doctor.specialty === selectedDepartment : true
      ),
    [selectedDepartment]
  );

  const completedTodayCount = queueStore.completed.length;
  const patientsTodayCount = queuedPatients.length + completedTodayCount;
  const pendingCount = pendingConsents.length;
  const syncedCount = queuedPatients.length;
  const inQueueCount = queuedPatients.filter((q) => q.status === 'Waiting').length;
  const emergencyQueueCount = queuedPatients.filter((q) => q.isEmergency).length;
  const longWaitCount = queuedPatients.filter(
    (q) => q.status === 'Waiting' && getWaitingMinutes(q.checkedInAt) >= 20
  ).length;

  const filteredQueue = queuedPatients.filter((q) => {
    if (activeStat === 'Patients Today') return true;
    if (activeStat === 'Consents Pending') return false;
    if (activeStat === 'Records Synced') return true;
    if (activeStat === 'In Queue') return q.status === 'Waiting';
    return true;
  });

  const sortedFilteredQueue = (() => {
    const next = [...filteredQueue];

    if (queuePriorityMode === 'elderly') {
      return next.sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
        return getAge(b.patient.date_of_birth) - getAge(a.patient.date_of_birth);
      });
    }

    if (queuePriorityMode === 'long-wait' || activeStat === 'In Queue') {
      return next.sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
        return new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime();
      });
    }

    return next.sort((a, b) => {
      if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  })();

  const formatToken = (tokenNumber: number) => `T-${String(tokenNumber).padStart(3, '0')}`;

  const averageConsultationMinutes = useMemo(() => {
    const durations = queueStore.completed
      .map((entry) => {
        const startTime = entry.diagnosisStartedAt ?? entry.checkedInAt;
        const minutes = Math.floor(
          (new Date(entry.completedAt).getTime() - new Date(startTime).getTime()) / 60000
        );
        return Number.isFinite(minutes) && minutes > 1 ? minutes : null;
      })
      .filter((item): item is number => Boolean(item));

    if (durations.length === 0) return 12;
    const avg = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
    return Math.min(25, Math.max(6, avg));
  }, [queueStore.completed]);

  const smartQueueRows = (() => {
    const waitingOrdered = queuedPatients
      .filter((item) => item.status === 'Waiting')
      .sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
        return new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime();
      });

    const underDiagnosisOrdered = queuedPatients
      .filter((item) => item.status === 'UnderDiagnosis')
      .sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
        return new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime();
      });

    const ordered = [...underDiagnosisOrdered, ...waitingOrdered];
    const activeConsultationCount = underDiagnosisOrdered.length;

    return ordered.map((item, index) => {
      if (item.status === 'UnderDiagnosis') {
        return {
          ...item,
          etaMinutes: 0,
          queueRank: 0,
          etaLabel: 'In consultation',
          stateLabel: 'With doctor',
        };
      }

      const waitingPosition = ordered
        .slice(0, index + 1)
        .filter((entry) => entry.status === 'Waiting').length;
      const peopleAhead = waitingPosition - 1 + activeConsultationCount;
      const etaMinutes = peopleAhead * averageConsultationMinutes;
      const etaLabel =
        etaMinutes <= 0
          ? 'Next'
          : `${etaMinutes}-${etaMinutes + Math.round(averageConsultationMinutes * 0.6)} min`;

      return {
        ...item,
        etaMinutes,
        queueRank: waitingPosition,
        etaLabel,
        stateLabel: peopleAhead === 0 ? 'Next up' : `${peopleAhead} ahead`,
      };
    });
  })();

  const callNextPatient = () => {
    const nextWaiting = [...queuedPatients]
      .filter((item) => item.status === 'Waiting')
      .sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
        return new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime();
      })[0];

    if (!nextWaiting) {
      toast.info('No waiting patients in queue.');
      return;
    }

    const didMove = markPatientUnderDiagnosis(nextWaiting.patient.id, nextWaiting.doctorId);
    if (didMove) {
      setQueueStore(getPatientQueueStore());
      toast.success(
        `Called ${nextWaiting.patient.name} (${formatToken(nextWaiting.tokenNumber)}) to consultation${nextWaiting.isEmergency ? ' - Emergency priority' : ''}`
      );
      return;
    }

    toast.info('This patient is already in consultation.');
  };

  const queueEmptyTitle =
    activeStat === 'Consents Pending'
      ? 'Consent follow-up view is active'
      : 'No patients in queue yet';
  const queueEmptySubtitle =
    activeStat === 'Consents Pending'
      ? pendingCount > 0
        ? `${pendingCount} pending consent case(s) are shown in Consent Worklist on the left.`
        : 'No pending consent cases right now.'
      : 'Search and verify a patient to add them';

  const stats = [
    {
      label: 'Patients Today',
      value: String(patientsTodayCount),
      icon: Users,
      color: THEME_ICON_ACCENT,
      bg: THEME_ICON_CHIP_BG,
      helper: `${completedTodayCount} diagnosed`,
    },
    {
      label: 'Consents Pending',
      value: String(pendingCount),
      icon: Shield,
      color: THEME_ICON_ACCENT,
      bg: THEME_ICON_CHIP_BG,
      helper: pendingCount > 0 ? 'Needs follow-up' : 'All clear',
    },
    {
      label: 'Records Synced',
      value: String(syncedCount),
      icon: FileText,
      color: THEME_ICON_ACCENT,
      bg: THEME_ICON_CHIP_BG,
      helper: syncedCount > 0 ? 'Doctor-ready' : 'No active cases',
    },
    {
      label: 'In Queue',
      value: String(inQueueCount),
      icon: Clock,
      color: THEME_ICON_ACCENT,
      bg: THEME_ICON_CHIP_BG,
      helper: `${longWaitCount} long wait - ${emergencyQueueCount} emergency`,
    },
  ];

  const handleStatClick = (label: ReceptionStat) => {
    setActiveStat(label);
    setQueuePriorityMode('default');

    if (label === 'Patients Today') {
      scrollToSection('queue');
      toast.info(`Daily throughput: ${patientsTodayCount} total visits`, {
        description: `${completedTodayCount} diagnosed, ${inQueueCount} still in queue.`,
      });
      return;
    }

    if (label === 'Consents Pending') {
      scrollToSection('lookup');
      toast.info(`Consent follow-up list: ${pendingCount}`, {
        description: 'Open pending consents and resend OTP for delayed patients.',
      });
      return;
    }

    if (label === 'Records Synced') {
      scrollToSection('queue');
      toast.info(`${syncedCount} patients already synced for doctor view`, {
        description: 'Hand over patients to doctor in queue order.',
      });
      return;
    }

    if (label === 'In Queue') {
      setQueuePriorityMode('long-wait');
      scrollToSection('queue');
      toast.info('Queue triage enabled', {
        description: `${longWaitCount} patients are waiting for 20+ minutes.`,
      });
    }
  };

  const statPlaybook =
    activeStat === 'Patients Today'
      ? {
          title: 'Daily Operations Snapshot',
          description:
            'Monitor arrivals vs completed consultations and identify bottlenecks early.',
          ctaLabel: 'Prioritize Long Wait Cases',
          onAction: () => {
            setActiveStat('In Queue');
            setQueuePriorityMode('long-wait');
            scrollToSection('queue');
          },
        }
      : activeStat === 'Consents Pending'
        ? {
            title: 'Consent Compliance Workflow',
            description:
              'Follow up pending OTP consents to reduce care delays and improve legal compliance.',
            ctaLabel: 'Open Consent Worklist',
            onAction: () => scrollToSection('lookup'),
          }
        : activeStat === 'Records Synced'
          ? {
              title: 'Doctor Handover Ready',
              description:
                'These patients already have consent and can be routed to doctor queue immediately.',
              ctaLabel: 'Sort by Elderly Priority',
              onAction: () => {
                setQueuePriorityMode('elderly');
                scrollToSection('queue');
              },
            }
          : {
              title: 'Active Queue Triage',
              description:
                'Use wait-time priority and elderly-first triage to reduce risk and improve patient experience.',
              ctaLabel: 'Switch to Elderly Priority',
              onAction: () => {
                setQueuePriorityMode('elderly');
                scrollToSection('queue');
              },
            };

  const completedPatients = [...queueStore.completed]
    .slice(-5)
    .reverse()
    .map((entry) => {
      const patient = getPatientById(entry.patientId);
      return patient
        ? {
            patient,
            tokenNumber: entry.tokenNumber,
            completedAt: entry.completedAt,
          }
        : null;
    })
    .filter(
      (item): item is { patient: Patient; tokenNumber: number; completedAt: string } => Boolean(item)
    );

  const queueStatusStyles: Record<
    QueueStatus,
    { label: string; bg: string; color: string }
  > = {
    Waiting: {
      label: 'Waiting',
      bg: '#fffbeb',
      color: '#92400e',
    },
    UnderDiagnosis: {
      label: 'Under Diagnosis',
      bg: '#eef4f8',
      color: '#4e82bb',
    },
  };

  return (
    <div>
      {/* Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map((stat) => (
          <button suppressHydrationWarning
            key={stat.label}
            onClick={() => handleStatClick(stat.label as ReceptionStat)}
            style={{
              background: activeStat === stat.label ? '#f8f1ea' : '#f7f2ee',
              borderRadius: '16px',
              padding: '20px 24px',
              border: activeStat === stat.label ? '2px solid #ff7b41' : '1px solid #d7cdc5',
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
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1e1915',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#6f635b', marginTop: '4px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '11px', color: '#9c8f84', marginTop: '2px' }}>
                {stat.helper}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          background: '#f7f2ee',
          borderRadius: '16px',
          padding: '16px 18px',
          border: '1px solid #d7cdc5',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e1915' }}>
            {statPlaybook.title}
          </p>
          <p style={{ fontSize: '12px', color: '#6f635b', marginTop: '3px' }}>
            {statPlaybook.description}
          </p>
        </div>
        <button suppressHydrationWarning
          onClick={statPlaybook.onAction}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #ffe7da',
            background: '#f8f1ea',
            color: '#f1662a',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {statPlaybook.ctaLabel}
        </button>
      </div>

      <div
        style={{
          background: '#f7f2ee',
          borderRadius: '18px',
          border: '1px solid #d7cdc5',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '22px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #d7cdc5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1915' }}>
              Smart Queue - Token ETA Board
            </p>
            <p style={{ fontSize: '12px', color: '#8f8279', marginTop: '2px' }}>
              Avg consult: ~{averageConsultationMinutes} min - Waiting: {inQueueCount}
            </p>
            {emergencyQueueCount > 0 && (
              <p style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px', fontWeight: 700 }}>
                Emergency in queue: {emergencyQueueCount}
              </p>
            )}
          </div>
          <button suppressHydrationWarning
            onClick={callNextPatient}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #ffe7da',
              background: '#f8f1ea',
              color: '#f1662a',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Call Next Patient
          </button>
        </div>
        <div style={{ padding: '10px 12px' }}>
          {smartQueueRows.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#8f8279', padding: '8px' }}>
              No active tokens. Verify OTP for a patient to generate token and ETA.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {smartQueueRows.map((row) => (
                <div
                  key={`${row.patient.id}-${row.tokenNumber}-${row.updatedAt}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '96px 1.8fr 1fr 1fr',
                    gap: '12px',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: '1px solid #eee7df',
                    background: '#f5efea',
                    padding: '10px 12px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      background: '#fff1e8',
                      color: '#b84b1f',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {formatToken(row.tokenNumber)}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e1915' }}>
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
                    <p style={{ fontSize: '11px', color: '#8f8279' }}>
                      Checked-in{' '}
                      {new Date(row.checkedInAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p style={{ fontSize: '11px', color: '#8f8279' }}>
                      Assigned: {row.department} - {row.doctorName}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9c8f84', textTransform: 'uppercase' }}>
                      Queue State
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#5f544c' }}>
                      {row.stateLabel}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9c8f84', textTransform: 'uppercase' }}>
                      ETA
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e1915' }}>
                      {row.etaLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 2 column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Search & Patient Info */}
        <div>
          {/* Search Card */}
          <div
            ref={lookupSectionRef}
            style={{
              background: '#f7f2ee',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #d7cdc5',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#1e1915',
                marginBottom: '4px',
              }}
            >
              Patient Lookup
            </h3>
            <p
              style={{ fontSize: '13px', color: '#6f635b', marginBottom: '20px' }}
            >
              Search by mobile number to check-in a patient
            </p>

            {/* Search Input */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #d7cdc5',
                  background: '#f5efea',
                }}
              >
                <Phone size={18} color={THEME_ICON_MUTED} />
                <input suppressHydrationWarning
                  id="reception-mobile-search"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#1e1915',
                    width: '100%',
                  }}
                />
              </div>
              <button suppressHydrationWarning
                onClick={handleSearch}
                disabled={isSearching}
                style={{
                  padding: '14px 24px',
                  borderRadius: '16px',
                  border: `1px solid ${THEME_PRIMARY_BUTTON_BORDER}`,
                  background: THEME_PRIMARY_BUTTON_BG,
                  color: '#fffaf6',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: THEME_PRIMARY_BUTTON_SHADOW,
                }}
              >
                <Search size={16} />
                Search
              </button>
            </div>

            {/* Quick Demo Numbers */}
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '12px', color: '#9c8f84' }}>
                Try:
              </span>
              {[
                '9876543210',
                '9876543220',
                '9876543230',
                '9876543240',
                '9876543250',
                '9876543260',
                '9876543270',
                '9876543280',
              ].map((num) => (
                <button suppressHydrationWarning
                  key={num}
                  onClick={() => {
                    runSearchByMobile(num);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d7cdc5',
                    background: '#f5efea',
                    fontSize: '12px',
                    color: '#6f635b',
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {pendingConsents.length > 0 && (
            <div
              style={{
                background: '#f7f2ee',
                borderRadius: '16px',
                padding: '18px',
                border: '1px solid #fde68a',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                  Consent Worklist
                </p>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {pendingConsents.length} pending
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingConsents.slice(0, 5).map((entry) => (
                  <div
                    key={entry.patientId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '10px',
                      border: '1px solid #eee7df',
                      background: '#f5efea',
                      padding: '10px 12px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e1915' }}>
                        {entry.patientName}
                      </p>
                      <p style={{ fontSize: '11px', color: '#8f8279' }}>
                        +91 {entry.mobile} - OTP attempts: {entry.attempts}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button suppressHydrationWarning
                        onClick={() => runSearchByMobile(entry.mobile)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #d7cdc5',
                          background: '#f7f2ee',
                          color: '#5f544c',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Open
                      </button>
                      <button suppressHydrationWarning
                        onClick={() => {
                          const patient = getPatientById(entry.patientId);
                          if (!patient) return;
                          setFoundPatient(patient);
                          setSearchDone(true);
                          setSearchMobile(patient.mobile_number);
                          issueConsentOtp(patient, 'resend');
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e0a148',
                          background: '#fffbeb',
                          color: '#92400e',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Info Card */}
          <AnimatePresence>
            {searchDone && foundPatient && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#f7f2ee',
                  borderRadius: '20px',
                  padding: '28px',
                  border: consentGranted
                    ? '2px solid #49a26c'
                    : '1px solid #d7cdc5',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {/* Patient Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: THEME_AVATAR_BG,
                      border: `1px solid ${THEME_PRIMARY_BUTTON_BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fffaf6',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {foundPatient.avatar_initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1e1915',
                      }}
                    >
                      {foundPatient.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6f635b' }}>
                      {foundPatient.gender} - {getAge(foundPatient.date_of_birth)} years - Blood:{' '}
                      {foundPatient.blood_group}
                    </p>
                  </div>
                  {consentGranted && (
                    <div
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: '#d1fae5',
                        color: '#065f46',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <UserCheck size={14} />
                      {foundPatientQueueEntry
                        ? `${foundPatientQueueEntry.isEmergency ? 'Emergency - ' : ''}Token ${formatToken(foundPatientQueueEntry.tokenNumber)}`
                        : 'Records Synced'}
                    </div>
                  )}
                </div>

                {/* Patient Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  {[
                    { label: 'Mobile', value: `+91 ${foundPatient.mobile_number}` },
                    {
                      label: 'DOB',
                      value: new Date(foundPatient.date_of_birth).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      }),
                    },
                    { label: 'Address', value: foundPatient.address },
                    { label: 'Emergency', value: foundPatient.emergency_contact },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#f5efea',
                        border: '1px solid #eee7df',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9c8f84',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#1e1915',
                          fontWeight: 500,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Record Summary */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    marginBottom: '20px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#92400e',
                      fontWeight: 600,
                    }}
                  >
                    Records: {recordCount} past records found across{' '}
                    {sourceFacilities.length} facility(s)
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {sourceFacilities.map((fId) => {
                      const fac = facilities.find((f) => f.id === fId);
                      return (
                        <span
                          key={fId}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#fef3c7',
                            fontSize: '11px',
                            color: '#92400e',
                            fontWeight: 500,
                          }}
                        >
                          Facility: {fac?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {!consentGranted && (
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: isEmergencyCase ? '#fef2f2' : '#f5efea',
                      border: isEmergencyCase ? '1px solid #fecaca' : '1px solid #d7cdc5',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} color={isEmergencyCase ? '#dc2626' : THEME_ICON_MUTED} />
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isEmergencyCase ? '#7f1d1d' : '#5f544c',
                          }}
                        >
                          Emergency Case Priority
                        </p>
                      </div>
                      <button suppressHydrationWarning
                        onClick={() => setIsEmergencyCase((prev) => !prev)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '10px',
                          border: isEmergencyCase ? '1px solid #f87171' : '1px solid #d7cdc5',
                          background: isEmergencyCase ? '#fee2e2' : '#f7f2ee',
                          color: isEmergencyCase ? '#b91c1c' : '#6f635b',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {isEmergencyCase ? 'Emergency Enabled' : 'Mark Emergency'}
                      </button>
                    </div>
                    <input suppressHydrationWarning
                      type="text"
                      placeholder="Optional reason (e.g. chest pain, severe bleeding, trauma)"
                      value={emergencyReason}
                      onChange={(event) => setEmergencyReason(event.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d7cdc5',
                        fontSize: '12px',
                        color: '#1e1915',
                        background: '#f7f2ee',
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#f5efea',
                    border: '1px solid #d7cdc5',
                    marginBottom: '20px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1e1915',
                      marginBottom: '10px',
                    }}
                  >
                    Doctor Assignment
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select
                      suppressHydrationWarning
                      value={selectedDepartment}
                      onChange={(event) => {
                        const nextDepartment = event.target.value;
                        setSelectedDepartment(nextDepartment);
                        const activeDoctor = getDoctorById(selectedDoctorId);
                        if (!activeDoctor || activeDoctor.specialty !== nextDepartment) {
                          setSelectedDoctorId('');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d7cdc5',
                        fontSize: '12px',
                        color: '#1e1915',
                        background: '#f7f2ee',
                      }}
                    >
                      <option value="">Select department</option>
                      {departmentOptions.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                    <select
                      suppressHydrationWarning
                      value={selectedDoctorId}
                      onChange={(event) => setSelectedDoctorId(event.target.value)}
                      disabled={!selectedDepartment}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d7cdc5',
                        fontSize: '12px',
                        color: !selectedDepartment ? '#9c8f84' : '#1e1915',
                        background: !selectedDepartment ? '#ece4dc' : '#f7f2ee',
                      }}
                    >
                      <option value="">
                        {selectedDepartment ? 'Select doctor' : 'Choose department first'}
                      </option>
                      {doctorsForSelectedDepartment.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '11px', color: '#8f8279' }}>
                    {selectedDoctorId
                      ? `Assigned to ${getDoctorById(selectedDoctorId)?.name ?? 'selected doctor'} (${
                          getDoctorById(selectedDoctorId)?.specialty ?? 'Department'
                        })`
                      : 'Select department and doctor before OTP handover.'}
                  </p>
                </div>

                {/* Action Buttons */}
                {!consentGranted ? (
                  !showOTP ? (
                    <button suppressHydrationWarning
                      onClick={handleRequestConsent}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        border: 'none',
                        background:
                          'linear-gradient(135deg, #f1662a, #dc5c24)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(15,118,110,0.25)',
                      }}
                    >
                      <Shield size={18} />
                      Request Patient Consent (Send OTP)
                    </button>
                  ) : (
                    /* OTP Input */
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#6f635b',
                          textAlign: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        Enter the 4-digit OTP sent to patient&apos;s mobile
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          justifyContent: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        {otpDigits.map((digit, i) => (
                          <input suppressHydrationWarning
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOTPChange(i, e.target.value.replace(/\D/g, ''))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !digit && i > 0) {
                                document.getElementById(`otp-${i - 1}`)?.focus();
                              }
                            }}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '14px',
                              border: '2px solid #d7cdc5',
                              textAlign: 'center',
                              fontSize: '22px',
                              fontWeight: 700,
                              color: '#1e1915',
                              background: '#f5efea',
                            }}
                          />
                        ))}
                      </div>
                      <button suppressHydrationWarning
                        onClick={handleVerifyOTP}
                        disabled={otpDigits.some((d) => !d)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '14px',
                          border: 'none',
                          background: otpDigits.every((d) => d)
                            ? 'linear-gradient(135deg, #f1662a, #dc5c24)'
                            : '#d7cdc5',
                          color: otpDigits.every((d) => d)
                            ? '#fff'
                            : '#9c8f84',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Verify & Grant Access
                      </button>
                      <button suppressHydrationWarning
                        onClick={() => {
                          if (foundPatient) issueConsentOtp(foundPatient, 'resend');
                        }}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '12px',
                          border: '1px solid #d7cdc5',
                          background: '#f5efea',
                          color: '#6f635b',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Resend OTP
                      </button>
                    </motion.div>
                  )
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '14px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #49a26c, #059669)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                    }}
                  >
                    Patient Ready for Doctor
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Patient Queue */}
        <div
          ref={queueSectionRef}
          style={{
            background: '#f7f2ee',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #d7cdc5',
            boxShadow: 'var(--shadow-md)',
            height: 'fit-content',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e1915',
                }}
              >
                Patient Queue
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6f635b',
                  marginTop: '2px',
                }}
              >
                Today&apos;s checked-in patients
              </p>
            </div>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: '#f8f1ea',
                color: '#f1662a',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {sortedFilteredQueue.length} shown
            </span>
          </div>

          {sortedFilteredQueue.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: '16px',
                background: '#f5efea',
                border: '1px dashed #d7cdc5',
              }}
            >
              <Clock
                size={40}
                color={THEME_ICON_MUTED}
                style={{ margin: '0 auto 12px' }}
              />
              <p style={{ fontSize: '14px', color: '#6f635b', fontWeight: 500 }}>
                {queueEmptyTitle}
              </p>
              <p style={{ fontSize: '13px', color: '#9c8f84', marginTop: '4px' }}>
                {queueEmptySubtitle}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedFilteredQueue.map((q) => (
                <div
                  key={q.patient.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#f5efea',
                    border: '1px solid #d7cdc5',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: THEME_AVATAR_BG,
                      border: `1px solid ${THEME_PRIMARY_BUTTON_BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fffaf6',
                      fontSize: '13px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {q.patient.avatar_initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1e1915',
                      }}
                    >
                      {q.patient.name}
                    </p>
                    {q.isEmergency && (
                      <span
                        style={{
                          display: 'inline-flex',
                          marginTop: '3px',
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
                    <p style={{ fontSize: '12px', color: '#6f635b' }}>
                      {q.patient.gender} -{' '}
                      {getAge(q.patient.date_of_birth)} yrs
                    </p>
                    <p style={{ fontSize: '11px', color: '#8f8279' }}>
                      {q.department} - {q.doctorName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9c8f84', marginTop: '2px' }}>
                      {formatToken(q.tokenNumber)} - Waiting: {getWaitingMinutes(q.checkedInAt)} min
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: queueStatusStyles[q.status].bg,
                      color: queueStatusStyles[q.status].color,
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {queueStatusStyles[q.status].label}
                  </div>
                  <ArrowRight size={16} color={THEME_ICON_MUTED} />
                </div>
              ))}
            </div>
          )}

          {completedPatients.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6f635b',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Recently Diagnosed
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedPatients.map((entry) => (
                  <div
                    key={`${entry.patient.id}-${entry.completedAt}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#eaf5ed',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>
                        {entry.patient.name} - {formatToken(entry.tokenNumber)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#166534' }}>
                        Completed at{' '}
                        {new Date(entry.completedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: '#22c55e',
                        color: '#f7f2ee',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



