'use client';

import { useState } from 'react';
import { Users, Clock, FileText, Activity, ArrowRight, Stethoscope } from 'lucide-react';
import { Patient, patients, getAge, getRecordsByPatientId } from '@/data/mock-data';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStat, setActiveStat] = useState('Patients Today');
  const [actionMessage, setActionMessage] = useState('');

  const stats = [
    {
      label: 'Patients Today',
      value: '12',
      icon: Users,
      color: '#0f766e',
      bg: '#f0fdfa',
      filter: () => true,
      message: 'Showing all patients for today.',
    },
    {
      label: 'Pending Review',
      value: '5',
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
      filter: (patient: Patient) => getRecordsByPatientId(patient.id).length <= 2,
      message: 'Showing patients pending review.',
    },
    {
      label: 'Records Accessed',
      value: '28',
      icon: FileText,
      color: '#3b82f6',
      bg: '#eff6ff',
      filter: (patient: Patient) => getRecordsByPatientId(patient.id).length > 0,
      message: 'Showing patients with accessed records.',
    },
    {
      label: 'Consultations Done',
      value: '7',
      icon: Activity,
      color: '#10b981',
      bg: '#ecfdf5',
      filter: (patient: Patient) => getRecordsByPatientId(patient.id).length > 1,
      message: 'Showing patients with completed consultations.',
    },
  ];

  // For demo, show all patients as having records (and allow stat filters)
  const patientList = patients
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile_number.includes(searchTerm)
    )
    .filter((p) => {
      const stat = stats.find((s) => s.label === activeStat);
      return stat ? stat.filter(p) : true;
    });

  return (
    <div>
      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
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
              All Patients
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              Click on a patient to view their complete medical timeline
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
            gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1fr 0.5fr',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#f8fafc',
            marginBottom: '8px',
          }}
        >
          {['Patient', 'Mobile', 'Age', 'Gender', 'Records', ''].map((h) => (
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
          {patientList.map((patient, i) => {
            const records = getRecordsByPatientId(patient.id);
            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/doctor/patient/${patient.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1fr 0.5fr',
                    padding: '16px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
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
                      {patient.avatar_initials}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {patient.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {patient.blood_group}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569' }}>
                    +91 {patient.mobile_number}
                  </p>
                  <p style={{ fontSize: '13px', color: '#475569' }}>
                    {getAge(patient.date_of_birth)} yrs
                  </p>
                  <p style={{ fontSize: '13px', color: '#475569' }}>
                    {patient.gender}
                  </p>
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
                  <ArrowRight size={16} color="#94a3b8" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
