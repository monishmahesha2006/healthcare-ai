import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { api } from '../../services/api';
import { HealthEngineResult } from '../../types';

interface VitalsLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: HealthEngineResult) => void;
}

export const VitalsLoggerModal: React.FC<VitalsLoggerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [heartRate, setHeartRate] = useState<number>(72);
  const [bloodSugar, setBloodSugar] = useState<number>(95);
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [spo2, setSpo2] = useState<number>(98);
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.logVitals({
        heart_rate: Number(heartRate),
        blood_sugar: Number(bloodSugar),
        systolic_bp: Number(systolicBp),
        diastolic_bp: Number(diastolicBp),
        temperature: Number(temperature),
        spo2: Number(spo2),
        notes: notes || undefined,
      });

      onSuccess(res.health_engine);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record vitals.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Patient Vital Signs" maxWidth="600px">
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Heart Rate */}
          <div>
            <label htmlFor="log-hr" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Heart Rate (bpm)
            </label>
            <input
              id="log-hr"
              type="number"
              required
              min={30}
              max={220}
              step="any"
              value={heartRate}
              onChange={(e) => setHeartRate(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 50 – 110 bpm</span>
          </div>

          {/* Blood Sugar */}
          <div>
            <label htmlFor="log-sugar" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Blood Sugar (mg/dL)
            </label>
            <input
              id="log-sugar"
              type="number"
              required
              min={30}
              max={600}
              step="any"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 70 – 180 mg/dL</span>
          </div>

          {/* Systolic BP */}
          <div>
            <label htmlFor="log-sys" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Systolic BP (mmHg)
            </label>
            <input
              id="log-sys"
              type="number"
              required
              min={60}
              max={260}
              step="any"
              value={systolicBp}
              onChange={(e) => setSystolicBp(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &lt; 140 mmHg</span>
          </div>

          {/* Diastolic BP */}
          <div>
            <label htmlFor="log-dia" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Diastolic BP (mmHg)
            </label>
            <input
              id="log-dia"
              type="number"
              required
              min={40}
              max={160}
              step="any"
              value={diastolicBp}
              onChange={(e) => setDiastolicBp(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &lt; 90 mmHg</span>
          </div>

          {/* Body Temperature */}
          <div>
            <label htmlFor="log-temp" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Body Temperature (°C)
            </label>
            <input
              id="log-temp"
              type="number"
              required
              min={34}
              max={43}
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &lt; 38.0 °C</span>
          </div>

          {/* Oxygen Saturation */}
          <div>
            <label htmlFor="log-spo2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Oxygen Saturation SpO2 (%)
            </label>
            <input
              id="log-spo2"
              type="number"
              required
              min={60}
              max={100}
              step="any"
              value={spo2}
              onChange={(e) => setSpo2(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &ge; 94%</span>
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label htmlFor="log-notes" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Clinical / Contextual Notes (Optional)
          </label>
          <input
            id="log-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Taken 30 mins after morning medication"
            style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Evaluate & Save Vitals
          </Button>
        </div>
      </form>
    </Modal>
  );
};
