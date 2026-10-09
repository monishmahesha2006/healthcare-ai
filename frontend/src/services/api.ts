import {
  User,
  VitalsRecord,
  HealthEngineResult,
  Medicine,
  Appointment,
  MedicalReport,
  PrescriptionUploadResult,
  ParsedMedication,
  HealthcareFacility,
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('healthcare_token');
    localStorage.removeItem('healthcare_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Authentication expired. Please log in again.');
  }

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // --- AUTH ---
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    phone?: string;
    specialty?: string;
    blood_group?: string;
  }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  // --- PATIENT WORKFLOWS ---
  getPatientSummary: () =>
    request<{
      patient: Partial<User>;
      latest_vitals: VitalsRecord | null;
      health_score: { score: number; risk_category: string; deductions_summary: string } | null;
      active_medicines_count: number;
      reports_count: number;
      upcoming_appointments: Array<{ id: number; appointment_date: string; reason: string; status: string; doctor_name: string }>;
    }>('/patient/summary'),

  getVitals: () => request<VitalsRecord[]>('/patient/vitals'),

  logVitals: (data: {
    heart_rate: number;
    blood_sugar: number;
    systolic_bp: number;
    diastolic_bp: number;
    temperature: number;
    spo2: number;
    notes?: string;
  }) =>
    request<{ vital: VitalsRecord; health_engine: HealthEngineResult }>('/patient/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMedicines: (activeOnly = true) =>
    request<Medicine[]>(`/patient/medicines?active_only=${activeOnly}`),

  addMedicine: (data: Partial<Medicine>) =>
    request<Medicine>('/patient/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMedicine: (id: number, data: Partial<Medicine>) =>
    request<Medicine>(`/patient/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAppointments: () => request<Appointment[]>('/patient/appointments'),

  bookAppointment: (data: { appointment_date: string; reason: string; doctor_id?: number }) =>
    request<Appointment>('/patient/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReports: () => request<MedicalReport[]>('/patient/reports'),

  createReport: (data: {
    title: string;
    report_type: string;
    extracted_text?: string;
    ai_summary?: string;
  }) =>
    request<MedicalReport>('/patient/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- DOCTOR WORKFLOWS ---
  getDoctorPatients: (search?: string) =>
    request<Array<{
      id: number;
      full_name: string;
      email: string;
      phone?: string;
      blood_group?: string;
      latest_score?: number;
      risk_category: string;
      last_recorded?: string;
    }>>(`/doctor/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getTriageQueue: () =>
    request<Array<{
      patient_id: number;
      full_name: string;
      email: string;
      phone?: string;
      score: number;
      risk_category: 'LOW' | 'MODERATE' | 'HIGH';
      rank_order: number;
      latest_vital?: Partial<VitalsRecord>;
      deductions: any[];
    }>>('/doctor/triage-queue'),

  getPatientDetail: (id: number) =>
    request<{
      patient: User;
      vitals_history: VitalsRecord[];
      medicines: Medicine[];
      appointments: Appointment[];
      reports: MedicalReport[];
    }>(`/doctor/patients/${id}`),

  getDoctorAppointments: () => request<Appointment[]>('/doctor/appointments'),

  updateAppointmentStatus: (id: number, data: { status?: string; doctor_notes?: string }) =>
    request<Appointment>(`/doctor/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // --- AI ASSISTANT & EXPLAINERS ---
  chatAssistant: (message: string) =>
    request<{ response: string; is_fallback: boolean; model: string; timestamp: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  explainMedicine: (medicine_name: string) =>
    request<{ medicine_name: string; explanation: string; is_fallback: boolean }>('/ai/explain-medicine', {
      method: 'POST',
      body: JSON.stringify({ medicine_name }),
    }),

  explainReport: (text: string, title?: string) =>
    request<{ title?: string; explanation: string; is_fallback: boolean }>('/ai/explain-report', {
      method: 'POST',
      body: JSON.stringify({ text, title }),
    }),

  // --- PRESCRIPTION AI & OCR ---
  uploadPrescription: async (file: File): Promise<PrescriptionUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('healthcare_token');

    const res = await fetch(`${API_BASE}/prescription/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Prescription upload failed');
    }
    return res.json();
  },

  saveVerifiedPrescription: (medications: ParsedMedication[]) =>
    request<{ message: string; count: number }>('/prescription/verify-save', {
      method: 'POST',
      body: JSON.stringify({ medications }),
    }),

  // --- GOOGLE CARE FINDER ---
  searchFacilities: (query?: string, facility_type?: string, lat?: number, lng?: number) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (facility_type && facility_type !== 'all') params.append('facility_type', facility_type);
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    return request<{
      facilities: HealthcareFacility[];
      source: string;
      disclaimer: string;
    }>(`/care-finder/search?${params.toString()}`);
  },
};
