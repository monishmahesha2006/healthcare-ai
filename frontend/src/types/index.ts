export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor';
  is_active: boolean;
  phone?: string;
  date_of_birth?: string;
  blood_group?: string;
  specialty?: string;
}

export interface DeductionDetail {
  rule_id: string;
  parameter: string;
  condition: string;
  observed_value: number;
  deduction: number;
  severity: 'MILD' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  explanation: string;
}

export interface HealthEngineResult {
  score: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH';
  deductions_total: number;
  deductions: DeductionDetail[];
  rule_version: string;
  disclaimer: string;
}

export interface VitalsRecord {
  id: number;
  patient_id: number;
  heart_rate: number;
  blood_sugar: number;
  systolic_bp: number;
  diastolic_bp: number;
  temperature: number;
  spo2: number;
  notes?: string;
  recorded_at: string;
  score?: number;
  risk_category?: string;
}

export interface Medicine {
  id: number;
  patient_id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions?: string;
  prescribed_by?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id?: number;
  appointment_date: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  doctor_notes?: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
}

export interface MedicalReport {
  id: number;
  patient_id: number;
  title: string;
  report_type: string;
  file_path?: string;
  original_filename?: string;
  extracted_text?: string;
  ai_summary?: string;
  ai_explanation?: string;
  uploaded_at: string;
}

export interface ParsedMedication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  confidence: number;
  is_verified: boolean;
}

export interface PrescriptionUploadResult {
  file_id: string;
  extracted_text: string;
  medications: ParsedMedication[];
  requires_human_verification: boolean;
  ocr_source: string;
  disclaimer: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  facility_type: string;
  address: string;
  phone: string;
  rating: number;
  user_ratings_total: number;
  open_now: boolean;
  distance_km?: number;
  emergency_services: boolean;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  is_fallback?: boolean;
}
