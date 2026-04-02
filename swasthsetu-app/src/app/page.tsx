'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, ClipboardList, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { persistRoleCookie, ROLE_HOME } from '@/lib/auth';
import { doctors, getDoctorById } from '@/data/mock-data';
import { DEMO_DOCTOR_PASSCODE_BY_ID } from '@/data/demo-doctor-passcodes';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'reception' | 'doctor' | null>(null);
  const [hospitalCode, setHospitalCode] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorPasscode, setDoctorPasscode] = useState('');
  const [showDemoPasscodes, setShowDemoPasscodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const departmentOptions = useMemo(
    () =>
      [...new Set(doctors.map((doctor) => doctor.specialty))].sort((a, b) =>
        a.localeCompare(b, 'en-IN')
      ),
    []
  );

  const doctorOptions = useMemo(
    () =>
      doctors.filter((doctor) =>
        selectedDepartment ? doctor.specialty === selectedDepartment : true
      ),
    [selectedDepartment]
  );

  const selectedDoctor = selectedDoctorId ? getDoctorById(selectedDoctorId) : null;
  const demoPasscodeRows = useMemo(
    () =>
      doctors.map((doctor) => ({
        ...doctor,
        passcode: DEMO_DOCTOR_PASSCODE_BY_ID[doctor.id] ?? '----',
      })),
    []
  );
  const canSubmit =
    selectedRole === 'doctor'
      ? Boolean(selectedDepartment && selectedDoctorId && doctorPasscode.trim().length >= 4)
      : Boolean(selectedRole);

  const handleLogin = async () => {
    if (!selectedRole) return;
    if (selectedRole === 'doctor' && !selectedDoctorId) return;

    setIsLoading(true);
    if (selectedRole === 'doctor') {
      try {
        const response = await fetch('/api/auth/doctor-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorId: selectedDoctorId,
            department: selectedDepartment,
            passcode: doctorPasscode,
            hospitalCode,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? 'Doctor login failed');
        }

        setTimeout(() => {
          router.push(ROLE_HOME.doctor);
        }, 400);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Doctor authentication failed';
        toast.error(message);
        setIsLoading(false);
        return;
      }
    }

    await fetch('/api/auth/doctor-logout', { method: 'POST' }).catch(() => null);
    persistRoleCookie(selectedRole);
    setTimeout(() => {
      router.push(ROLE_HOME[selectedRole]);
    }, 800);
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <section className="hero-panel">
          <div className="hero-badge">
            <Heart size={18} color="#fff7f2" fill="#fff7f2" />
            <span>SwasthSetu Platform</span>
          </div>

          <h1>Clinical workflow console for reception and doctors.</h1>
          <p>
            Manage patient check-ins, queue routing, consultation notes, and continuity records from one
            focused dashboard.
          </p>

          <div className="hero-grid">
            <div className="hero-tile">
              <div className="hero-icon">
                <ClipboardList size={18} />
              </div>
              <div>
                <h3>Reception Flow</h3>
                <p>OTP lookup, consent, queue, and emergency triage.</p>
              </div>
            </div>

            <div className="hero-tile">
              <div className="hero-icon">
                <Stethoscope size={18} />
              </div>
              <div>
                <h3>Doctor Flow</h3>
                <p>Pending review, timeline access, and structured prescriptions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-head">
              <div className="auth-logo">
                <Heart size={22} color="#fff7f2" fill="#fff7f2" />
              </div>
              <div>
                <h2>Sign in to workspace</h2>
                <p>Choose your desk role and continue</p>
              </div>
            </div>

            <div className="field">
              <label>Hospital / Facility Code</label>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="e.g. CCH-INDORE-001"
                value={hospitalCode}
                onChange={(e) => setHospitalCode(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Select role</label>
              <div className="role-grid">
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setSelectedRole('reception');
                    setDoctorPasscode('');
                    setShowDemoPasscodes(false);
                  }}
                  className={`role-btn ${selectedRole === 'reception' ? 'is-active' : ''}`}
                >
                  <span className="role-icon">
                    <ClipboardList size={20} />
                  </span>
                  <strong>Reception</strong>
                  <small>Check-in and consent</small>
                </button>

                <button
                  suppressHydrationWarning
                  onClick={() => setSelectedRole('doctor')}
                  className={`role-btn ${selectedRole === 'doctor' ? 'is-active' : ''}`}
                >
                  <span className="role-icon">
                    <Stethoscope size={20} />
                  </span>
                  <strong>Doctor</strong>
                  <small>Review and prescribe</small>
                </button>
              </div>
            </div>
            {selectedRole === 'doctor' && (
              <div className="field">
                <label>Doctor Login Details</label>
                <div className="field-grid">
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
                  >
                    <option value="">
                      {selectedDepartment ? 'Select doctor' : 'Choose department first'}
                    </option>
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="field-hint">
                  {selectedDoctor
                    ? `${selectedDoctor.name} - ${selectedDoctor.specialty} (${selectedDoctor.qualification})`
                    : 'Doctor dashboard will open with this selected doctor profile.'}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <input
                    suppressHydrationWarning
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter doctor access passcode"
                    value={doctorPasscode}
                    onChange={(event) => {
                      const sanitized = event.target.value.replace(/\D/g, '').slice(0, 6);
                      setDoctorPasscode(sanitized);
                    }}
                  />
                </div>
                <p className="field-hint">
                  Access is protected. Contact hospital admin for your doctor passcode.
                </p>
                <button
                  suppressHydrationWarning
                  type="button"
                  className="passcode-link-btn"
                  onClick={() => setShowDemoPasscodes(true)}
                >
                  View Demo Passcodes (Prototype)
                </button>
              </div>
            )}

            <button
              suppressHydrationWarning
              onClick={handleLogin}
              disabled={!canSubmit || isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="loader" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Continue to Dashboard</span>
                  <span className="submit-icon-wrap">
                    <ArrowRight size={16} />
                  </span>
                </>
              )}
            </button>

            <p className="auth-foot">Powered by ABDM - Built for rural care delivery</p>
          </div>
        </section>
      </motion.div>

      {showDemoPasscodes && (
        <div className="passcode-modal-overlay">
          <div className="passcode-modal">
            <div className="passcode-modal-head">
              <div>
                <p className="passcode-modal-title">Prototype Doctor Passcodes</p>
                <p className="passcode-modal-subtitle">
                  Use these only for demo login testing.
                </p>
              </div>
              <button
                suppressHydrationWarning
                type="button"
                className="passcode-close-btn"
                onClick={() => setShowDemoPasscodes(false)}
                aria-label="Close passcode popup"
              >
                <X size={16} />
              </button>
            </div>
            <div className="passcode-list">
              {demoPasscodeRows.map((row) => (
                <div key={row.id} className="passcode-row">
                  <div>
                    <p className="passcode-row-name">{row.name}</p>
                    <p className="passcode-row-meta">{row.specialty}</p>
                  </div>
                  <div className="passcode-row-right">
                    <code>{row.passcode}</code>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className="passcode-use-btn"
                      onClick={() => {
                        setSelectedRole('doctor');
                        setSelectedDepartment(row.specialty);
                        setSelectedDoctorId(row.id);
                        setDoctorPasscode(row.passcode);
                        setShowDemoPasscodes(false);
                        toast.success(`Loaded ${row.name} demo passcode`);
                      }}
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #f8f5f1;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          overflow: auto;
        }

        .login-shell {
          width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .hero-panel {
          background:
            radial-gradient(circle at 12% 14%, rgba(241, 102, 42, 0.18), transparent 34%),
            radial-gradient(circle at 78% 72%, rgba(241, 102, 42, 0.14), transparent 38%),
            linear-gradient(155deg, #171310 0%, #211913 55%, #2b1d13 100%);
          color: #fff7f2;
          padding: 50px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }

        .hero-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.07);
          font-size: 14px;
          font-weight: 700;
        }

        .hero-panel h1 {
          margin-top: 30px;
          font-size: clamp(52px, 4.9vw, 72px);
          line-height: 1.04;
          letter-spacing: -0.035em;
          max-width: 640px;
        }

        .hero-panel p {
          margin-top: 16px;
          font-size: 17px;
          line-height: 1.58;
          color: rgba(255, 247, 242, 0.88);
          max-width: 620px;
        }

        .hero-grid {
          margin-top: 38px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          max-width: 720px;
        }

        .hero-tile {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.07);
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          backdrop-filter: blur(2px);
        }

        .hero-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.12);
          display: grid;
          place-items: center;
          color: #fff7f2;
        }

        .hero-tile h3 {
          font-size: 17px;
          margin-bottom: 4px;
        }

        .hero-tile p {
          margin: 0;
          font-size: 14px;
          line-height: 1.45;
          color: rgba(255, 247, 242, 0.8);
        }

        .auth-panel {
          padding: 36px 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f5f1;
          min-width: 0;
        }

        .auth-card {
          width: 100%;
          max-width: 520px;
          background: #fbf7f3;
          border: 1px solid #d8cec5;
          border-radius: 30px;
          padding: 30px 28px 26px;
          box-shadow: 0 28px 46px -36px rgba(53, 39, 24, 0.64);
        }

        .auth-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .auth-logo {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(145deg, #f1662a, #dc5c24);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .auth-head h2 {
          color: #1e1915;
          font-size: 26px;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
          font-family: var(--font-nunito), 'Segoe UI', sans-serif;
          font-weight: 700;
        }

        .auth-head p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6f635b;
          font-weight: 400;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #6f635b;
          margin-bottom: 10px;
        }

        .field input {
          width: 100%;
          border-radius: 14px;
          border: 1.5px solid #d7cdc5;
          background: #f5efea;
          color: #1e1915;
          font-size: 16px;
          padding: 14px 16px;
          outline: none;
        }

        .field input:focus {
          border-color: #f1662a;
        }

        .field select {
          width: 100%;
          border-radius: 14px;
          border: 1.5px solid #d7cdc5;
          background: #f5efea;
          color: #1e1915;
          font-size: 15px;
          padding: 14px 16px;
          outline: none;
        }

        .field select:focus {
          border-color: #f1662a;
        }

        .field select:disabled {
          color: #9c8f84;
          background: #ece4dc;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .field-hint {
          margin-top: 8px;
          font-size: 12px;
          color: #8b7d72;
        }

        .passcode-link-btn {
          margin-top: 8px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #ffd8c6;
          background: #fff1e8;
          color: #c14f20;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .passcode-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 12, 9, 0.38);
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 120;
        }

        .passcode-modal {
          width: 100%;
          max-width: 560px;
          border-radius: 20px;
          border: 1px solid #e4d6cb;
          background: #fbf7f3;
          box-shadow: 0 22px 36px -22px rgba(53, 39, 24, 0.68);
          padding: 16px;
        }

        .passcode-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .passcode-modal-title {
          font-size: 16px;
          font-weight: 800;
          color: #1e1915;
        }

        .passcode-modal-subtitle {
          font-size: 12px;
          color: #7e7167;
          margin-top: 2px;
        }

        .passcode-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid #d7cdc5;
          background: #f5efea;
          color: #6f635b;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .passcode-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 420px;
          overflow: auto;
          padding-right: 2px;
        }

        .passcode-row {
          border-radius: 12px;
          border: 1px solid #e9ddd3;
          background: #f7f2ee;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .passcode-row-name {
          font-size: 13px;
          font-weight: 700;
          color: #1e1915;
        }

        .passcode-row-meta {
          font-size: 11px;
          color: #7e7167;
          margin-top: 2px;
        }

        .passcode-row-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .passcode-row-right code {
          font-size: 13px;
          font-weight: 800;
          color: #b84b1f;
          background: #fff1e8;
          border: 1px solid #ffd8c6;
          border-radius: 8px;
          padding: 4px 8px;
        }

        .passcode-use-btn {
          padding: 6px 9px;
          border-radius: 8px;
          border: 1px solid #d7cdc5;
          background: #f5efea;
          color: #5f544c;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .role-btn {
          border: 1.5px solid #d7cdc5;
          background: #f7f2ee;
          border-radius: 16px;
          padding: 16px 12px;
          min-height: 136px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6f635b;
        }

        .role-btn.is-active {
          border-color: #f1662a;
          background: #fff1e8;
          color: #f1662a;
        }

        .role-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #eee7df;
        }

        .role-btn.is-active .role-icon {
          background: linear-gradient(145deg, #f1662a, #dc5c24);
          color: #fff7f2;
        }

        .role-btn strong {
          font-size: 16px;
          line-height: 1;
        }

        .role-btn small {
          font-size: 12px;
          color: #9c8f84;
          text-align: center;
        }

        .submit-btn {
          margin-top: 8px;
          width: 100%;
          padding: 15px 16px;
          border-radius: 14px;
          border: 1px solid #cf551f;
          background: linear-gradient(145deg, #f1662a, #d95a22);
          color: #fff9f5;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow:
            0 14px 26px -18px rgba(220, 92, 36, 0.86),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          border-color: #d7cdc5;
          background: #d9d2cb;
          color: #8f8378;
          box-shadow: none;
        }

        .loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 247, 242, 0.35);
          border-top-color: #fff7f2;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .submit-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.36);
          background: rgba(255, 255, 255, 0.12);
          display: grid;
          place-items: center;
        }

        .auth-foot {
          margin-top: 16px;
          text-align: center;
          font-size: 13px;
          color: #9c8f84;
        }

        @media (max-width: 1220px) {
          .hero-panel h1 {
            font-size: clamp(42px, 4.6vw, 58px);
          }

          .hero-grid {
            gap: 10px;
          }

          .auth-panel {
            padding: 24px 20px;
          }

          .auth-card {
            padding: 24px;
          }

          .auth-head h2 {
            font-size: 24px;
          }

          .auth-head p {
            font-size: 13px;
          }

          .field label {
            font-size: 14px;
          }

          .field input {
            font-size: 16px;
          }
        }

        @media (max-width: 980px) {
          .login-page {
            min-height: 100vh;
            overflow: auto;
          }

          .login-shell {
            min-height: 100vh;
          }

          .hero-panel {
            padding: 32px 28px;
          }

          .hero-panel h1 {
            font-size: clamp(36px, 4.2vw, 46px);
          }

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .auth-panel {
            padding: 20px 14px;
          }

          .auth-card {
            max-width: 460px;
            padding: 18px;
          }

          .auth-head h2 {
            font-size: 23px;
          }

          .auth-head p {
            font-size: 12px;
          }

          .field label {
            font-size: 13px;
          }

          .field input {
            font-size: 15px;
          }
        }

        @media (max-width: 760px) {
          .login-shell {
            min-height: auto;
          }

          .hero-panel {
            padding: 26px 22px;
          }

          .hero-panel h1 {
            font-size: 38px;
          }

          .auth-panel {
            padding: 20px 14px 28px;
          }

          .auth-card {
            max-width: 100%;
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .hero-panel h1 {
            font-size: 32px;
          }

          .auth-panel {
            padding: 12px 10px 20px;
          }

          .auth-card {
            padding: 16px;
            border-radius: 20px;
          }

          .role-grid {
            grid-template-columns: 1fr;
          }

          .field-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
