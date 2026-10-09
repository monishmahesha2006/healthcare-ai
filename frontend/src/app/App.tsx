import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../features/authentication/AuthContext';
import { LoginPage } from '../features/authentication/LoginPage';
import { RegisterPage } from '../features/authentication/RegisterPage';
import { Layout } from '../components/layout/Layout';
import { Spinner } from '../components/common/Spinner';

// Patient Feature Views
import { PatientDashboard } from '../features/patient/PatientDashboard';
import { VitalsHistoryTable } from '../features/vitals/VitalsHistoryTable';
import { MedicinesManager } from '../features/medicines/MedicinesManager';
import { AppointmentsManager } from '../features/appointments/AppointmentsManager';
import { ReportsManager } from '../features/reports/ReportsManager';
import { PrescriptionScanner } from '../features/prescription/PrescriptionScanner';
import { CareFinderPage } from '../features/care-finder/CareFinderPage';

// Doctor Feature Views
import { DoctorDashboard } from '../features/doctor/DoctorDashboard';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const isDoctor = user.role === 'doctor';

  const renderActiveView = () => {
    if (isDoctor) {
      if (currentTab === 'care-finder') return <CareFinderPage />;
      return <DoctorDashboard />;
    }

    // Patient views
    switch (currentTab) {
      case 'dashboard':
        return <PatientDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
      case 'vitals':
        return <VitalsHistoryTable />;
      case 'medicines':
        return <MedicinesManager />;
      case 'appointments':
        return <AppointmentsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'prescription':
        return <PrescriptionScanner onPrescriptionCommitted={() => setCurrentTab('medicines')} />;
      case 'care-finder':
        return <CareFinderPage />;
      default:
        return <PatientDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)}>
      {renderActiveView()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
