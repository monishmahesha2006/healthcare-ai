import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { HealthcareFacility } from '../../types';
import { MapPin, Phone, Star, Search, Navigation } from 'lucide-react';

export const CareFinderPage: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [query, setQuery] = useState('');
  const [facilityType, setFacilityType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('');

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const res = await api.searchFacilities(query || undefined, facilityType);
      setFacilities(res.facilities);
      setSource(res.source);
    } catch (err: any) {
      alert(`Error searching facilities: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [facilityType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Google Care Finder & Health Directory</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Locate licensed clinics, hospitals, pharmacies, and urgent care facilities nearby
        </p>
      </div>

      {/* Emergency Notice */}
      <Alert type="danger" title="Emergency Clinical Notice">
        If you or someone around you is experiencing acute chest pain, severe shortness of breath, sudden numbness, or a life-threatening medical emergency, call 911 (or your local emergency services) immediately.
      </Alert>

      {/* Search & Filter Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by facility name, specialty, or street..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Navigation size={16} />}>
            Search Facilities
          </Button>
        </form>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Facilities' },
            { id: 'hospital', label: 'Hospitals & Trauma' },
            { id: 'urgent care', label: 'Urgent Care' },
            { id: 'clinic', label: 'Specialty Clinics' },
            { id: 'pharmacy', label: 'Pharmacies' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFacilityType(f.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: facilityType === f.id ? 'var(--color-primary)' : 'var(--border-subtle)',
                backgroundColor: facilityType === f.id ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                color: facilityType === f.id ? 'var(--color-primary)' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Facility Results */}
      {isLoading ? (
        <Spinner label="Locating nearby facilities..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {facilities.map((fac) => (
            <Card key={fac.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {fac.facility_type}
                  </span>
                  {fac.emergency_services && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      24/7 ER
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{fac.name}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <Star size={14} fill="#d97706" />
                  <strong>{fac.rating.toFixed(1)}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>({fac.user_ratings_total} reviews)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{fac.address} {fac.distance_km ? `(${fac.distance_km} km away)` : ''}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span>{fac.phone}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: fac.open_now ? 'var(--risk-low)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {fac.open_now ? '● Open Now' : '○ Closed Currently'}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(fac.name + ' ' + fac.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-primary)' }}
                >
                  Directions →
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {source && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
          Directory Provider: {source} • Verify operational hours directly before traveling.
        </div>
      )}
    </div>
  );
};
