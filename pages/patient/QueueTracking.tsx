import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CURRENT_PATIENT, DOCTORS } from '../../data/mockData';

export const QueueTracking: React.FC = () => {
  const navigate = useNavigate();
  // Mocking the doctor for this patient
  const assignedDoctor = DOCTORS[0]; 

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Status Header */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 font-medium mb-1">Current Status</p>
              <h1 className="text-3xl font-bold">Waiting in Queue</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="font-bold">#{CURRENT_PATIENT.position}</span>
            </div>
          </div>

          <div className="relative pt-4">
             {/* Progress Bar Background */}
            <div className="h-2 bg-blue-800 rounded-full w-full"></div>
            {/* Progress Bar Fill - 60% for demo */}
            <div className="absolute top-4 left-0 h-2 bg-white rounded-full w-3/5"></div>
            {/* Indicator Dot */}
            <div className="absolute top-2.5 left-[60%] w-5 h-5 bg-white rounded-full border-4 border-blue-600 shadow-md transform -translate-x-1/2"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-blue-100">
             <span>Joined</span>
             <span>Almost there</span>
             <span>Served</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-slate-500 text-sm mb-1">People Ahead</p>
            <p className="text-2xl font-bold text-slate-800">{CURRENT_PATIENT.position - 1}</p>
          </Card>
          <Card className="p-4">
            <p className="text-slate-500 text-sm mb-1">Est. Time Remaining</p>
            <p className="text-2xl font-bold text-slate-800">{CURRENT_PATIENT.estimatedWait} mins</p>
          </Card>
        </div>

        {/* Doctor Info */}
        <Card className="p-6 mb-8 flex items-center gap-4">
           <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
             </svg>
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase">Assigned Doctor</p>
             <h3 className="text-lg font-bold text-slate-900">{assignedDoctor.name}</h3>
             <p className="text-slate-500 text-sm">{assignedDoctor.specialty}</p>
           </div>
        </Card>

        <div className="text-center">
            <Button variant="danger" onClick={() => navigate('/')} className="w-full sm:w-auto">
                Leave Queue
            </Button>
            <p className="mt-4 text-xs text-slate-400">
                Leaving the queue will forfeit your current position.
            </p>
        </div>

      </main>
    </div>
  );
};