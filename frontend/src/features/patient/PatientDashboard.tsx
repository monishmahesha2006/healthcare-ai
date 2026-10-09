import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { HealthEngineCard } from './HealthEngineCard';
import { VitalsTrendChart } from '../../components/charts/VitalsTrendChart';
import { VitalsLoggerModal } from '../vitals/VitalsLoggerModal';
import {
  Pill,
  Calendar,
  FileText,
  HeartPulse,
  Plus,
  ArrowRight,
  Droplet,
  UserCheck
} from 'lucide-react';
import { HealthEngineResult, VitalsRecord } from '../../types';

interface PatientDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [summaryRes, vitalsRes] = await Promise.all([
        api.getPatientSummary(),
        api.getVitals(),
      ]);
      setData(summaryRes);
      setVitalsHistory(vitalsRes);
    } catch (err: any) {
      setError(err.message || 'Unable to load patient records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVitalsLogged = (result: HealthEngineResult) => {
    setToastMessage(`Vitals recorded successfully. Recalculated HealthEngine Score: ${result.score} (${result.risk_category} Risk).`);
    fetchDashboardData();
    setTimeout(() => setToastMessage(null), 6000);
  };

  if (isLoading) return <Spinner label="Loading clinical health records..." />;
  if (error) return <Alert type="danger" title="Connection Error">{error}</Alert>;

  const score = data?.health_score?.score ?? 100;
  const riskCategory = data?.health_score?.risk_category ?? 'LOW';
  const deductionsSummary = data?.health_score?.deductions_summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toastMessage && (
        <Alert type="success" title="Health Status Updated">
          {toastMessage}
        </Alert>
      )}

      {/* Greeting Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Welcome back, {data?.patient?.full_name || 'Patient'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Droplet size={14} color="#e11d48" /> Blood Group: <strong>{data?.patient?.blood_group || 'Not recorded'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserCheck size={14} color="var(--color-primary)" /> Profile Status: <strong>Verified</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigateTab('prescription')}>
            Scan Prescription
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsLoggerOpen(true)} leftIcon={<Plus size={16} />}>
            Log Vitals
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Vitals Summary */}
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Latest Heart Rate
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>
                {data?.latest_vitals?.heart_rate ? `${data.latest_vitals.heart_rate} bpm` : 'No logs'}
              </div>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: '#ffe4e6', borderRadius: 'var(--radius-md)' }}>
              <HeartPulse size={22} color="#e11d48" />
            </div>
          </div>
        </Card>

        {/* Active Medications */}
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Regimens
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>
                {data?.active_medicines_count || 0}
              </div>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
              <Pill size={22} color="#d97706" />
            </div>
          </div>
        </Card>

        {/* Diagnostic Reports */}
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Diagnostic Reports
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>
                {data?.reports_count || 0}
              </div>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: '#e0e7ff', borderRadius: 'var(--radius-md)' }}>
              <FileText size={22} color="#4338ca" />
            </div>
          </div>
        </Card>

        {/* Appointments */}
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Next Appointment
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem' }}>
                {data?.upcoming_appointments?.[0]
                  ? new Date(data.upcoming_appointments[0].appointment_date).toLocaleDateString()
                  : 'None scheduled'}
              </div>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={22} color="#059669" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main HealthEngine Risk Score Card */}
      <HealthEngineCard
        score={score}
        riskCategory={riskCategory}
        deductionsSummary={deductionsSummary}
        onOpenLogger={() => setIsLoggerOpen(true)}
      />

      {/* Vitals Trend Visualizer */}
      <Card
        title="Vital Signs Longitudinal Trends"
        subtitle="Tracking chronological fluctuations across healthy clinical boundary targets"
        headerAction={
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab('vitals')}>
            View History Table
          </Button>
        }
      >
        <VitalsTrendChart records={vitalsHistory} />
      </Card>

      {/* Two Column Layout: Upcoming Consultations & Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Appointments Card */}
        <Card
          title="Upcoming Consultations"
          subtitle="Confirmed clinical visits with licensed physicians"
          headerAction={
            <Button variant="outline" size="sm" onClick={() => onNavigateTab('appointments')}>
              Book Visit
            </Button>
          }
        >
          {data?.upcoming_appointments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.upcoming_appointments.map((a: any) => (
                <div
                  key={a.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.reason}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      With {a.doctor_name} • {new Date(a.appointment_date).toLocaleString()}
                    </div>
                  </div>
                  <Badge status={a.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No upcoming appointments. Schedule a consultation when needed.
            </p>
          )}
        </Card>

        {/* Quick Navigation Card */}
        <Card title="Patient Care Tools" subtitle="Direct access to supported healthcare modules">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => onNavigateTab('medicines')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Pill size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 500 }}>Active Medicines & Medication Explainer</span>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 500 }}>Medical Reports & AI Explainer</span>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => onNavigateTab('prescription')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HeartPulse size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 500 }}>Prescription AI Scanner & Verification</span>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => onNavigateTab('care-finder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 500 }}>Google Care Finder (Nearby Clinics)</span>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
          </div>
        </Card>
      </div>

      {/* Vitals Logger Modal */}
      <VitalsLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSuccess={handleVitalsLogged}
      />
    </div>
  );
};
