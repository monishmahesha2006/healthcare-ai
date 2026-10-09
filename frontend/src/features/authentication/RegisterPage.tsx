import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Activity } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        role,
        blood_group: role === 'patient' ? bloodGroup : undefined,
        specialty: role === 'doctor' ? specialty : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-subtle)',
          padding: '2.25rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <Activity size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Register for Healthcare AI</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Create your patient or clinician profile
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.25rem' }}>
            <Alert type="danger">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              I am registering as:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRole('patient')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'patient' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: role === 'patient' ? 'var(--color-primary-light)' : '#ffffff',
                  color: role === 'patient' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'doctor' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: role === 'doctor' ? 'var(--color-primary-light)' : '#ffffff',
                  color: role === 'doctor' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                Doctor / Clinician
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reg-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Full Legal Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          </div>

          <div>
            <label htmlFor="reg-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@healthcare.ai"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          </div>

          <div>
            <label htmlFor="reg-pass" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Password (min. 6 characters)
            </label>
            <input
              id="reg-pass"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          </div>

          {role === 'patient' ? (
            <div>
              <label htmlFor="reg-blood" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Blood Group
              </label>
              <select
                id="reg-blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="reg-spec" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Medical Specialty
              </label>
              <input
                id="reg-spec"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Cardiology, Internal Medicine"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
            Complete Registration
          </Button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
