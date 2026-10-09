import React from 'react';
import { Badge } from '../common/Badge';

interface HealthScoreGaugeProps {
  score: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | string;
  size?: number;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  riskCategory,
  size = 180,
}) => {
  const radius = size * 0.38;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  // Progress along circumference (0 to 100)
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  let strokeColor = 'var(--risk-low)';
  if (riskCategory === 'MODERATE') strokeColor = 'var(--risk-mod)';
  if (riskCategory === 'HIGH') strokeColor = 'var(--risk-high)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-label={`HealthEngine Score: ${score} out of 100, categorized as ${riskCategory} risk`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Animated indicator circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      {/* Centered numerical score */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: `${size * 0.22}px`, fontWeight: 700, color: 'var(--text-primary)' }}>
          {score}
        </span>
        <span style={{ fontSize: `${size * 0.09}px`, color: 'var(--text-muted)', display: 'block' }}>
          / 100
        </span>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <Badge status={riskCategory} size="md" />
      </div>
    </div>
  );
};
