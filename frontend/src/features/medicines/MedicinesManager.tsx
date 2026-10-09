import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { Medicine } from '../../types';
import { Plus, Search, Sparkles } from 'lucide-react';

export const MedicinesManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Med Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');

  // AI Explainer State
  const [explainQuery, setExplainQuery] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getMedicines(false);
      setMedicines(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load medicines.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addMedicine({
        name,
        dosage,
        frequency,
        instructions,
        route: 'Oral',
        is_active: true,
      });
      setIsAddOpen(false);
      setName('');
      setDosage('');
      setFrequency('');
      setInstructions('');
      fetchMedicines();
    } catch (err: any) {
      alert(`Error saving medicine: ${err.message}`);
    }
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      await api.updateMedicine(id, { is_active: !current });
      fetchMedicines();
    } catch (err: any) {
      alert(`Error updating medicine: ${err.message}`);
    }
  };

  const handleExplainMedicine = async (drugToExplain?: string) => {
    const target = drugToExplain || explainQuery;
    if (!target) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await api.explainMedicine(target);
      setExplanation(res.explanation);
    } catch (err: any) {
      setExplanation(`Error generating explanation: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Prescribed Medications & Regimens</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track active schedules and consult AI educational summaries
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)} leftIcon={<Plus size={16} />}>
          Add Medication
        </Button>
      </div>

      {/* AI Medicine Explainer Search Box */}
      <Card
        title="AI Medicine Explainer"
        subtitle="Search any medication for an educational summary of mechanisms, precautions, and side effects"
        style={{ border: '1.5px solid #c7d2fe', backgroundColor: '#fcfdff' }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Enter medicine name (e.g. Metformin, Amoxicillin, Lisinopril)..."
              value={explainQuery}
              onChange={(e) => setExplainQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplainMedicine()}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => handleExplainMedicine()}
            isLoading={isExplaining}
            leftIcon={<Sparkles size={16} />}
          >
            Explain Drug
          </Button>
        </div>

        {explanation && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.6,
              fontSize: '0.9rem',
              whiteSpace: 'pre-line',
            }}
          >
            {explanation}
          </div>
        )}
      </Card>

      {/* Medicines Table */}
      {isLoading && <Spinner label="Loading medications..." />}
      {error && <Alert type="danger">{error}</Alert>}

      {!isLoading && (
        <Card title="Active & Past Medication Regimens">
          {medicines.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Medication</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Dosage & Route</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Dosing Schedule</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Prescriber / Source</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{m.dosage} • {m.route}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div>{m.frequency}</div>
                        {m.instructions && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.instructions}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{m.prescribed_by || 'Self-Reported'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: m.is_active ? 'var(--risk-low-bg)' : 'var(--bg-surface-subtle)',
                            color: m.is_active ? 'var(--risk-low)' : 'var(--text-muted)',
                          }}
                        >
                          {m.is_active ? 'ACTIVE' : 'COMPLETED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setExplainQuery(m.name);
                              handleExplainMedicine(m.name);
                            }}
                            title="Explain this medicine"
                          >
                            <Sparkles size={14} color="var(--color-primary)" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleActive(m.id, m.is_active)}
                          >
                            {m.is_active ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No medications logged.</p>
          )}
        </Card>
      )}

      {/* Add Medication Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Medication">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Medication Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin 500mg"
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Dosage
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 1 tablet"
                style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Frequency
              </label>
              <input
                type="text"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Twice daily after meals"
                style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Special Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with full glass of water"
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Medication</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
