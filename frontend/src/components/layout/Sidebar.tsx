import React from 'react';
import { useAuth } from '../../features/authentication/AuthContext';
import {
  LayoutDashboard,
  HeartPulse,
  Pill,
  Calendar,
  FileText,
  FileSpreadsheet,
  MapPin,
  Users,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const patientNav = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'vitals', label: 'Vitals & Scoring', icon: <HeartPulse size={18} /> },
    { id: 'medicines', label: 'Medications', icon: <Pill size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'reports', label: 'Medical Reports', icon: <FileText size={18} /> },
    { id: 'prescription', label: 'Prescription AI', icon: <FileSpreadsheet size={18} /> },
    { id: 'care-finder', label: 'Care Finder', icon: <MapPin size={18} /> },
  ];

  const doctorNav = [
    { id: 'doctor-dashboard', label: 'Clinical Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'doctor-triage', label: 'Triage Priority Queue', icon: <Flame size={18} color="#dc2626" /> },
    { id: 'doctor-patients', label: 'Patient Roster', icon: <Users size={18} /> },
    { id: 'doctor-appointments', label: 'Appointments Schedule', icon: <Calendar size={18} /> },
    { id: 'care-finder', label: 'Care Directory', icon: <MapPin size={18} /> },
  ];

  const items = isDoctor ? doctorNav : patientNav;

  return (
    <aside
      aria-label="Sidebar Navigation"
      style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        minHeight: 'calc(100vh - 68px)',
        padding: '1.25rem 0.75rem',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.1s ease-in-out',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
