import React from 'react';
import { useAuth } from '../../features/authentication/AuthContext';
import { Activity, LogOut, User as UserIcon, Stethoscope, Bot } from 'lucide-react';
import { Button } from '../common/Button';

interface NavbarProps {
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: '#0f172a', /* Deep Slate / Navy */
        color: '#ffffff',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Healthcare<span style={{ color: '#818cf8' }}>AI</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                color: '#94a3b8',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Clinical & Patient Platform
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* AI Assistant Quick Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAssistant}
            leftIcon={<Bot size={16} />}
            style={{ color: '#c7d2fe', borderColor: '#4338ca', backgroundColor: 'rgba(67, 56, 202, 0.2)' }}
          >
            AI Assistant
          </Button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  {user.role === 'doctor' ? <Stethoscope size={12} color="#818cf8" /> : <UserIcon size={12} />}
                  <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                aria-label="Log out of application"
                title="Log out"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
