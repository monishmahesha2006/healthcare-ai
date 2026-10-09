# 🏥 Healthcare AI Platform

> A production-grade, full-stack Healthcare AI application built for a Hackathon — featuring role-based access control, deterministic vital risk scoring (HealthEngine), AI-assisted report analysis, prescription OCR, and Google Care Finder integration.

---

## 🚀 Live Demo

| Role     | Username       | Password     |
|----------|----------------|--------------|
| Doctor   | `dr_demo`      | `Doctor123!` |
| Patient  | `patient_demo` | `Patient123!`|

---

## ✨ Features

### 👨‍⚕️ Doctor Portal
- **Triage Queue** — View all patients sorted by risk score (High → Low)
- **Patient Detail Modal** — Full vitals history, medicines, risk assessment
- **Bulk Patient Management** — Search, filter, and manage patients
- **Care Finder Integration** — Locate nearby hospitals & specialists

### 🧑‍💼 Patient Portal
- **HealthEngine Dashboard** — Deterministic risk scoring from vitals (No AI hallucination)
- **Vitals Logger** — Log BP, heart rate, SpO₂, blood glucose, temperature, weight
- **Vitals Trend Charts** — Interactive line charts for historical tracking
- **Medicines Manager** — Add, edit, and track medications with dosage & schedule
- **Appointments** — Book and manage doctor appointments
- **Reports Manager** — Upload lab reports; AI-assisted plain-English analysis
- **Prescription Scanner** — OCR-based prescription text extraction → auto-populate medicines
- **AI Assistant** — Floating conversational AI for medical Q&A (Gemini-powered)
- **Care Finder** — Google Maps integration to find nearby healthcare providers

---

## 🏗️ Architecture

```
niranth/
├── backend/                    # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── api/routes/         # REST endpoints
│   │   ├── core/               # Config, security, JWT auth
│   │   ├── db/                 # Database session, models, seed
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── services/           # HealthEngine, AI, OCR services
│   └── tests/                  # Pytest test suite
│
├── frontend/                   # React 18 + TypeScript + Vite
│   └── src/
│       ├── features/           # Feature-sliced modules
│       │   ├── authentication/ # Login, Register, AuthContext
│       │   ├── patient/        # Dashboard, HealthEngine card
│       │   ├── doctor/         # Doctor dashboard, triage queue
│       │   ├── vitals/         # Logger modal, history table
│       │   ├── medicines/      # CRUD medicines manager
│       │   ├── appointments/   # Appointments manager
│       │   ├── reports/        # Lab reports + AI analysis
│       │   ├── prescription/   # OCR prescription scanner
│       │   ├── ai-assistant/   # Floating AI chat drawer
│       │   └── care-finder/    # Google Care Finder iframe
│       ├── components/         # Shared UI (Button, Card, Modal…)
│       └── styles/             # Global WCAG AA–compliant design system
│
├── docs/                       # Architecture, security, testing docs
├── docker-compose.yml          # One-command full-stack launch
└── .env.example                # Environment variable reference
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Lucide React     |
| Backend    | FastAPI, SQLAlchemy, Pydantic v2, Uvicorn    |
| Database   | SQLite (dev) / PostgreSQL (prod-ready)       |
| Auth       | JWT Bearer tokens, bcrypt password hashing  |
| AI         | Google Gemini API (report analysis, chat)    |
| OCR        | Pytesseract (prescription scanner)           |
| Styling    | Vanilla CSS with WCAG 2.2 AA design system  |

---

## ⚡ Quick Start

### Option 1: Docker (Recommended)

```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY
docker-compose up --build
```

- Frontend → http://localhost:5173  
- Backend API → http://localhost:8000  
- API Docs → http://localhost:8000/docs

---

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env → set GEMINI_API_KEY

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v --tb=short
```

Test coverage includes:
- Authentication & RBAC (role-based access control)
- Doctor API endpoints
- Patient API endpoints
- HealthEngine risk scoring logic
- Prescription service
- AI service mocks

---

## 🔒 Security Highlights

- **JWT Authentication** — Short-lived access tokens
- **bcrypt** password hashing (no plaintext storage)
- **RBAC** — Strict separation of doctor vs patient routes
- **Security headers** — X-Content-Type-Options, X-Frame-Options, XSS-Protection
- **Input validation** — Pydantic v2 schemas on all endpoints
- **CORS** — Origin whitelist enforced

See [`docs/SECURITY.md`](docs/SECURITY.md) for full details.

---

## ♿ Accessibility

- WCAG 2.2 Level AA color contrast ratios
- Keyboard navigation & focus management
- ARIA labels on all interactive elements
- `prefers-reduced-motion` support
- Screen reader–friendly semantic HTML

See [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) for full details.

---

## 📋 HealthEngine — Risk Scoring Logic

The HealthEngine is a **deterministic, rule-based** vital sign risk classifier (no AI hallucination risk):

| Vital              | Low Risk         | Moderate Risk        | High Risk           |
|--------------------|------------------|----------------------|---------------------|
| Systolic BP (mmHg) | 90–129           | 130–179 or <90       | ≥180                |
| Heart Rate (bpm)   | 60–99            | 50–59 or 100–119     | <50 or ≥120         |
| SpO₂ (%)          | ≥95              | 90–94                | <90                 |
| Blood Glucose      | 70–139 mg/dL     | 140–199 or <70       | ≥200                |
| Temperature (°F)   | 97–99.4          | 99.5–103 or <97      | ≥103.1              |

---

## 📄 Documentation

- [Architecture & Migration Notes](docs/ARCHITECTURE_AND_MIGRATION.md)
- [Project Requirements](docs/PROJECT_REQUIREMENTS.md)
- [Security Policy](docs/SECURITY.md)
- [Testing Guide](docs/TESTING.md)
- [Accessibility Standards](docs/ACCESSIBILITY.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for the Healthcare AI Hackathon by **monishmahesha2006***
