import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RoleSelection } from './pages/RoleSelection';
import { PatientLogin } from './pages/patient/PatientLogin';
import { PatientSignup } from './pages/patient/PatientSignup';
import { DoctorList } from './pages/patient/DoctorList';
import { TokenScreen } from './pages/patient/TokenScreen';
import { AppointmentConfirmation } from './pages/patient/AppointmentConfirmation';
import { QueueTracking } from './pages/patient/QueueTracking';
import { StaffLogin } from './pages/staff/StaffLogin';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffPage } from './pages/staff/StaffPage';
import { UpdateDoctors } from './pages/staff/UpdateDoctors';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Role Selection */}
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Patient Flow */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/signup" element={<PatientSignup />} />
        <Route path="/patient/doctors" element={<DoctorList />} />
        <Route path="/patient/token" element={<TokenScreen />} />
        <Route path="/patient/appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="/patient/tracking" element={<QueueTracking />} />

        {/* Staff Flow */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/staff-page" element={<StaffPage />} />
        <Route path="/staff/update-doctors" element={<UpdateDoctors />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;