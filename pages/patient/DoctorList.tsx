import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { DOCTORS } from '../../data/mockData';

export const DoctorList: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinQueue = (id: string) => {
    // In a real app, this would make an API call.
    // Here we just navigate to the token screen.
    navigate(`/patient/token`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Available Doctors</h1>
          <p className="text-slate-500">Select a doctor to join their waiting queue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCTORS.map((doctor) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onJoin={handleJoinQueue} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};