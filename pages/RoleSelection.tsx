import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-4xl">Q</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">QueueLens</h1>
        <p className="text-slate-500 text-lg">Hospital Queue Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card 
          className="group hover:ring-4 ring-blue-100 transition-all transform hover:-translate-y-1"
          onClick={() => navigate('/patient/login')}
        >
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm a Patient</h2>
            <p className="text-slate-500">Find a doctor, join a queue, and track your status live.</p>
          </div>
        </Card>

        <Card 
          className="group hover:ring-4 ring-emerald-100 transition-all transform hover:-translate-y-1"
          onClick={() => navigate('/staff/login')}
        >
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm Staff</h2>
            <p className="text-slate-500">Manage queues, call patients, and update availability.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};