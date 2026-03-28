'use client';

import { useState } from 'react';
import { Search, Phone, UserCheck, Clock, ArrowRight, Shield, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  patients,
  getPatientByMobile,
  getAge,
  getRecordsByPatientId,
  generateOTP,
  facilities,
  type Patient,
} from '@/data/mock-data';
import Link from 'next/link';

export default function ReceptionPage() {
  const [searchMobile, setSearchMobile] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [consentGranted, setConsentGranted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [queuedPatients, setQueuedPatients] = useState<
    { patient: Patient; status: 'Waiting' | 'RecordsSynced' | 'InConsultation' }[]
  >([]);

  const handleSearch = () => {
    if (searchMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSearching(true);
    setConsentGranted(false);
    setShowOTP(false);
    setOtpDigits(['', '', '', '']);
    setTimeout(() => {
      const patient = getPatientByMobile(searchMobile);
      setFoundPatient(patient || null);
      setSearchDone(true);
      setIsSearching(false);
      if (patient) {
        toast.success(`Patient found: ${patient.name}`);
      } else {
        toast.error('No patient found with this mobile number');
      }
    }, 600);
  };

  const handleRequestConsent = () => {
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setShowOTP(true);
    toast.info(`OTP sent to patient's mobile: ****${searchMobile.slice(-4)}`, {
      description: `Demo OTP: ${otp}`,
      duration: 10000,
    });
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

  const handleVerifyOTP = () => {
    const enteredOTP = otpDigits.join('');
    if (enteredOTP === generatedOTP) {
      setConsentGranted(true);
      toast.success('Consent granted! Records are now accessible.', {
        description: 'Access valid for 24 hours',
        duration: 5000,
      });
      // Add patient to queue
      if (foundPatient) {
        setQueuedPatients((prev) => [
          ...prev.filter((q) => q.patient.id !== foundPatient.id),
          { patient: foundPatient, status: 'RecordsSynced' },
        ]);
      }
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const recordCount = foundPatient
    ? getRecordsByPatientId(foundPatient.id).length
    : 0;

  const sourceFacilities = foundPatient
    ? [
        ...new Set(
          getRecordsByPatientId(foundPatient.id).map((r) => r.facility_id)
        ),
      ]
    : [];

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
        {[
          {
            label: 'Patients Today',
            value: '24',
            icon: Users,
            color: '#0f766e',
            bg: '#f0fdfa',
          },
          {
            label: 'Consents Pending',
            value: '3',
            icon: Shield,
            color: '#f59e0b',
            bg: '#fffbeb',
          },
          {
            label: 'Records Synced',
            value: '18',
            icon: FileText,
            color: '#3b82f6',
            bg: '#eff6ff',
          },
          {
            label: 'In Queue',
            value: String(queuedPatients.length),
            icon: Clock,
            color: '#8b5cf6',
            bg: '#f5f3ff',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
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
                  color: '#0f172a',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content - 2 column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Search & Patient Info */}
        <div>
          {/* Search Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              Patient Lookup
            </h3>
            <p
              style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}
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
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                <Phone size={18} color="#94a3b8" />
                <input
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
                    color: '#0f172a',
                    width: '100%',
                  }}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                style={{
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0f766e, #0d6560)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15,118,110,0.25)',
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
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Try:
              </span>
              {['9876543210', '9876543230', '9876543250'].map((num) => (
                <button
                  key={num}
                  onClick={() => { setSearchMobile(num); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '12px',
                    color: '#475569',
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Info Card */}
          <AnimatePresence>
            {searchDone && foundPatient && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '28px',
                  border: consentGranted
                    ? '2px solid #10b981'
                    : '1px solid #e2e8f0',
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
                      background:
                        'linear-gradient(135deg, #0f766e, #14b8a6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
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
                        color: '#0f172a',
                      }}
                    >
                      {foundPatient.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#475569' }}>
                      {foundPatient.gender} · {getAge(foundPatient.date_of_birth)}{' '}
                      years · Blood: {foundPatient.blood_group}
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
                      Records Synced
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
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#94a3b8',
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
                          color: '#0f172a',
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
                    📋 {recordCount} past records found across{' '}
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
                          🏥 {fac?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                {!consentGranted ? (
                  !showOTP ? (
                    <button
                      onClick={handleRequestConsent}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        border: 'none',
                        background:
                          'linear-gradient(135deg, #0f766e, #0d6560)',
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
                          color: '#475569',
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
                          <input
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
                              border: '2px solid #e2e8f0',
                              textAlign: 'center',
                              fontSize: '22px',
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#f8fafc',
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpDigits.some((d) => !d)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '14px',
                          border: 'none',
                          background: otpDigits.every((d) => d)
                            ? 'linear-gradient(135deg, #0f766e, #0d6560)'
                            : '#e2e8f0',
                          color: otpDigits.every((d) => d)
                            ? '#fff'
                            : '#94a3b8',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Verify & Grant Access
                      </button>
                    </motion.div>
                  )
                ) : (
                  <Link
                    href={`/doctor/patient/${foundPatient.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '14px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                    }}
                  >
                    View Patient Timeline
                    <ArrowRight size={16} />
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Patient Queue */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #e2e8f0',
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
                  color: '#0f172a',
                }}
              >
                Patient Queue
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#475569',
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
                background: '#f0fdfa',
                color: '#0f766e',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {queuedPatients.length} in queue
            </span>
          </div>

          {queuedPatients.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px dashed #e2e8f0',
              }}
            >
              <Clock
                size={40}
                color="#94a3b8"
                style={{ margin: '0 auto 12px' }}
              />
              <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                No patients in queue yet
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Search and verify a patient to add them
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {queuedPatients.map((q) => (
                <Link
                  href={`/doctor/patient/${q.patient.id}`}
                  key={q.patient.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0fdfa';
                    e.currentTarget.style.borderColor = '#99f6e4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background:
                        'linear-gradient(135deg, #0f766e, #14b8a6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
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
                        color: '#0f172a',
                      }}
                    >
                      {q.patient.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>
                      {q.patient.gender} ·{' '}
                      {getAge(q.patient.date_of_birth)} yrs
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#d1fae5',
                      color: '#065f46',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Synced
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
