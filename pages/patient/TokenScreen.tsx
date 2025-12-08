import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CURRENT_PATIENT } from '../../data/mockData';

export const TokenScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Joined!</h1>
          <p className="text-slate-500">You have been successfully added to the list.</p>
        </div>

        <Card className="w-full p-8 mb-8 border-t-4 border-t-blue-600">
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
        </Card>

        <Button 
          onClick={() => navigate('/patient/tracking')} 
          fullWidth 
          className="shadow-lg shadow-blue-200"
        >
          Track My Queue
        </Button>
      </main>
    </div>
  );
};