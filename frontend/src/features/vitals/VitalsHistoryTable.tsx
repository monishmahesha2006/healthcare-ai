import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { VitalsLoggerModal } from './VitalsLoggerModal';
import { VitalsTrendChart } from '../../components/charts/VitalsTrendChart';
import { VitalsRecord } from '../../types';
import { Plus } from 'lucide-react';

export const VitalsHistoryTable: React.FC = () => {
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  const fetchVitals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getVitals();
      setVitals(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load vital sign history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Vital Signs & HealthEngine History</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Log and review longitudinal physiological telemetry
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsLoggerOpen(true)} leftIcon={<Plus size={16} />}>
          Log New Measurement
        </Button>
      </div>

      {isLoading && <Spinner label="Loading telemetry..." />}
      {error && <Alert type="danger">{error}</Alert>}

      {!isLoading && (
        <>
          <Card title="Longitudinal Vital Signs Visualization">
            <VitalsTrendChart records={vitals} />
          </Card>

          <Card title="Historical Measurement Records">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Heart Rate</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Blood Sugar</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Blood Pressure</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Temperature</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>SpO2</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Score</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Risk Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{new Date(v.recorded_at).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.heart_rate} bpm</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.blood_sugar} mg/dL</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.systolic_bp}/{v.diastolic_bp} mmHg</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.temperature} °C</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.spo2} %</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                        {v.score !== null && v.score !== undefined ? `${v.score}/100` : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {v.risk_category ? <Badge status={v.risk_category} size="sm" /> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <VitalsLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSuccess={() => fetchVitals()}
      />
    </div>
  );
};
