# Swasth Setu: Full Detailed Project Plan

## 1. Executive Summary
**Vision:** Build a rural care continuity platform for India that allows doctors to see a patient’s holistic, original medical history instantly, even during their first visit to a new hospital.
**MVP Focus:** Small private hospitals serving rural/semi-urban patients.
**Core Differentiator:** Replacing scattered paper files with an organized, filterable, digital timeline of verified medical records (lab reports, prescriptions, scans), unequivocally tagged with the source facility and doctor.

## 2. The Problem & Target Audience
- **The Problem:** Fragmented records lead to redundant testing, uninformed clinical decisions, and wasted time in rural healthcare where continuity of care is broken.
- **Primary Users:**
  1. **Reception/Admin Staff:** Identifies patient, triggers consent, queues patients.
  2. **Doctor:** Reviews the timeline of past records, makes informed decisions, and writes new visit notes.
  3. **Patient:** Authenticates access via an SMS OTP (no app required).

## 3. Core MVP Features
1. **Phone-First Identity:** Patient lookup using mobile number.
2. **OTP-Based Consent:** Explicit patient permission required before a new hospital can retrieve ABDM-linked or partnered historical records.
3. **Aggregated Record Timeline:** A chronological, filterable UI displaying raw PDFs/Images of past prescriptions, lab reports, and scans.
4. **Source Tagging System:** Every document explicitly displays the Originating Hospital, Treating Doctor, Date, and Category.
5. **Visit Write-back:** The current hospital uploads the summary/prescription of today's visit back into the portable ecosystem.

## 4. MVP User Flow (Step-by-Step)
1. **Patient Arrival:** Ram Singh arrives at "City Care Hospital" for the first time.
2. **Identity Verification:** Receptionist asks for his mobile number and enters it into the Swasth Setu dashboard.
3. **Consent Capture:** System identifies past records exist at "Village Clinic". The receptionist clicks "Request Access". Ram Singh receives a 4-digit SMS OTP and tells the receptionist.
4. **Queueing:** The receptionist enters the OTP. Access is granted for 24 hours. Ram Singh is added to Dr. Sharma's waiting queue with a green "Records Synced" badge.
5. **Doctor Review:** Dr. Sharma opens the profile. Instead of asking "what medications are you on?", he views the timeline, filters by "Prescriptions", and sees the actual digital prescription from "Village Clinic" written by "Dr. Gupta" two months ago.
6. **New Visit:** Dr. Sharma treats the patient, uploads today's digitally generated prescription, which gets appended to Ram Singh's centralized timeline for the next hospital.

## 5. Demo Scenarios for Pitching / Hackathon
- **Scenario A: The Successful Sync:** Demonstrate receptionist OTP flow -> Doctor viewing past diabetes prescription -> Doctor prescribing adjusted medication based on past data.
- **Scenario B: Specific Record Search:** Show the doctor filtering 3 years of mocked data down to just "Lab Reports" or "Cardiology Scans" in 2 clicks.
- **Scenario C: Unauthorized Block:** Show the system actively blocking access if the OTP is not provided.
