'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, ClipboardList, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'reception' | 'doctor' | null>(null);
  const [hospitalCode, setHospitalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/${selectedRole}`);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 30%, #e0e7ff 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow:
            '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(15,118,110,0.3)',
            }}
          >
            <Heart size={32} color="#ffffff" fill="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}
          >
            SwasthSetu
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#475569',
              marginTop: '8px',
              lineHeight: 1.5,
            }}
          >
            Care Continuity Platform for Rural India
          </p>
        </div>

        {/* Hospital Code Input */}
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
            Hospital / Facility Code
          </label>
          <input
            type="text"
            placeholder="e.g. CCH-INDORE-001"
            value={hospitalCode}
            onChange={(e) => setHospitalCode(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              fontSize: '14px',
              color: '#0f172a',
              background: '#f8fafc',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#0f766e')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          />
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '12px',
            }}
          >
            Select Your Role
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Reception Card */}
            <button
              onClick={() => setSelectedRole('reception')}
              style={{
                flex: 1,
                padding: '20px 16px',
                borderRadius: '16px',
                border: `2px solid ${
                  selectedRole === 'reception' ? '#0f766e' : '#e2e8f0'
                }`,
                background:
                  selectedRole === 'reception' ? '#f0fdfa' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background:
                    selectedRole === 'reception'
                      ? 'linear-gradient(135deg, #0f766e, #14b8a6)'
                      : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <ClipboardList
                  size={22}
                  color={selectedRole === 'reception' ? '#fff' : '#475569'}
                />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color:
                    selectedRole === 'reception' ? '#0f766e' : '#475569',
                }}
              >
                Reception
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Patient check-in & consent
              </span>
            </button>

            {/* Doctor Card */}
            <button
              onClick={() => setSelectedRole('doctor')}
              style={{
                flex: 1,
                padding: '20px 16px',
                borderRadius: '16px',
                border: `2px solid ${
                  selectedRole === 'doctor' ? '#0f766e' : '#e2e8f0'
                }`,
                background:
                  selectedRole === 'doctor' ? '#f0fdfa' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background:
                    selectedRole === 'doctor'
                      ? 'linear-gradient(135deg, #0f766e, #14b8a6)'
                      : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Stethoscope
                  size={22}
                  color={selectedRole === 'doctor' ? '#fff' : '#475569'}
                />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color:
                    selectedRole === 'doctor' ? '#0f766e' : '#475569',
                }}
              >
                Doctor
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                View records & prescribe
              </span>
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedRole || isLoading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background:
              selectedRole
                ? 'linear-gradient(135deg, #0f766e, #0d6560)'
                : '#e2e8f0',
            color: selectedRole ? '#ffffff' : '#94a3b8',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: selectedRole
              ? '0 4px 14px rgba(15,118,110,0.3)'
              : 'none',
          }}
        >
          {isLoading ? (
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          ) : (
            <>
              Enter Dashboard
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '24px',
          }}
        >
          Powered by ABDM · Made for Rural India 🇮🇳
        </p>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
