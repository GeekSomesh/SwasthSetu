// ============================================================
// SWASTH SETU - MOCK DATA LAYER
// ============================================================

export type Gender = 'Male' | 'Female' | 'Other';
export type FacilityType = 'Clinic' | 'Hospital' | 'Lab';
export type RecordType = 'Prescription' | 'LabReport' | 'Scan' | 'DischargeSummary';
export type ConsentStatus = 'Pending' | 'Granted' | 'Expired' | 'Denied';
export type QueueStatus = 'Waiting' | 'RecordsSynced' | 'InConsultation' | 'Completed';

export interface Patient {
  id: string;
  name: string;
  mobile_number: string;
  date_of_birth: string;
  gender: Gender;
  blood_group: string;
  address: string;
  emergency_contact: string;
  avatar_initials: string;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  type: FacilityType;
  phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  facility_id: string;
  qualification: string;
}

export interface Consent {
  id: string;
  patient_id: string;
  facility_id: string;
  status: ConsentStatus;
  otp: string;
  granted_at: string | null;
  expires_at: string | null;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  facility_id: string;
  doctor_id: string;
  record_type: RecordType;
  date: string;
  title: string;
  document_url: string;
  notes: string;
  diagnosis?: string;
  medications?: string[];
}

export interface QueueEntry {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: QueueStatus;
  checked_in_at: string;
  consent_granted: boolean;
}

// ============================================================
// FACILITIES
// ============================================================
export const facilities: Facility[] = [
  {
    id: 'fac-001',
    name: 'Aarogya Village Clinic',
    address: 'Main Road, Barwani, Madhya Pradesh 451551',
    type: 'Clinic',
    phone: '+91 7200 100 200',
  },
  {
    id: 'fac-002',
    name: 'City Care Hospital',
    address: 'MG Road, Indore, Madhya Pradesh 452001',
    type: 'Hospital',
    phone: '+91 731 400 5000',
  },
  {
    id: 'fac-003',
    name: 'Jeevan Diagnostics Lab',
    address: 'Station Road, Khandwa, Madhya Pradesh 450001',
    type: 'Lab',
    phone: '+91 733 222 1234',
  },
];

// ============================================================
// DOCTORS
// ============================================================
export const doctors: Doctor[] = [
  { id: 'doc-001', name: 'Dr. Anil Gupta', specialty: 'General Medicine', facility_id: 'fac-001', qualification: 'MBBS, MD' },
  { id: 'doc-002', name: 'Dr. Priya Sharma', specialty: 'Cardiology', facility_id: 'fac-002', qualification: 'MBBS, DM Cardiology' },
  { id: 'doc-003', name: 'Dr. Rajesh Verma', specialty: 'Orthopedics', facility_id: 'fac-002', qualification: 'MBBS, MS Ortho' },
  { id: 'doc-004', name: 'Dr. Sunita Patel', specialty: 'Gynecology', facility_id: 'fac-001', qualification: 'MBBS, MS OBG' },
  { id: 'doc-005', name: 'Dr. Vikram Singh', specialty: 'Pediatrics', facility_id: 'fac-002', qualification: 'MBBS, MD Pediatrics' },
  { id: 'doc-006', name: 'Dr. Nisha Joshi', specialty: 'Pathology', facility_id: 'fac-003', qualification: 'MBBS, MD Pathology' },
];

