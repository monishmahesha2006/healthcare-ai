import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { Appointment } from '../../types';
import { Plus, Clock, Stethoscope } from 'lucide-react';

export const AppointmentsManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAppointments();
      setAppointments(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.bookAppointment({
        appointment_date: new Date(date).toISOString(),
        reason,
      });
      setIsBookOpen(false);
      setDate('');
      setReason('');
      fetchAppointments();
    } catch (err: any) {
      alert(`Error scheduling appointment: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Clinical Consultations & Appointments</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Schedule and manage visits with your healthcare team
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsBookOpen(true)} leftIcon={<Plus size={16} />}>
          Schedule Visit
        </Button>
      </div>

      {isLoading && <Spinner label="Loading appointments..." />}
      {error && <Alert type="danger">{error}</Alert>}

      {!isLoading && (
        <Card title="Appointment History & Schedule">
          {appointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {appointments.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{a.reason}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> {new Date(a.appointment_date).toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Stethoscope size={14} /> {a.doctor_name || 'Assigned Physician'}
                      </span>
                    </div>
                    {a.doctor_notes && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.5rem', borderRadius: '4px' }}>
                        <strong>Doctor Notes:</strong> {a.doctor_notes}
                      </div>
                    )}
                  </div>
                  <Badge status={a.status} size="md" />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No consultations scheduled.</p>
          )}
        </Card>
      )}

      {/* Booking Modal */}
      <Modal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} title="Schedule Clinical Appointment">
        <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Preferred Date and Time
            </label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Reason for Consultation / Symptoms
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up for elevated blood pressure"
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsBookOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Appointment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
