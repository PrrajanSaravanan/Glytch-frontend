import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AppointmentData {
  appointmentNumber: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  dayOfWeek: string;
  age?: string;
  visitReason?: string;
}

export const AppointmentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state as AppointmentData;

  // Fallback data if navigation state is missing
  const fallback: AppointmentData = {
    appointmentNumber: 'APT-5001',
    doctorName: 'Dr. Emily Chen',
    specialty: 'Pediatrician',
    date: 'Monday, December 15, 2025',
    time: '10:00 AM',
    dayOfWeek: 'Monday',
    age: '30',
    visitReason: 'Regular checkup',
  };

  const data = appointment || fallback;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Booked!</h1>
          <p className="text-slate-500">Your appointment has been successfully scheduled.</p>
        </div>

        {/* Doctor Info Card */}
        <Card className="w-full p-6 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 border-l-4 border-l-blue-600">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Appointment Number</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{data.appointmentNumber}</h2>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Doctor</p>
              <p className="text-lg font-bold text-slate-900">{data.doctorName}</p>
              <p className="text-sm text-blue-600">{data.specialty}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
                <p className="text-sm font-bold text-slate-900">{data.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Time</p>
                <p className="text-sm font-bold text-slate-900">{data.time}</p>
              </div>
            </div>

            {data.age && (
              <div className="border-t border-slate-200 pt-4 mt-4">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Patient Details</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="font-semibold text-slate-900">{data.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reason for Visit</p>
                    <p className="font-semibold text-slate-900">{data.visitReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="w-full p-4 mb-8 bg-amber-50 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-amber-700 uppercase mb-2">Important Notes</p>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Please arrive 10-15 minutes before your appointment</li>
            <li>• Keep your appointment number handy</li>
            <li>• In case of cancellation, notify us 24 hours in advance</li>
          </ul>
        </Card>

        <div className="w-full space-y-3">
          <Button 
            onClick={() => navigate('/patient/doctors')} 
            fullWidth 
            className="shadow-lg shadow-blue-200"
          >
            Back to Doctors
          </Button>
          <button
            onClick={() => window.print()}
            className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
          >
            Print Appointment
          </button>
        </div>
      </main>
    </div>
  );
};
