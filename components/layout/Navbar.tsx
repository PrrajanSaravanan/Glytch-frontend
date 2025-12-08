import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple check to determine if we are in staff view or patient view based on path
  const isStaff = location.pathname.includes('/staff');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-slate-800">QueueLens</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
              {isStaff ? 'Staff Portal' : 'Patient Portal'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};