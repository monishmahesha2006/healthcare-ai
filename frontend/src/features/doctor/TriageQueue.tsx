import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Flame, ArrowUpRight } from 'lucide-react';

interface TriageQueueProps {
  queue: Array<{
    patient_id: number;
    full_name: string;
    email: string;
    phone?: string;
    score: number;
    risk_category: 'LOW' | 'MODERATE' | 'HIGH';
    latest_vital?: any;
    deductions: any[];
  }>;
  onSelectPatient: (patientId: number) => void;
}

export const TriageQueue: React.FC<TriageQueueProps> = ({ queue, onSelectPatient }) => {
  return (
    <Card
      title="Clinical Triage Priority Queue"
      subtitle="Patients ranked by objective HealthEngine physiological risk indicators (Acute Deviations First)"
      headerAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>
          <Flame size={16} /> High Risk Priority Active
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {queue.map((item, idx) => {
          const isHigh = item.risk_category === 'HIGH';
          const isMod = item.risk_category === 'MODERATE';

          let borderHighlight = 'var(--border-subtle)';
          let bgHighlight = '#ffffff';
          if (isHigh) {
            borderHighlight = 'var(--risk-high-border)';
            bgHighlight = '#fff5f5';
          } else if (isMod) {
            borderHighlight = 'var(--risk-mod-border)';
            bgHighlight = '#fffdfa';
          }

          return (
            <div
              key={item.patient_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${borderHighlight}`,
                backgroundColor: bgHighlight,
                boxShadow: isHigh ? 'var(--shadow-sm)' : 'none',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Patient Demographics & Rank */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isHigh ? '#fee2e2' : 'var(--bg-surface-subtle)',
                    color: isHigh ? 'var(--risk-high)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  #{idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{item.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.email} {item.phone ? `• ${item.phone}` : ''}
                  </div>
                </div>
              </div>

              {/* Vitals Highlights */}
              {item.latest_vital && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <div>HR: <strong>{item.latest_vital.heart_rate} bpm</strong></div>
                  <div>BP: <strong>{item.latest_vital.systolic_bp}/{item.latest_vital.diastolic_bp}</strong></div>
                  <div>SpO2: <strong>{item.latest_vital.spo2}%</strong></div>
                  <div>Temp: <strong>{item.latest_vital.temperature}°C</strong></div>
                </div>
              )}

              {/* Risk Score & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isHigh ? 'var(--risk-high)' : 'inherit' }}>
                    {item.score} / 100
                  </div>
                  <Badge status={item.risk_category} size="sm" />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectPatient(item.patient_id)}
                  rightIcon={<ArrowUpRight size={15} />}
                >
                  Clinical Review
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
