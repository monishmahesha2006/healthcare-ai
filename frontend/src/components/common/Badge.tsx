import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, CheckCircle2, Clock } from 'lucide-react';

interface BadgeProps {
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let bg = 'var(--bg-surface-subtle)';
  let color = 'var(--text-secondary)';
  let border = 'var(--border-subtle)';
  let icon = <Info size={size === 'sm' ? 12 : 14} />;
  let label = status;

  if (norm === 'LOW') {
    bg = 'var(--risk-low-bg)';
    color = 'var(--risk-low)';
    border = 'var(--risk-low-border)';
    icon = <ShieldCheck size={size === 'sm' ? 12 : 14} />;
    label = 'LOW RISK';
  } else if (norm === 'MODERATE') {
    bg = 'var(--risk-mod-bg)';
    color = 'var(--risk-mod)';
    border = 'var(--risk-mod-border)';
    icon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
    label = 'MODERATE RISK';
  } else if (norm === 'HIGH') {
    bg = 'var(--risk-high-bg)';
    color = 'var(--risk-high)';
    border = 'var(--risk-high-border)';
    icon = <AlertOctagon size={size === 'sm' ? 12 : 14} />;
    label = 'HIGH RISK';
  } else if (norm === 'CONFIRMED' || norm === 'COMPLETED') {
    bg = 'var(--risk-low-bg)';
    color = 'var(--risk-low)';
    border = 'var(--risk-low-border)';
    icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
    label = status.toUpperCase();
  } else if (norm === 'SCHEDULED') {
    bg = 'var(--color-primary-light)';
    color = 'var(--color-primary)';
    border = '#c7d2fe';
    icon = <Clock size={size === 'sm' ? 12 : 14} />;
    label = 'SCHEDULED';
  }

  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '0.75rem' : '0.825rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        letterSpacing: '0.025em',
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
