import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { RoleSelection } from './pages/RoleSelection';
import { DoctorList } from './pages/patient/DoctorList';
import { TokenScreen } from './pages/patient/TokenScreen';
import { QueueTracking } from './pages/patient/QueueTracking';
import { StaffLogin } from './pages/staff/StaffLogin';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { UpdateDoctors } from './pages/staff/UpdateDoctors';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Startup / Role Selection */}
        <Route path="/" element={<RoleSelection />} />

        {/* Patient Flow */}
        <Route path="/patient/doctors" element={<DoctorList />} />
        <Route path="/patient/token" element={<TokenScreen />} />
        <Route path="/patient/tracking" element={<QueueTracking />} />

        {/* Staff Flow */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/update-doctors" element={<UpdateDoctors />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;