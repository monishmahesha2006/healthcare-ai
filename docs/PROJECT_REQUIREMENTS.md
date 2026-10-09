# Healthcare AI — Project Requirements Document

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Healthcare information and routine health-management workflows are heavily fragmented across disparate records, vital-sign logs, clinic appointments, medications, lab reports, prescriptions, and communication with clinicians. Patients often struggle to interpret complex medical terminology, track vital sign fluctuations over time, understand medication regimens, and determine when symptoms or metrics require timely professional clinical attention. Concurrently, healthcare providers face cognitive overload when triaging patient populations without automated, transparent indicators of acute risk.

The **Healthcare AI Platform** addresses this fragmentation by integrating essential personal healthcare management capabilities into a secure, accessible, role-governed web application. The platform provides:
1. Rule-based, deterministic vital-sign risk scoring (**HealthEngine**) to highlight potential physiological anomalies transparently without opaque black-box scoring.
2. AI-assisted plain-language explanations of medical reports, laboratory results, medications, and prescription documents using Google Gemini and Google Cloud Vision.
3. Role-separated workflows that empower patients to manage their health journey while providing clinicians with prioritized triage queues and authorized patient monitoring.

### 1.2 Target Users
* **Patients / Caregivers**: Individuals seeking to track vitals, manage appointments and medications, interpret diagnostic reports, and interact with an educational AI health assistant.
* **Doctors / Healthcare Clinicians**: Licensed providers who need an efficient overview of authorized patient health metrics, vital trends, appointments, and a triage queue prioritized by objective physiological risk indicators.
* **System Administrators / Auditors**: Technical personnel verifying compliance, access audits, data security, and system health.

---

## 2. Project Objectives

1. **Role-Based Access Control**: Provide separate, authenticated patient and doctor experiences with strict server-side authorization boundaries.
2. **Comprehensive Patient Health Management**: Organize vital signs, appointments, medications, and clinical documents in one cohesive dashboard.
3. **Transparent Health Risk Indicators**: Implement the deterministic **HealthEngine** scoring engine to evaluate vital signs against clinical baseline thresholds with explicit rule explanations.
4. **AI-Assisted Educational Explanations**: Provide patient-friendly explanations for diagnostic reports, prescription images, and medications via secure backend proxies to Google Gemini.
5. **Interactive AI Health Assistant**: Deliver a conversational assistant equipped with medical disclaimers, rate limiting, and fallback capabilities.
6. **Clinical Provider Workflows**: Support doctors with patient listings, historical vital trends, appointment state management, and risk-prioritized triage queues.
7. **Prescription Processing & Verification**: Extract medication data from prescription images (OCR) while enforcing human verification before treating any data as confirmed.
8. **Care Navigation (Care Finder)**: Enable geolocation- and query-based searches for nearby clinics and healthcare facilities.
9. **Universal Accessibility & Ergonomics**: Ensure WCAG 2.2 Level AA compliance, responsive layouts, keyboard navigability, and clear visual hierarchy.
10. **Enterprise-Grade Security & Privacy**: Guard sensitive Protected Health Information (PHI) through password hashing (bcrypt), JWT authentication, patient data isolation, CORS restrictions, input sanitization, and comprehensive audit logging.

---

## 3. Scope of the Solution

### 3.1 In-Scope Features
* **Authentication & Authorization**: Registration, login, secure session/token management, role verification, and patient record isolation.
* **HealthEngine Service**: Pure rule-based scoring engine (0–100 scale, deduction rules, category assignment: LOW, MODERATE, HIGH) with rule attribution and boundary validation.
* **Patient Portal**:
  * Vital sign logging (Heart rate, blood glucose, blood pressure, temperature, SpO2).
  * Graphical vital sign trend visualization over time.
  * Medication scheduling and tracking.
  * Appointment scheduling with authorized clinicians.
  * Medical report upload, OCR extraction, and Gemini-powered plain-language breakdown.
  * Prescription upload, OCR parsing, and editable verification workflow.
  * Care Finder facility locator.
  * AI Health Assistant with conversational history and disclaimers.
* **Doctor Portal**:
  * Patient roster and search/filter.
  * Priority triage queue ordered by HealthEngine risk severity.
  * Patient clinical history view (vitals, reports, medications).
  * Appointment management (Confirm, Reschedule, Complete, Cancel).
* **Graceful Degradation**: Built-in mock/educational fallbacks for Gemini and Google Vision when external API keys are omitted.

### 3.2 Explicitly Out-of-Scope
* Autonomous clinical diagnosis or treatment prescribing (all AI outputs are strictly educational/informational).
* Direct electronic health record (EHR/HL7/FHIR) external hospital bidirectional synchronization.
* Direct pharmaceutical ordering or payment processing.
* Real-time telemetry streaming from wearable medical devices (Bluetooth/BLE hardware drivers).

