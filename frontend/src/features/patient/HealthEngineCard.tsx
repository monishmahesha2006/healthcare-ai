import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { HealthScoreGauge } from '../../components/charts/HealthScoreGauge';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface HealthEngineCardProps {
  score: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | string;
  deductionsSummary?: string;
  onOpenLogger: () => void;
}

export const HealthEngineCard: React.FC<HealthEngineCardProps> = ({
  score,
  riskCategory,
  deductionsSummary,
  onOpenLogger,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  let deductions: any[] = [];
  if (deductionsSummary) {
    try {
      deductions = JSON.parse(deductionsSummary);
    } catch {
      deductions = [];
    }
  }

  return (
    <Card
      title="HealthEngine Physiological Score"
      subtitle="Deterministic vital-sign risk evaluation engine (v1.0.0)"
      headerAction={
        <Button variant="outline" size="sm" onClick={onOpenLogger}>
          Log New Vitals
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
        {/* Visual Gauge */}
        <div>
          <HealthScoreGauge score={score} riskCategory={riskCategory} size={180} />
        </div>

        {/* Narrative & Clinical Explanation */}
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {riskCategory === 'LOW' && 'Stable Physiological Metrics'}
            {riskCategory === 'MODERATE' && 'Mild to Moderate Metric Deviations'}
            {riskCategory === 'HIGH' && 'Acute Physiological Deviations Detected'}
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {riskCategory === 'LOW' &&
              'Your recorded vital parameters (heart rate, blood glucose, blood pressure, temperature, and SpO2) are within baseline clinical reference zones.'}
            {riskCategory === 'MODERATE' &&
              'One or more recorded vital signs reflect deviations from baseline. Review the specific deduction parameters below and monitor your metrics.'}
            {riskCategory === 'HIGH' &&
              'Multiple vital signs reflect significant physiological anomalies. Your profile has been prioritized in your clinical care team’s triage queue.'}
          </p>

          {/* Deductions accordion trigger */}
          {deductions.length > 0 ? (
            <div>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.75rem',
                }}
              >
                <span>{showBreakdown ? 'Hide Rule Deduction Breakdown' : `View ${deductions.length} Triggered Rule Deduction(s)`}</span>
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showBreakdown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {deductions.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--risk-high)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.2rem' }}>
                        <span>{d.parameter} ({d.condition})</span>
                        <span style={{ color: 'var(--risk-high)' }}>-{d.deduction} pts</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{d.explanation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--risk-low)', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>Zero rule deductions triggered. All vital boundaries satisfied.</span>
            </div>
          )}

          <Alert type="info">
            <strong>Clinical Safety Notice:</strong> HealthEngine scores provide automated physiological status indicators based on established vital thresholds. This calculation does not constitute a diagnostic evaluation.
          </Alert>
        </div>
      </div>
    </Card>
  );
};
