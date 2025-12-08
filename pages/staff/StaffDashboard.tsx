import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HoldListItem } from '../../components/staff/HoldListItem';
import { NEXT_PATIENT_STAFF_VIEW, STAFF_STATS, HOLD_LIST } from '../../data/mockData';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Local state for UI interactivity (doesn't persist)
  const [holdList, setHoldList] = useState(HOLD_LIST);

  const handleResume = (id: string) => {
    setHoldList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Queue Operations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 3.2.1 Next Patient Panel */}
            <Card className="p-0 border-l-4 border-l-blue-600 overflow-hidden">
              <div className="p-6 bg-white">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Serving Now</p>
                     <h2 className="text-3xl font-bold text-slate-900 mt-1">{NEXT_PATIENT_STAFF_VIEW.name}</h2>
                     <p className="text-blue-600 font-mono text-xl mt-1">{NEXT_PATIENT_STAFF_VIEW.token}</p>
                   </div>
                   <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                     Position #{NEXT_PATIENT_STAFF_VIEW.position}
                   </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <Button variant="success" className="flex-1 py-3 text-lg">
                    Mark Served
                  </Button>
                  <Button variant="outline" className="flex-1 py-3 text-lg border-amber-500 text-amber-600 hover:bg-amber-50">
                    Put on Hold
                  </Button>
                </div>
              </div>
            </Card>

            {/* 3.2.2 Queue Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center bg-white">
                <p className="text-slate-500 text-xs uppercase font-bold">Waiting</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{STAFF_STATS.waiting}</p>
              </Card>
              <Card className="p-4 text-center bg-white">
                <p className="text-slate-500 text-xs uppercase font-bold">Served</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{STAFF_STATS.served}</p>
              </Card>
              <Card className="p-4 text-center bg-white">
                <p className="text-slate-500 text-xs uppercase font-bold">Doctors</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{STAFF_STATS.doctorsAvailable}</p>
              </Card>
               <Card className="p-4 text-center bg-white">
                <p className="text-slate-500 text-xs uppercase font-bold">Avg Time</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{STAFF_STATS.avgServiceTime}</p>
              </Card>
            </div>

            {/* 3.2.3 Hold List */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                Patients on Hold 
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">{holdList.length}</span>
              </h3>
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-[400px] overflow-y-auto">
                {holdList.length > 0 ? (
                  holdList.map(item => (
                    <HoldListItem key={item.id} item={item} onResume={handleResume} />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    No patients currently on hold.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Controls */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button fullWidth onClick={() => {}} className="justify-between flex items-center">
                  <span>Call Next Patient</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
                
                <Button fullWidth variant="secondary" onClick={() => {}}>
                  Mark No-Show
                </Button>
                
                <div className="my-6 border-t border-slate-100"></div>
                
                <Button fullWidth variant="outline" onClick={() => navigate('/staff/update-doctors')}>
                  Update Doctors Count
                </Button>

                 <Button fullWidth variant="danger" className="mt-4" onClick={() => navigate('/')}>
                  Log Out
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};