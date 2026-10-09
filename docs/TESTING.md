# Healthcare AI — Testing Strategy and Quality Assurance

## 1. Testing Philosophy & Quality Gates

The test suite ensures end-to-end reliability, clinical rule precision, strict access control, and resilient fallbacks across all system layers.

### Quality Gate Requirements
1. **HealthEngine Scoring Precision**: 100% test coverage of all vital threshold deduction boundaries, boundary-edge conditions, and combinations.
2. **Authorization & Multi-Tenancy**: Automated integration verification that patients cannot query or tamper with other patients' vitals, appointments, or reports.
3. **External API Resilience**: Verified fallback behavior when Google Gemini or Google Vision API keys are missing or network calls fail.
4. **Backend Code Coverage**: Target >= 80% coverage on critical business logic, security, and data access layers.
5. **Frontend Build & Types**: Zero TypeScript compiler errors (`tsc --noEmit`), clean ESLint execution, and passing component tests.

---

## 2. Test Architecture & Structure

```text
backend/tests/
├── conftest.py               # Shared test database fixtures, client, and authenticated user tokens
├── test_healthengine.py      # Unit tests for 100% of HealthEngine scoring rules and edge cases
├── test_auth_rbac.py         # Integration tests for auth, JWT, and role-based permissions
├── test_patient_api.py       # Integration tests for patient vitals, medicines, appointments, reports
├── test_doctor_api.py        # Integration tests for doctor roster, triage queue, and appointments
├── test_ai_services.py       # Unit & integration tests for Gemini AI assistant and fallbacks
├── test_prescription.py      # Unit & integration tests for prescription OCR and parsing
└── test_care_finder.py       # Unit tests for clinic locator and fallback behavior
```

---

## 3. Test Categories & Execution

### 3.1 Backend Test Execution (Pytest)
```bash
# Navigate to backend directory
cd backend

# Execute all tests with detailed verbosity
python -m pytest tests/ -v

# Execute tests with coverage report
python -m pytest tests/ --cov=app --cov-report=term-missing
```

### 3.2 Frontend Build & Type Verification
```bash
# Navigate to frontend directory
cd frontend

# Verify TypeScript type correctness
npm run type-check

# Execute production build
npm run build
```

---

## 4. Key Test Scenarios & Verified Criteria

| Test Suite | Scenario / Test Case | Expected Outcome |
| :--- | :--- | :--- |
| `test_healthengine.py` | Normal vitals (HR: 72, Sugar: 100, BP: 120/80, Temp: 36.8, SpO2: 98) | Score: 100, Risk: LOW, 0 deductions |
| `test_healthengine.py` | Bradycardia (HR: 48) + Fever (Temp: 38.5) | Score: 70, Deductions: -18 (HR), -12 (Temp), Risk: MODERATE |
| `test_healthengine.py` | Severe Hypoxemia (SpO2: 88) + Hypertensive Crisis (BP: 160/100) + High Sugar (220) | Score: 42, Deductions: -22 (SpO2), -18 (BP), -18 (Sugar), Risk: HIGH |
| `test_healthengine.py` | Boundary values: HR=50 (no deduction), HR=49.9 (deduct 18), SpO2=94 (no deduction), SpO2=93.9 (deduct 22) | Exact boundary compliance verified |
| `test_auth_rbac.py` | Patient attempts to access `/api/v1/doctor/triage-queue` | HTTP 403 Forbidden |
| `test_auth_rbac.py` | Patient A queries vitals of Patient B by changing ID in URL | HTTP 403 Forbidden / Not Found |
| `test_ai_services.py` | Gemini API key omitted or invalid | Returns safe educational fallback response with status `fallback: true` |
| `test_prescription.py`| Upload prescription image with unconfirmed OCR | Requires explicit human verification flag before medication creation |
