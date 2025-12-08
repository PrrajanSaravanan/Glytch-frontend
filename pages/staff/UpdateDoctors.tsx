import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const UpdateDoctors: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(4); // Default placeholder

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-12">
        
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/staff/dashboard')} className="mb-4 text-sm px-3 py-1">
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Manage Availability</h1>
        </div>

        <Card className="p-8 text-center">
          <p className="text-slate-500 font-medium mb-6">Active Doctors</p>
          
          <div className="flex items-center justify-center gap-8 mb-8">
            <button 
              onClick={decrement}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-3xl font-bold transition-colors"
            >
              −
            </button>
            
            <div className="text-6xl font-bold text-blue-600 w-24">
              {count}
            </div>
            
            <button 
              onClick={increment}
              className="w-16 h-16 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-3xl font-bold transition-colors"
            >
              +
            </button>
          </div>

          <p className="text-sm text-slate-400 mb-8">
            Adjusting this number updates the estimated wait time calculations for all patients.
          </p>

          <Button fullWidth onClick={() => navigate('/staff/dashboard')}>
            Save Changes
          </Button>
        </Card>
      </main>
    </div>
  );
};