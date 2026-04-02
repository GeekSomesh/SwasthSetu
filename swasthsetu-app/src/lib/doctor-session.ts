function getSessionSecret(): string {
  return process.env.DOCTOR_SESSION_SECRET ?? 'swasthsetu-doctor-session-v1';
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function signPayload(payload: string): string {
  return stableHash(`${payload}|${getSessionSecret()}`);
}

export function createDoctorSessionToken(doctorId: string): string {
  const issuedPart = Date.now().toString(36);
  const payload = `${doctorId}.${issuedPart}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyDoctorSessionToken(token: string | undefined, doctorId: string | undefined): boolean {
  if (!token || !doctorId) return false;

  const [tokenDoctorId, issuedPart, signature] = token.split('.');
  if (!tokenDoctorId || !issuedPart || !signature) return false;
  if (tokenDoctorId !== doctorId) return false;

  const expectedSignature = signPayload(`${tokenDoctorId}.${issuedPart}`);
  return signature === expectedSignature;
}
