import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CURRENT_PATIENT } from '../../data/mockData';
import { getTokenStatusLabel, getTokenStatusColor } from '../../utils/tokenStatus';

export const TokenScreen: React.FC = () => {
  const navigate = useNavigate();
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [patientStatus, setPatientStatus] = useState(CURRENT_PATIENT.status);
  const [missedAppointment, setMissedAppointment] = useState(false);
  
  const statusColor = getTokenStatusColor(patientStatus);
  const statusLabel = getTokenStatusLabel(patientStatus);

  // Check if patient missed their appointment
  useEffect(() => {
    if (patientStatus === 'waiting' && CURRENT_PATIENT.scheduledTime && CURRENT_PATIENT.scheduledDate) {
      const appointmentDate = new Date(`${CURRENT_PATIENT.scheduledDate}T${CURRENT_PATIENT.scheduledTime}`);
      const currentTime = new Date();
      
      // If current time is past scheduled time by 5+ minutes, mark as missed
      const timeDifference = currentTime.getTime() - appointmentDate.getTime();
      if (timeDifference > 5 * 60 * 1000) { // 5 minutes in milliseconds
        setMissedAppointment(true);
        setPatientStatus('no-show');
      }
    }
  }, [patientStatus]);

  const handleReEnter = () => {
    setPatientStatus('re-enter');
    setMissedAppointment(false);
  };

  // Show banner for no-show or re-enter statuses
  const shouldShowBanner = !dismissedBanner && (patientStatus === 'no-show' || patientStatus === 're-enter');


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Status Banner */}
        {shouldShowBanner && (
          <div className={`w-full mb-8 p-4 rounded-lg border-2 ${
            patientStatus === 'no-show' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className={`font-bold ${
                  patientStatus === 'no-show' 
                    ? 'text-red-700' 
                    : 'text-yellow-700'
                }`}>
                  {patientStatus === 'no-show' 
                    ? (missedAppointment ? '⏰ You missed your appointment' : '⚠️ You were marked as No-Show')
                    : '✓ You have been added back into the queue'}
                </p>
                <p className={`text-sm mt-1 ${
                  patientStatus === 'no-show' 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`}>
                  {patientStatus === 'no-show'
                    ? (missedAppointment 
                      ? `You missed your appointment at ${CURRENT_PATIENT.scheduledTime}. Click "Re-Enter" to join the priority queue.`
                      : 'Please contact the counter to re-enter the queue.')
                    : 'Please stay nearby. You will be called next.'}
                </p>
              </div>
              <button
                onClick={() => setDismissedBanner(true)}
                className="text-slate-400 hover:text-slate-600 ml-2"
              >
                ✕
              </button>
            </div>
            {missedAppointment && patientStatus === 'no-show' && (
              <button
                onClick={handleReEnter}
                className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Re-Enter Queue
              </button>
            )}
          </div>
        )}
        
        <div className="w-full mb-8 text-center">
          <div className={`inline-flex items-center justify-center p-3 ${statusColor.bg} ${statusColor.text} rounded-full mb-4`}>
            {patientStatus === 'served' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {patientStatus === 'active' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {patientStatus === 'waiting' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {patientStatus === 're-enter' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            {patientStatus === 'no-show' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{statusLabel}</h1>
          {patientStatus === 'waiting' && (
            <p className="text-slate-500">You have been successfully added to the list.</p>
          )}
          {patientStatus === 'served' && (
            <p className="text-slate-500">Thank you for visiting us!</p>
          )}
        </div>

        <Card className={`w-full p-8 mb-8 border-t-4 ${
          patientStatus === 'no-show' ? 'border-t-red-600' :
          patientStatus === 're-enter' ? 'border-t-yellow-600' :
          patientStatus === 'active' ? 'border-t-green-600' :
          patientStatus === 'served' ? 'border-t-slate-600' :
          'border-t-blue-600'
        }`}>
          <div className="text-center border-b border-slate-100 pb-6 mb-6">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Your Token Number</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{CURRENT_PATIENT.token}</h2>
          </div>

          <div className="flex justify-center mb-6">
            {/* Placeholder QR Code */}
            <div className="bg-slate-900 p-4 rounded-lg">
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white"/>
                    <rect x="10" y="10" width="30" height="30" fill="black"/>
                    <rect x="60" y="10" width="30" height="30" fill="black"/>
                    <rect x="10" y="60" width="30" height="30" fill="black"/>
                    <rect x="50" y="50" width="10" height="10" fill="black"/>
                    <rect x="70" y="60" width="20" height="20" fill="black"/>
                    <rect x="50" y="80" width="20" height="10" fill="black"/>
                </svg>
            </div>
          </div>

          {patientStatus !== 'no-show' && patientStatus !== 'served' && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-500">Position</p>
                <p className="text-xl font-bold text-slate-900">#{CURRENT_PATIENT.position}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Est. Wait</p>
                <p className="text-xl font-bold text-slate-900">{CURRENT_PATIENT.estimatedWait} min</p>
              </div>
            </div>
          )}
        </Card>

        {patientStatus === 'active' && (
          <Button 
            onClick={() => navigate('/patient/tracking')} 
            fullWidth 
            className="shadow-lg shadow-green-200"
          >
            Please Go to Counter
          </Button>
        )}
        {patientStatus === 'waiting' && (
          <Button 
            onClick={() => navigate('/patient/tracking')} 
            fullWidth 
            className="shadow-lg shadow-blue-200"
          >
            Track My Queue
          </Button>
        )}
        {patientStatus === 're-enter' && (
          <Button 
            onClick={() => navigate('/patient/tracking')} 
            fullWidth 
            className="shadow-lg shadow-yellow-200"
          >
            Go to Counter
          </Button>
        )}
        {patientStatus === 'served' && (
          <Button 
            onClick={() => navigate('/patient/doctors')} 
            fullWidth 
            className="shadow-lg shadow-slate-200"
          >
            Back to Doctors
          </Button>
        )}
        {patientStatus === 'no-show' && !missedAppointment && (
          <Button 
            onClick={() => navigate('/patient/doctors')} 
            fullWidth 
            className="shadow-lg shadow-red-200"
          >
            Go Back
          </Button>
        )}
      </main>
    </div>
  );
};