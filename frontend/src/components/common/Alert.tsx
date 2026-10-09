import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children }) => {
  let bg = 'var(--bg-surface-subtle)';
  let color = 'var(--text-primary)';
  let border = 'var(--border-subtle)';
  let icon = <Info size={18} />;

  if (type === 'warning') {
    bg = 'var(--risk-mod-bg)';
    color = 'var(--risk-mod)';
    border = 'var(--risk-mod-border)';
    icon = <AlertTriangle size={18} />;
  } else if (type === 'danger') {
    bg = 'var(--risk-high-bg)';
    color = 'var(--risk-high)';
    border = 'var(--risk-high-border)';
    icon = <AlertCircle size={18} />;
  } else if (type === 'success') {
    bg = 'var(--risk-low-bg)';
    color = 'var(--risk-low)';
    border = 'var(--risk-low-border)';
    icon = <CheckCircle size={18} />;
  } else if (type === 'info') {
    bg = 'var(--color-primary-light)';
    color = 'var(--color-primary)';
    border = '#c7d2fe';
    icon = <Info size={18} />;
  }

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: '0.9rem',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{title}</div>}
        <div style={{ color: 'inherit' }}>{children}</div>
      </div>
    </div>
  );
};
