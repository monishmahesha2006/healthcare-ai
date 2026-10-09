import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { MedicalReport } from '../../types';
import { Plus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('Blood Chemistry');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getReports();
      setReports(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load medical reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createReport({
        title,
        report_type: reportType,
        extracted_text: rawText,
      });
      setIsUploadOpen(false);
      setTitle('');
      setRawText('');
      fetchReports();
    } catch (err: any) {
      alert(`Error saving report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Diagnostic & Laboratory Reports</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Store medical records and review AI-assisted plain-language summaries
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)} leftIcon={<Plus size={16} />}>
          Upload Report
        </Button>
      </div>

      {isLoading && <Spinner label="Loading diagnostic records..." />}
      {error && <Alert type="danger">{error}</Alert>}

      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <Card key={r.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Category: <strong>{r.report_type}</strong> • Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    rightIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  >
                    {isExpanded ? 'Hide Details' : 'View AI Explanation'}
                  </Button>
                </div>

                {/* Quick Summary Pill */}
                {r.ai_summary && (
                  <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>Key Finding:</div>
                    <div>{r.ai_summary}</div>
                  </div>
                )}

                {/* Expanded Full AI Explanation */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {r.ai_explanation && (
                      <div style={{ padding: '1rem', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                          <Sparkles size={16} /> Gemini Medical Report Explanation
                        </div>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {r.ai_explanation}
                        </div>
                      </div>
                    )}

                    {r.extracted_text && (
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          Original Extracted Diagnostic Text:
                        </div>
                        <pre style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', overflowX: 'auto', maxHeight: '180px' }}>
                          {r.extracted_text}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Report Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Add Diagnostic Report">
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Report Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC) Laboratory Result"
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Report Type / Specialty
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="Blood Chemistry">Blood Chemistry / Metabolic</option>
              <option value="Cardiology">Cardiology / ECG / Echo</option>
              <option value="Radiology">Radiology / X-Ray / CT / MRI</option>
              <option value="Pathology">Pathology / Biopsy</option>
              <option value="General Diagnostic">General Diagnostic</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Diagnostic Text Content (Paste lab values or findings)
            </label>
            <textarea
              rows={6}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste lab parameters, e.g. Glucose 98 mg/dL, HbA1c 5.5%, Platelets 220,000 /mcL..."
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Analyze & Save Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
