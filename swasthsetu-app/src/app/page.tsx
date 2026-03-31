'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, ClipboardList, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { persistRoleCookie, ROLE_HOME } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'reception' | 'doctor' | null>(null);
  const [hospitalCode, setHospitalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedRole) return;
    setIsLoading(true);
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
                  onClick={() => setSelectedRole('reception')}
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

            <button
              suppressHydrationWarning
              onClick={handleLogin}
              disabled={!selectedRole || isLoading}
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
