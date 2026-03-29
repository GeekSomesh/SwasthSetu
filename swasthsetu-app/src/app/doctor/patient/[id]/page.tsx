'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
  Building2,
  User,
  Pill,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import {
  getPatientById,
  getRecordsByPatientId,
  getAge,
  getFacilityById,
  getDoctorById,
  medicalRecords,
  type MedicalRecord,
  type RecordType,
} from '@/data/mock-data';

const recordTypeConfig: Record<
  RecordType,
  { icon: typeof FileText; label: string; bgColor: string; textColor: string; emoji: string }
> = {
  Prescription: {
    icon: Pill,
    label: 'Prescription',
    bgColor: '#e0e7ff',
    textColor: '#3730a3',
    emoji: '💊',
  },
  LabReport: {
    icon: FlaskConical,
    label: 'Lab Report',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    emoji: '🧪',
  },
  Scan: {
    icon: ScanLine,
    label: 'Scan / Imaging',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    emoji: '📷',
  },
  DischargeSummary: {
    icon: ClipboardList,
    label: 'Discharge Summary',
    bgColor: '#fce7f3',
    textColor: '#9d174d',
    emoji: '🏥',
  },
};

export default function PatientTimelinePage() {
  const params = useParams();
  const patientId = params.id as string;
  const patient = getPatientById(patientId);
  const initialRecords = getRecordsByPatientId(patientId);

  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [activeFilter, setActiveFilter] = useState<RecordType | 'All'>('All');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [newVisitData, setNewVisitData] = useState({
    diagnosis: '',
    medications: '',
    notes: '',
    followUp: '',
  });

  if (!patient) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#475569' }}>Patient not found</p>
        <Link href="/doctor" style={{ color: '#0f766e', marginTop: '16px', display: 'inline-block' }}>
          ← Back to Dashboard
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

  const handleNewVisitSubmit = () => {
    const parsedMedications = newVisitData.medications
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patient_id: patient?.id ?? patientId,
      facility_id: getDoctorById('doc-001')?.facility_id ?? 'fac-001',
      doctor_id: getDoctorById('doc-001')?.id ?? 'doc-001',
      record_type: 'Prescription',
      date: new Date().toISOString(),
      title: `Visit Note - ${new Date().toLocaleDateString('en-IN')}`,
      document_url: '/mock/prescription-new.png',
      notes: newVisitData.notes || 'Clinical notes recorded.',
      diagnosis: newVisitData.diagnosis || 'N/A',
      medications: parsedMedications.length > 0 ? parsedMedications : ['No medications entered.'],
    };

    // Keep in-memory data for current UI
    setRecords((prev) => [newRecord, ...prev]);

    // Optional external sync: keep module-level array updated for other components
    // (this is a demo in-memory store, not persistent)
    medicalRecords.unshift(newRecord);

    toast.success('Visit note saved & synced to patient timeline!', {
      description: 'Added as a prescription record for this patient.',
      duration: 5000,
    });

    setShowNewVisit(false);
    setNewVisitData({ diagnosis: '', medications: '', notes: '', followUp: '' });
  };

  return (
    <div>
      {/* Back Button + Patient Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/doctor"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#475569',
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
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
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
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                {patient.gender} · {getAge(patient.date_of_birth)} years · Blood Group:{' '}
                {patient.blood_group} · Mobile: +91 {patient.mobile_number}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowNewVisit(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0f766e, #0d6560)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15,118,110,0.25)',
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
            color: '#94a3b8',
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
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive
                  ? config
                    ? config.bgColor
                    : '#0f766e'
                  : 'transparent',
                color: isActive
                  ? config
                    ? config.textColor
                    : '#ffffff'
                  : '#475569',
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
                  e.currentTarget.style.borderColor = '#99f6e4';
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
                      color: '#475569',
                      fontSize: '13px',
                    }}
                  >
                    <Calendar size={14} />
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
                    <Building2 size={14} color="#0f766e" />
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
                    <User size={14} color="#3b82f6" />
                    <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>
                      {doctor?.name || 'Unknown Doctor'}
                      {doctor?.specialty && (
                        <span style={{ color: '#94a3b8' }}> · {doctor.specialty}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
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
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
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
                          <Pill size={12} color="#0f766e" />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#0f766e',
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
                                background: '#ccfbf1',
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecord(record);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#0f766e',
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
            <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '15px', color: '#475569', fontWeight: 500 }}>
              No records found for this filter
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
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
                <button
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
                  <X size={18} color="#475569" />
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
                  <Calendar size={14} color="#475569" />
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {new Date(selectedRecord.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="#0f766e" />
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {getFacilityById(selectedRecord.facility_id)?.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#3b82f6" />
                  <span style={{ fontSize: '12px', color: '#475569' }}>
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
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Document preview · {selectedRecord.document_url}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
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
                      color: '#94a3b8',
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
                      background: '#f0fdfa',
                      border: '1px solid #ccfbf1',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f766e',
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
                            background: '#ccfbf1',
                          }}
                        >
                          <Pill size={14} color="#0f766e" />
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
                  background: 'linear-gradient(135deg, #f0fdfa, #f8fafc)',
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
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    For {patient.name} · {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button
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
                  <X size={18} color="#475569" />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '8px',
                    }}
                  >
                    Diagnosis
                  </label>
                  <input
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
                      color: '#475569',
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
                      color: '#475569',
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
                      color: '#475569',
                      marginBottom: '8px',
                    }}
                  >
                    Follow-up Date
                  </label>
                  <input
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

                <button
                  onClick={handleNewVisitSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0f766e, #0d6560)',
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
