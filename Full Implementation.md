# Swasth Setu: Technical Implementation Guide

## 1. Tech Stack
- **Frontend (Web Application):** Next.js (React), TypeScript.
- **Styling & UI:** Tailwind CSS, Shadcn UI (for highly customized, accessible, professional components), Framer Motion (for smooth micro-interactions).
- **Backend / API:** Next.js Server Actions / API Routes (Node.js).
- **Database:** PostgreSQL (Hosted on Supabase or Neon). Includes Prisma ORM for type-safe queries.
- **Storage:** AWS S3 or Supabase Storage (to store PDFs, X-Rays, and Prescription Images).
- **Authentication/SMS:** Twilio or Fast2SMS API (for OTPs).

## 2. Database Schema (Relational Representation)

### `Patients`
- `id` (UUID, PK)
- `name` (String)
- `mobile_number` (String, Unique)
- `date_of_birth` (Date)
- `gender` (Enum)

### `Facilities` (Hospitals/Clinics)
- `id` (UUID, PK)
- `name` (String)
- `address` (String)
- `type` (Enum: Clinic, Hospital, Lab)

### `Doctors`
- `id` (UUID, PK)
- `name` (String)
- `specialty` (String)
- `facility_id` (FK to Facilities)

### `Consents`
- `id` (UUID, PK)
- `patient_id` (FK to Patients)
- `facility_id` (FK to Facilities)
- `status` (Enum: Pending, Granted, Expired)
- `granted_at` (Timestamp)
- `expires_at` (Timestamp)

### `MedicalRecords` (The Core Timeline Data)
- `id` (UUID, PK)
- `patient_id` (FK to Patients)
- `facility_id` (FK to Facilities)
- `doctor_id` (FK to Doctors)
- `record_type` (Enum: Prescription, LabReport, Scan, DischargeSummary)
- `date` (Timestamp)
- `document_url` (String - link to S3 bucket PDF/Image)
- `notes` (Text - Optional context)

## 3. Core API Endpoints (Next.js API Routes)
- `POST /api/patients/search` - Look up patient by mobile number.
- `POST /api/consent/request` - Triggers SMS OTP to patient.
- `POST /api/consent/verify` - Validates OTP and creates temporary token.
- `GET /api/records/timeline?patientId={id}` - Fetches all records securely (checks active consent token).
- `POST /api/records/upload` - Securely uploads new visit file to S3 and creates DB entry.

## 4. Development Roadmap
**Phase 1: Project Setup & UI Foundation (Days 1-2)**
- Initialize Next.js project.
- Setup Tailwind CSS & design system variables (Colors, Typography).
- Build the persistent layout (Sidebar, Top Nav).

**Phase 2: Database & Mock Data (Day 3)**
- Spin up PostgreSQL database.
- Seed the DB with 10 mock patients, 3 mock hospitals, and 50 mock medical records (including dummy PDFs).

**Phase 3: The Workflows (Days 4-5)**
- Build the "Receptionist Dashboard" & OTP logic.
- Build the "Doctor Timeline UI" (Filtering, Card components, Document Viewer).

**Phase 4: Polish & Performance**
- Add loading skeletons, Framer Motion transitions, and toast notifications for a premium feel.
