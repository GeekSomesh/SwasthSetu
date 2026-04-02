import 'server-only';
import { DEMO_DOCTOR_PASSCODE_BY_ID } from '@/data/demo-doctor-passcodes';

const DOCTOR_PIN_BY_ID = DEMO_DOCTOR_PASSCODE_BY_ID;

export function verifyDoctorPin(doctorId: string, pin: string): boolean {
  const normalizedDoctorId = doctorId.trim();
  const normalizedPin = pin.trim();
  if (!normalizedDoctorId || !normalizedPin) return false;

  return DOCTOR_PIN_BY_ID[normalizedDoctorId] === normalizedPin;
}