// ============================================================
// PATIENTS
// ============================================================
export const patients: Patient[] = [
  {
    id: 'pat-001',
    name: 'Ram Singh Yadav',
    mobile_number: '9876543210',
    date_of_birth: '1965-03-15',
    gender: 'Male',
    blood_group: 'B+',
    address: 'Village Khandwa, Near Panchayat Bhawan, MP',
    emergency_contact: '9876543211',
    avatar_initials: 'RS',
  },
  {
    id: 'pat-002',
    name: 'Sunita Devi',
    mobile_number: '9876543220',
    date_of_birth: '1978-07-22',
    gender: 'Female',
    blood_group: 'O+',
    address: 'Mohalla Shivaji, Barwani, MP',
    emergency_contact: '9876543221',
    avatar_initials: 'SD',
  },
  {
    id: 'pat-003',
    name: 'Mohan Lal Patidar',
    mobile_number: '9876543230',
    date_of_birth: '1955-11-08',
    gender: 'Male',
    blood_group: 'A+',
    address: 'Gram Panchayat Sendhwa, MP',
    emergency_contact: '9876543231',
    avatar_initials: 'ML',
  },
  {
    id: 'pat-004',
    name: 'Kavita Bai Meena',
    mobile_number: '9876543240',
    date_of_birth: '1990-01-30',
    gender: 'Female',
    blood_group: 'AB+',
    address: 'Near Bus Stand, Khargone, MP',
    emergency_contact: '9876543241',
    avatar_initials: 'KB',
  },
  {
    id: 'pat-005',
    name: 'Jagdish Prasad Sharma',
    mobile_number: '9876543250',
    date_of_birth: '1970-09-12',
    gender: 'Male',
    blood_group: 'O-',
    address: 'Ward No. 5, Dhar, MP',
    emergency_contact: '9876543251',
    avatar_initials: 'JP',
  },
  {
    id: 'pat-006',
    name: 'Radha Kumari',
    mobile_number: '9876543260',
    date_of_birth: '1985-04-18',
    gender: 'Female',
    blood_group: 'B-',
    address: 'Gram Bhikangaon, Khargone, MP',
    emergency_contact: '9876543261',
    avatar_initials: 'RK',
  },
  {
    id: 'pat-007',
    name: 'Balram Kushwaha',
    mobile_number: '9876543270',
    date_of_birth: '1960-12-25',
    gender: 'Male',
    blood_group: 'A-',
    address: 'Kasrawad Road, Barwani, MP',
    emergency_contact: '9876543271',
    avatar_initials: 'BK',
  },
  {
    id: 'pat-008',
    name: 'Parvati Adivasi',
    mobile_number: '9876543280',
    date_of_birth: '1995-06-05',
    gender: 'Female',
    blood_group: 'O+',
    address: 'Tribal Colony, Alirajpur, MP',
    emergency_contact: '9876543281',
    avatar_initials: 'PA',
  },
  {
    id: 'pat-009',
    name: 'Shivram Malviya',
    mobile_number: '9876543290',
    date_of_birth: '1972-08-14',
    gender: 'Male',
    blood_group: 'AB-',
    address: 'Gandhi Chowk, Mhow, MP',
    emergency_contact: '9876543291',
    avatar_initials: 'SM',
  },
  {
    id: 'pat-010',
    name: 'Geeta Bai Thakur',
    mobile_number: '9876543300',
    date_of_birth: '1988-02-28',
    gender: 'Female',
    blood_group: 'B+',
    address: 'Near Temple, Mandleshwar, MP',
    emergency_contact: '9876543301',
    avatar_initials: 'GT',
  },
];