---

## 4. Functional Requirements (FR)

| ID | Requirement Description | Actor | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | User authentication with bcrypt password hashing and role-based JWT issuance. | Patient, Doctor | Critical |
| **FR-02** | Strict patient data isolation: Patients cannot query or alter records belonging to other patients. | System | Critical |
| **FR-03** | HealthEngine deterministic calculation evaluating HR, blood sugar, BP, temperature, and SpO2. | System | Critical |
| **FR-04** | Vital sign recording with range validation, historical charting, and deduction breakdown. | Patient, Doctor | High |
| **FR-05** | Medication management (creation, listing, dosage, frequency, status tracking). | Patient, Doctor | High |
| **FR-06** | Appointment lifecycle management (booking, doctor confirmation, status updates). | Patient, Doctor | High |
| **FR-07** | Doctor Triage Queue displaying patients ranked by HealthEngine risk category. | Doctor | High |
| **FR-08** | Medical report document upload with OCR extraction and AI plain-language summarization. | Patient, Doctor | High |
| **FR-09** | Prescription document processing with structured medication field extraction and mandatory human verification. | Patient | High |
| **FR-10** | Medicine explainer providing educational overviews of drug indications and precautions. | Patient | Medium |
| **FR-11** | Google Care Finder searching healthcare facilities by specialty, query, or coordinates. | Patient | Medium |
| **FR-12** | AI Health Assistant conversational interface with healthcare disclaimers and session history. | Patient | Medium |

---

## 5. Non-Functional Requirements (NFR)

* **NFR-01 (Security)**: All endpoints handling PHI must require valid authorization. Passwords hashed using bcrypt (cost factor >= 12). CORS restricted to authorized frontend origins.
* **NFR-02 (Safety & Disclaimers)**: Every AI-generated output and risk calculation must display a visible disclaimer stating that it does not constitute clinical diagnosis or replace a licensed physician.
* **NFR-03 (Accessibility)**: The frontend user interface must conform to WCAG 2.2 Level AA, including keyboard navigation, ARIA landmarks, focus rings, and high contrast ratios (>= 4.5:1).
* **NFR-04 (Performance)**: API response time < 250ms for local database operations; frontend initial load < 1.5s; client-side bundle size optimized.
* **NFR-05 (Reliability & Fault Tolerance)**: Backend must gracefully handle external API outages (Gemini, Vision, Places) with fallback educational responses rather than 500 errors.
* **NFR-06 (Maintainability)**: Strict separation of concerns (FastAPI routes, schemas, services, repositories; React components, hooks, services, types).

---

## 6. Requirements Traceability Matrix (RTM)

| Objective | Functional Requirement | Implemented Backend Module | Implemented Frontend View | Verification Test |
| :--- | :--- | :--- | :--- | :--- |
| **Obj 1**: Role-Based Access | FR-01, FR-02 | `app.core.security`, `app.api.routes.auth` | `src/features/authentication` | `tests/test_auth_rbac.py` |
| **Obj 2**: Patient Records | FR-04, FR-05, FR-06 | `app.api.routes.patient`, `app.models` | `src/features/patient` | `tests/test_patient_api.py` |
| **Obj 3**: HealthEngine Scoring | FR-03 | `app.services.healthengine` | `src/features/vitals/HealthEngineScoreCard` | `tests/test_healthengine.py` |
| **Obj 4**: Report & Med Explainer | FR-08, FR-10 | `app.services.ai_service`, `app.api.routes.ai` | `src/features/reports`, `src/features/medicines` | `tests/test_ai_services.py` |
| **Obj 5**: AI Assistant | FR-12 | `app.services.ai_service`, `app.api.routes.ai` | `src/features/ai-assistant` | `tests/test_ai_services.py` |
| **Obj 6**: Doctor Workflows | FR-06, FR-07 | `app.api.routes.doctor` | `src/features/doctor` | `tests/test_doctor_api.py` |
| **Obj 7**: Prescription AI & OCR | FR-09 | `app.services.prescription_service` | `src/features/prescription` | `tests/test_prescription.py` |
| **Obj 8**: Care Finder | FR-11 | `app.services.places_service` | `src/features/care-finder` | `tests/test_care_finder.py` |
| **Obj 9**: Accessibility | NFR-03 | Design system tokens & ARIA live tags | Accessible layout & dialog modals | Manual audit & WCAG AA checklist |
| **Obj 10**: Security & Data Isolation| FR-02, NFR-01 | SQL parameterization, JWT validation | Typed API client with token interceptor | `tests/test_auth_rbac.py` |
