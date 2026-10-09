import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { TriageQueue } from './TriageQueue';
import { PatientDetailModal } from './PatientDetailModal';
import {
  Users,
  Flame,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [triageQueue, setTriageQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDoctorData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [ptsRes, triageRes, appsRes] = await Promise.all([
        api.getDoctorPatients(search),
        api.getTriageQueue(),
        api.getDoctorAppointments(),
      ]);
      setPatients(ptsRes);
      setTriageQueue(triageRes);
      setAppointments(appsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor clinical records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [search]);

  const handleUpdateAppointment = async (id: number, status: string) => {
    try {
      await api.updateAppointmentStatus(id, { status, doctor_notes: `Status updated to ${status} by attending physician.` });
      setToastMessage(`Appointment #${id} updated to ${status}.`);
      fetchDoctorData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  if (isLoading && !patients.length) return <Spinner label="Loading clinical data..." />;
  if (error) return <Alert type="danger" title="Error">{error}</Alert>;

  const highRiskCount = triageQueue.filter((p) => p.risk_category === 'HIGH').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toastMessage && <Alert type="success">{toastMessage}</Alert>}

      {/* Doctor Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Clinical Provider Workstation</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Physiological risk triage, patient roster, and schedule management
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ASSIGNED PATIENTS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {patients.length}
              </div>
            </div>
            <div style={{ padding: '0.65rem', backgroundColor: '#e0e7ff', borderRadius: 'var(--radius-md)' }}>
              <Users size={22} color="var(--color-primary)" />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ACUTE HIGH-RISK TRIAGE
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#b91c1c' }}>
                {highRiskCount}
              </div>
            </div>
            <div style={{ padding: '0.65rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
              <Flame size={22} color="#dc2626" />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                SCHEDULED VISITS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {appointments.length}
              </div>
            </div>
            <div style={{ padding: '0.65rem', backgroundColor: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={22} color="#059669" />
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Triage Queue Component */}
      <TriageQueue
        queue={triageQueue}
        onSelectPatient={(patientId) => setSelectedPatientId(patientId)}
      />

      {/* Patient Roster with Search */}
      <Card
        title="Authorized Patient Roster"
        subtitle="Active medical records and physiological risk status"
        headerAction={
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Patient Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Blood Group</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Health Score</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Risk Tier</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.full_name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{p.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{p.blood_group || 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {p.latest_score !== null && p.latest_score !== undefined ? `${p.latest_score} / 100` : 'Unassessed'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge status={p.risk_category} size="sm" />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatientId(p.id)} rightIcon={<ArrowUpRight size={14} />}>
                      Examine
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Appointment Schedule Management */}
      <Card
        title="Consultation Schedule & Status Workflow"
        subtitle="Manage upcoming appointments, confirm bookings, or mark completed"
      >
        {appointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {appointments.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{a.reason}</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Patient: <strong>{a.patient_name}</strong> • Date: {new Date(a.appointment_date).toLocaleString()}
                  </div>
                  {a.doctor_notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      Clinical Notes: {a.doctor_notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge status={a.status} size="sm" />

                  {a.status === 'scheduled' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateAppointment(a.id, 'confirmed')}
                      leftIcon={<CheckCircle size={14} />}
                    >
                      Confirm Visit
                    </Button>
                  )}

                  {a.status === 'confirmed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateAppointment(a.id, 'completed')}
                      leftIcon={<CheckCircle size={14} />}
                    >
                      Mark Complete
                    </Button>
                  )}

                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateAppointment(a.id, 'cancelled')}
                      leftIcon={<XCircle size={14} />}
                      style={{ color: '#b91c1c' }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No appointments scheduled.</p>
        )}
      </Card>

      {/* Patient Detail Drilldown Modal */}
      <PatientDetailModal
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
};
