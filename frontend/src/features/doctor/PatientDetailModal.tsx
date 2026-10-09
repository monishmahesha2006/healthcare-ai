import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { VitalsTrendChart } from '../../components/charts/VitalsTrendChart';
import { Pill, FileText, HeartPulse, Droplet } from 'lucide-react';

interface PatientDetailModalProps {
  patientId: number | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patientId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getPatientDetail(patientId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load patient records.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [patientId]);

  if (!patientId) return null;

  return (
    <Modal
      isOpen={!!patientId}
      onClose={onClose}
      title={data ? `Clinical Record: ${data.patient.full_name}` : 'Loading Patient Record...'}
      maxWidth="840px"
    >
      {isLoading && <Spinner label="Loading full clinical history..." />}
      {error && <Alert type="danger">{error}</Alert>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Patient Overview Strip */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{data.patient.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {data.patient.email} • Phone: {data.patient.phone || 'N/A'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                DOB: <strong>{data.patient.date_of_birth || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Droplet size={14} color="#e11d48" /> Blood Group: <strong>{data.patient.blood_group || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Vitals Trend Section */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HeartPulse size={18} color="var(--color-primary)" /> Vital Signs & Physiological Trends
            </h3>
            <VitalsTrendChart records={data.vitals_history} />
          </div>

          {/* Active Medications */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Pill size={18} color="#d97706" /> Current Medication Regimen ({data.medicines.length})
            </h3>
            {data.medicines.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {data.medicines.map((m: any) => (
                  <div key={m.id} style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 600 }}>{m.name} ({m.dosage})</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.frequency} • {m.route}</div>
                    {m.instructions && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Note: {m.instructions}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active medications recorded.</p>
            )}
          </div>

          {/* Diagnostic Reports */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} color="var(--color-primary)" /> Diagnostic Reports ({data.reports.length})
            </h3>
            {data.reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.reports.map((r: any) => (
                  <div key={r.id} style={{ padding: '0.85rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type: {r.report_type} • Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {r.ai_summary && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.5rem', borderRadius: '4px' }}>
                        <strong>AI Summary:</strong> {r.ai_summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reports on file.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