// ============================================================
// MEDICAL RECORDS
// ============================================================
export const medicalRecords: MedicalRecord[] = [
  // --- Ram Singh Yadav (pat-001) - Diabetic + Hypertensive ---
  {
    id: 'rec-001', patient_id: 'pat-001', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-06-15', title: 'Diabetes & Hypertension Management',
    document_url: '/mock/prescription-1.png', notes: 'Patient presented with elevated fasting blood sugar (180 mg/dL) and BP 150/95.',
    diagnosis: 'Type 2 Diabetes Mellitus, Essential Hypertension',
    medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD', 'Aspirin 75mg OD'],
  },
  {
    id: 'rec-002', patient_id: 'pat-001', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-06-16', title: 'Complete Blood Count & HbA1c',
    document_url: '/mock/lab-report-1.png', notes: 'HbA1c: 8.2% (Poor control). Hemoglobin: 12.5 g/dL. WBC: 7,200. Platelets: 2.1 Lakh.',
  },
  {
    id: 'rec-003', patient_id: 'pat-001', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-07-20', title: 'Kidney Function Test (KFT)',
    document_url: '/mock/lab-report-2.png', notes: 'Serum Creatinine: 1.4 mg/dL (Mildly elevated). BUN: 22 mg/dL. eGFR: 58 mL/min (Stage 3a CKD).',
  },
  {
    id: 'rec-004', patient_id: 'pat-001', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'Prescription', date: '2025-08-10', title: 'Cardiology Follow-up',
    document_url: '/mock/prescription-2.png', notes: 'ECG showed LVH. Added ACE inhibitor for renal protection.',
    diagnosis: 'Hypertensive Heart Disease, Diabetic Nephropathy',
    medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD', 'Ramipril 2.5mg OD', 'Atorvastatin 10mg HS'],
  },
  {
    id: 'rec-005', patient_id: 'pat-001', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'Scan', date: '2025-08-10', title: 'ECG - 12 Lead',
    document_url: '/mock/scan-1.png', notes: 'Normal sinus rhythm. Left ventricular hypertrophy pattern. No ST-T changes.',
  },
  {
    id: 'rec-006', patient_id: 'pat-001', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-10-05', title: 'Lipid Profile',
    document_url: '/mock/lab-report-3.png', notes: 'Total Cholesterol: 240 mg/dL. LDL: 160 mg/dL. HDL: 35 mg/dL. Triglycerides: 220 mg/dL.',
  },
  {
    id: 'rec-007', patient_id: 'pat-001', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-12-01', title: 'Quarterly Diabetes Review',
    document_url: '/mock/prescription-3.png', notes: 'Blood sugar improved. HbA1c now 7.1%. Continue same medicines. Advised diet control.',
    diagnosis: 'Type 2 Diabetes Mellitus - Improving Control',
    medications: ['Metformin 500mg BD', 'Glimepiride 1mg OD', 'Amlodipine 5mg OD', 'Ramipril 2.5mg OD'],
  },

  // --- Sunita Devi (pat-002) - Anemia + Pregnancy related ---
  {
    id: 'rec-008', patient_id: 'pat-002', facility_id: 'fac-001', doctor_id: 'doc-004',
    record_type: 'Prescription', date: '2025-05-10', title: 'Routine Antenatal Check-up',
    document_url: '/mock/prescription-4.png', notes: 'G3P2L2. 16 weeks gestation. Mild pallor. Prescribed iron supplements.',
    diagnosis: 'Pregnancy with Iron Deficiency Anemia',
    medications: ['Ferrous Sulfate 200mg OD', 'Folic Acid 5mg OD', 'Calcium 500mg BD'],
  },
  {
    id: 'rec-009', patient_id: 'pat-002', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-05-10', title: 'Antenatal Blood Panel',
    document_url: '/mock/lab-report-4.png', notes: 'Hb: 8.5 g/dL (Low). Blood Group: O+. HIV/HBsAg/VDRL: Non-reactive.',
  },
  {
    id: 'rec-010', patient_id: 'pat-002', facility_id: 'fac-002', doctor_id: 'doc-004',
    record_type: 'Scan', date: '2025-06-20', title: 'Obstetric Ultrasound - 20 Weeks',
    document_url: '/mock/scan-2.png', notes: 'Single live intrauterine fetus. 20 weeks by dates. Normal anatomy scan. Placenta anterior.',
  },
  {
    id: 'rec-011', patient_id: 'pat-002', facility_id: 'fac-002', doctor_id: 'doc-004',
    record_type: 'DischargeSummary', date: '2025-09-15', title: 'Post-Delivery Discharge Summary',
    document_url: '/mock/discharge-1.png', notes: 'Normal vaginal delivery. Male child 2.8 kg. No post-partum complications. Advised exclusive breastfeeding.',
  },

  // --- Mohan Lal Patidar (pat-003) - Chronic Asthma + Joint Pain ---
  {
    id: 'rec-012', patient_id: 'pat-003', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-03-10', title: 'Asthma Exacerbation',
    document_url: '/mock/prescription-5.png', notes: 'Severe wheezing. SpO2 92%. Nebulization given. Referred for Chest X-ray.',
    diagnosis: 'Bronchial Asthma - Acute Exacerbation',
    medications: ['Salbutamol Inhaler 2 puffs QID', 'Budesonide Inhaler 200mcg BD', 'Montelukast 10mg HS', 'Prednisolone 20mg tapering'],
  },
  {
    id: 'rec-013', patient_id: 'pat-003', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Scan', date: '2025-03-12', title: 'Chest X-Ray PA View',
    document_url: '/mock/scan-3.png', notes: 'Bilateral hyperinflated lung fields. No consolidation. Heart size normal.',
  },
  {
    id: 'rec-014', patient_id: 'pat-003', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Prescription', date: '2025-07-22', title: 'Knee Pain - Osteoarthritis',
    document_url: '/mock/prescription-6.png', notes: 'Bilateral knee pain for 3 months. X-ray shows Grade 2 OA. Started physiotherapy.',
    diagnosis: 'Bilateral Knee Osteoarthritis Grade 2',
    medications: ['Aceclofenac 100mg BD', 'Pantoprazole 40mg OD', 'Glucosamine Sulfate 1500mg OD'],
  },
  {
    id: 'rec-015', patient_id: 'pat-003', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Scan', date: '2025-07-22', title: 'X-Ray Both Knees AP & Lateral',
    document_url: '/mock/scan-4.png', notes: 'Bilateral narrowing of medial joint space. Subchondral sclerosis. Osteophyte formation.',
  },

  // --- Kavita Bai (pat-004) - Thyroid ---
  {
    id: 'rec-016', patient_id: 'pat-004', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-04-05', title: 'Hypothyroidism First Diagnosed',
    document_url: '/mock/prescription-7.png', notes: 'Fatigue, weight gain for 6 months. TSH elevated. Started Levothyroxine.',
    diagnosis: 'Primary Hypothyroidism',
    medications: ['Levothyroxine 50mcg OD (empty stomach)'],
  },
  {
    id: 'rec-017', patient_id: 'pat-004', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-04-05', title: 'Thyroid Function Test',
    document_url: '/mock/lab-report-5.png', notes: 'TSH: 18.5 mIU/L (High). Free T4: 0.6 ng/dL (Low). Free T3: 1.8 pg/mL (Low).',
  },
  {
    id: 'rec-018', patient_id: 'pat-004', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-07-10', title: 'Thyroid Function Test - Follow-up',
    document_url: '/mock/lab-report-6.png', notes: 'TSH: 5.2 mIU/L (Improving). Free T4: 1.1 ng/dL (Normal). Continue same dose.',
  },

  // --- Jagdish Prasad (pat-005) - Heart related ---
  {
    id: 'rec-019', patient_id: 'pat-005', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'DischargeSummary', date: '2025-02-20', title: 'Acute MI - Discharge Summary',
    document_url: '/mock/discharge-2.png', notes: 'Admitted with chest pain. Troponin positive. ECG: ST elevation in V1-V4. Managed conservatively. Stable at discharge.',
  },
  {
    id: 'rec-020', patient_id: 'pat-005', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'Prescription', date: '2025-02-20', title: 'Post-MI Discharge Prescription',
    document_url: '/mock/prescription-8.png', notes: 'Post anterior wall MI. Ejection fraction 40%. Dual antiplatelet started.',
    diagnosis: 'Anterior Wall STEMI, LV dysfunction',
    medications: ['Aspirin 75mg OD', 'Clopidogrel 75mg OD', 'Atorvastatin 40mg HS', 'Metoprolol 25mg BD', 'Ramipril 2.5mg OD'],
  },
  {
    id: 'rec-021', patient_id: 'pat-005', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'Scan', date: '2025-02-18', title: '2D Echocardiography',
    document_url: '/mock/scan-5.png', notes: 'LVEF 40%. Anterior wall hypokinesia. Normal valves. No pericardial effusion.',
  },
  {
    id: 'rec-022', patient_id: 'pat-005', facility_id: 'fac-002', doctor_id: 'doc-002',
    record_type: 'Prescription', date: '2025-05-15', title: 'Cardiology Follow-up - 3 months',
    document_url: '/mock/prescription-9.png', notes: 'Patient stable. No chest pain recurrence. EF improved to 45%.',
    diagnosis: 'Old Anterior Wall MI - Improving',
    medications: ['Aspirin 75mg OD', 'Clopidogrel 75mg OD', 'Atorvastatin 40mg HS', 'Metoprolol 25mg BD', 'Ramipril 5mg OD'],
  },

  // --- Radha Kumari (pat-006) - Malaria + Dengue history ---
  {
    id: 'rec-023', patient_id: 'pat-006', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-08-10', title: 'Malaria Treatment',
    document_url: '/mock/prescription-10.png', notes: 'High fever 5 days. Rapid test positive for P. Vivax malaria.',
    diagnosis: 'Plasmodium Vivax Malaria',
    medications: ['Chloroquine 600mg stat, then 300mg at 6,24,48 hrs', 'Primaquine 15mg OD x 14 days', 'Paracetamol 500mg SOS'],
  },
  {
    id: 'rec-024', patient_id: 'pat-006', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-08-10', title: 'Malaria Blood Smear & CBC',
    document_url: '/mock/lab-report-7.png', notes: 'PS for MP: P. Vivax trophozoites seen. Platelet count: 85,000 (Low). Hb: 10.2 g/dL.',
  },

  // --- Balram Kushwaha (pat-007) - Fracture ---
  {
    id: 'rec-025', patient_id: 'pat-007', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Scan', date: '2025-05-01', title: 'X-Ray Right Forearm',
    document_url: '/mock/scan-6.png', notes: 'Fracture of distal radius with dorsal angulation. No intra-articular extension.',
  },
  {
    id: 'rec-026', patient_id: 'pat-007', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Prescription', date: '2025-05-01', title: 'Fracture Management',
    document_url: '/mock/prescription-11.png', notes: 'Closed reduction done under local anesthesia. Below-elbow POP cast applied.',
    diagnosis: 'Colles Fracture Right Wrist',
    medications: ['Paracetamol 500mg TDS', 'Calcium + Vitamin D3 OD', 'Diclofenac gel local application'],
  },
  {
    id: 'rec-027', patient_id: 'pat-007', facility_id: 'fac-002', doctor_id: 'doc-003',
    record_type: 'Scan', date: '2025-06-15', title: 'X-Ray Right Forearm - Follow-up',
    document_url: '/mock/scan-7.png', notes: 'Good callus formation. Alignment maintained. Cast removed. Start physiotherapy.',
  },

  // --- Parvati Adivasi (pat-008) - TB ---
  {
    id: 'rec-028', patient_id: 'pat-008', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-01-15', title: 'Pulmonary TB - DOTS Initiation',
    document_url: '/mock/prescription-12.png', notes: 'Cough 3 weeks, evening fever, weight loss. Sputum AFB positive. Started on DOTS Cat-I.',
    diagnosis: 'Pulmonary Tuberculosis - Sputum Positive',
    medications: ['HRZE (Isoniazid+Rifampicin+Pyrazinamide+Ethambutol) intensive phase - 2 months'],
  },
  {
    id: 'rec-029', patient_id: 'pat-008', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-01-15', title: 'Sputum AFB Test',
    document_url: '/mock/lab-report-8.png', notes: 'Sputum for AFB: POSITIVE (2+). GeneXpert: MTB detected, Rifampicin sensitive.',
  },
  {
    id: 'rec-030', patient_id: 'pat-008', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Scan', date: '2025-01-16', title: 'Chest X-Ray PA View',
    document_url: '/mock/scan-8.png', notes: 'Right upper lobe infiltrates with cavity. Left lung clear.',
  },
  {
    id: 'rec-031', patient_id: 'pat-008', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-03-20', title: 'Sputum AFB - 2 Months Follow-up',
    document_url: '/mock/lab-report-9.png', notes: 'Sputum for AFB: NEGATIVE. Continue continuation phase.',
  },

  // --- Shivram Malviya (pat-009) - Liver issues ---
  {
    id: 'rec-032', patient_id: 'pat-009', facility_id: 'fac-002', doctor_id: 'doc-001',
    record_type: 'DischargeSummary', date: '2025-04-10', title: 'Alcoholic Hepatitis Discharge',
    document_url: '/mock/discharge-3.png', notes: 'Admitted with jaundice, ascites. USG: Hepatomegaly with fatty liver. LFT deranged. Alcohol cessation counselled.',
  },
  {
    id: 'rec-033', patient_id: 'pat-009', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-04-08', title: 'Liver Function Test',
    document_url: '/mock/lab-report-10.png', notes: 'Total Bilirubin: 8.5 mg/dL. SGOT: 180 U/L. SGPT: 120 U/L. Albumin: 2.8 g/dL.',
  },
  {
    id: 'rec-034', patient_id: 'pat-009', facility_id: 'fac-002', doctor_id: 'doc-001',
    record_type: 'Scan', date: '2025-04-09', title: 'USG Abdomen',
    document_url: '/mock/scan-9.png', notes: 'Hepatomegaly (17 cm). Fatty liver changes. Mild ascites. Spleen normal.',
  },

  // --- Geeta Bai (pat-010) - Pediatric (child) records ---
  {
    id: 'rec-035', patient_id: 'pat-010', facility_id: 'fac-001', doctor_id: 'doc-001',
    record_type: 'Prescription', date: '2025-09-01', title: 'Dengue Fever Treatment',
    document_url: '/mock/prescription-13.png', notes: 'High fever, body ache, rash. NS1 Antigen positive. Platelet monitoring every 12 hours.',
    diagnosis: 'Dengue Fever',
    medications: ['Paracetamol 500mg QID', 'ORS sachets 3L/day', 'IV NS if needed'],
  },
  {
    id: 'rec-036', patient_id: 'pat-010', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-09-01', title: 'Dengue NS1 & Platelet Count',
    document_url: '/mock/lab-report-11.png', notes: 'NS1 Antigen: POSITIVE. Platelet: 95,000 (Low). Hematocrit: 42%.',
  },
  {
    id: 'rec-037', patient_id: 'pat-010', facility_id: 'fac-003', doctor_id: 'doc-006',
    record_type: 'LabReport', date: '2025-09-03', title: 'Platelet Follow-up Day 3',
    document_url: '/mock/lab-report-12.png', notes: 'Platelet: 62,000 (Further drop). Hematocrit: 44%. Close monitoring advised.',
  },
  {
    id: 'rec-038', patient_id: 'pat-010', facility_id: 'fac-002', doctor_id: 'doc-005',
    record_type: 'DischargeSummary', date: '2025-09-08', title: 'Dengue Recovery Discharge',
    document_url: '/mock/discharge-4.png', notes: 'Platelet nadir: 42,000 on Day 5. Recovered to 1.2 Lakh. No hemorrhagic manifestations. Discharged stable.',
  },
];

// ============================================================
// CONSENT STORE (In-memory, mutable for demo)
// ============================================================
export const consents: Consent[] = [];

// ============================================================
// PATIENT QUEUE (In-memory, mutable for demo)
// ============================================================
export const patientQueue: QueueEntry[] = [];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getPatientByMobile(mobile: string): Patient | undefined {
  return patients.find(p => p.mobile_number === mobile);
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

export function getFacilityById(id: string): Facility | undefined {
  return facilities.find(f => f.id === id);
}

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find(d => d.id === id);
}

export function getRecordsByPatientId(patientId: string): MedicalRecord[] {
  return medicalRecords
    .filter(r => r.patient_id === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecordsByType(patientId: string, type: RecordType): MedicalRecord[] {
  return getRecordsByPatientId(patientId).filter(r => r.record_type === type);
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function getAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
