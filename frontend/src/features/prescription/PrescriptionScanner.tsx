import React, { useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ParsedMedication, PrescriptionUploadResult } from '../../types';
import { UploadCloud, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PrescriptionScannerProps {
  onPrescriptionCommitted?: () => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ onPrescriptionCommitted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<PrescriptionUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable candidate medications
  const [candidates, setCandidates] = useState<ParsedMedication[]>([]);
  const [verifiedAll, setVerifiedAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setSuccessMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const res = await api.uploadPrescription(file);
      setResult(res);
      setCandidates(res.medications);
    } catch (err: any) {
      setError(err.message || 'Prescription OCR upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateCandidate = (index: number, field: keyof ParsedMedication, val: any) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: val };
    setCandidates(updated);
  };

  const handleCommitVerified = async () => {
    if (!verifiedAll) {
      alert('Please check the confirmation box indicating you have verified these medications against your physical prescription.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const saveRes = await api.saveVerifiedPrescription(candidates);
      setSuccessMsg(`Success! ${saveRes.count} medication(s) confirmed and added to your active medications list.`);
      setResult(null);
      setFile(null);
      if (onPrescriptionCommitted) onPrescriptionCommitted();
    } catch (err: any) {
      setError(err.message || 'Failed to commit verified prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Prescription AI & OCR Scanner</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Digitize prescription orders with OCR extraction and mandatory human clinical verification
        </p>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {error && <Alert type="danger">{error}</Alert>}

      {/* Upload Box */}
      <Card
        title="Upload Physical Prescription Image"
        subtitle="Supported formats: JPG, PNG, WEBP, PDF (max 10 MB)"
      >
        <div
          style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('rx-file-input')?.click()}
        >
          <input
            id="rx-file-input"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
            <UploadCloud size={32} color="var(--color-primary)" />
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
            {file ? file.name : 'Click to select prescription file or drag & drop'}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Google Cloud Vision OCR processes medication names, dosage strengths, and schedules
          </p>
        </div>

        {file && (
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setFile(null)}>
              Clear
            </Button>
            <Button variant="primary" onClick={handleUpload} isLoading={isUploading}>
              Scan & Extract Medications
            </Button>
          </div>
        )}
      </Card>

      {/* Extracted Candidates & Mandatory Verification */}
      {result && (
        <Card
          title="Extracted Candidate Medications"
          subtitle={`OCR Engine: ${result.ocr_source} • Requires Human Verification`}
          headerAction={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 600, fontSize: '0.85rem' }}>
              <ShieldAlert size={16} /> Human Verification Mandatory
            </div>
          }
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <Alert type="warning">
              <strong>Patient Safety Safeguard:</strong> {result.disclaimer} Review each extracted medication name, dosage strength, and frequency below.
            </Alert>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {candidates.map((cand, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Drug Name
                    </label>
                    <input
                      type="text"
                      value={cand.name}
                      onChange={(e) => handleUpdateCandidate(idx, 'name', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Strength / Dosage
                    </label>
                    <input
                      type="text"
                      value={cand.dosage}
                      onChange={(e) => handleUpdateCandidate(idx, 'dosage', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Schedule / Frequency
                    </label>
                    <input
                      type="text"
                      value={cand.frequency}
                      onChange={(e) => handleUpdateCandidate(idx, 'frequency', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Original Text Snippet
                  </label>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{cand.instructions}"
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Checkbox & Commit Button */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <input
                type="checkbox"
                checked={verifiedAll}
                onChange={(e) => setVerifiedAll(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                I have cross-checked and verified these medications against my original physical paper prescription.
              </span>
            </label>

            <Button
              variant="primary"
              size="lg"
              onClick={handleCommitVerified}
              disabled={!verifiedAll || isSaving}
              isLoading={isSaving}
              leftIcon={<CheckCircle2 size={18} />}
            >
              Confirm & Add to My Active Regimen
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
