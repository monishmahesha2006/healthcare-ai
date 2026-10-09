import React, { useState } from 'react';
import { VitalsRecord } from '../../types';
import { Button } from '../common/Button';

interface VitalsTrendChartProps {
  records: VitalsRecord[];
}

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ records }) => {
  const [activeMetric, setActiveMetric] = useState<'heart_rate' | 'blood_sugar' | 'systolic_bp' | 'spo2'>('heart_rate');
  const [showTable, setShowTable] = useState(false);

  if (!records || records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No vital recordings available yet for trend analysis.
      </div>
    );
  }

  // Sort chronological ascending for line drawing
  const sorted = [...records].reverse().slice(-10);

  const metricConfig = {
    heart_rate: { label: 'Heart Rate', unit: 'bpm', color: '#e11d48', min: 40, max: 140 },
    blood_sugar: { label: 'Blood Sugar', unit: 'mg/dL', color: '#d97706', min: 50, max: 250 },
    systolic_bp: { label: 'Systolic BP', unit: 'mmHg', color: '#4f46e5', min: 80, max: 180 },
    spo2: { label: 'SpO2 Oxygen', unit: '%', color: '#059669', min: 85, max: 100 },
  };

  const curr = metricConfig[activeMetric];

  // SVG dimensions
  const width = 640;
  const height = 220;
  const padding = 35;

  const points = sorted.map((r, i) => {
    const val = Number((r as any)[activeMetric]);
    const x = padding + (i / Math.max(1, sorted.length - 1)) * (width - padding * 2);
    const yRatio = (val - curr.min) / (curr.max - curr.min);
    const clampedYRatio = Math.max(0, Math.min(1, yRatio));
    const y = height - padding - clampedYRatio * (height - padding * 2);
    return { x, y, val, date: new Date(r.recorded_at).toLocaleDateString() };
  });

  const pathData = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {/* Metric selection tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {(['heart_rate', 'blood_sugar', 'systolic_bp', 'spo2'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.825rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeMetric === key ? '#ffffff' : 'transparent',
                color: activeMetric === key ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeMetric === key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {metricConfig[key].label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Show Chart' : 'Show Accessible Data Table'}
        </Button>
      </div>

      {!showTable ? (
        <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Horizontal guide lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-subtle)" />

            {/* Line connecting points */}
            {points.length > 1 && (
              <path d={pathData} fill="none" stroke={curr.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Point circles & labels */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke={curr.color} strokeWidth="2.5" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
                  {p.val}
                </text>
                <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        /* Accessible data table equivalent for screen readers & high-contrast review */
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Measurement</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Units</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.75rem' }}>{new Date(r.recorded_at).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{(r as any)[activeMetric]}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{curr.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
