import React from 'react';
import { Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DoctorCardProps {
  doctor: Doctor;
  onJoin: (id: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onJoin }) => {
  return (
    <Card className="p-6 flex flex-col h-full hover:border-blue-300">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
            <p className="text-blue-600 font-medium text-sm">{doctor.specialty}</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
             {/* Placeholder Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm mb-4">{doctor.qualification} • {doctor.experience}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 p-2 rounded-lg text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">Queue</p>
            <p className="text-lg font-bold text-slate-900">{doctor.queueLength}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">Est. Wait</p>
            <p className="text-lg font-bold text-slate-900">{doctor.estimatedWaitTime}</p>
          </div>
        </div>
      </div>
      
      <Button onClick={() => onJoin(doctor.id)} fullWidth>
        Join Queue
      </Button>
    </Card>
  );
};