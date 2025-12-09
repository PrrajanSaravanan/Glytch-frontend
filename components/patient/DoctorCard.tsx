import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor, CrowdLevel } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DoctorCardProps {
  doctor: Doctor;
  onJoin: (id: string) => void;
}

const getCrowdColor = (level?: CrowdLevel) => {
  switch (level) {
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500', label: 'Low' };
    case 'moderate':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500', label: 'Moderate' };
    case 'high':
      return { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500', label: 'High' };
    case 'very-high':
      return { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500', label: 'Very High' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', badge: 'bg-slate-500', label: 'Unknown' };
  }
};

const getAvailabilityStatus = (isPresent: boolean, shifts: any[]) => {
  if (!isPresent) {
    return { label: 'Offline', color: 'text-red-600', bg: 'bg-red-50', icon: '⚪' };
  }
  return { label: 'Online', color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' };
};

const getTodayShift = (shifts: any[]) => {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  return shifts.find(s => s.dayOfWeek === dayName);
};

const getNextAvailableShift = (shifts: any[]) => {
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOrder[nextDayIndex];
    const shift = shifts.find(s => s.dayOfWeek === nextDay);
    if (shift) {
      return { day: nextDay, shift };
    }
  }
  return null;
};

const generateAppointmentNumber = () => {
  return `APT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
};

const formatDate = (dayOfWeek: string) => {
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  
  const dayIndex = daysOrder.indexOf(dayOfWeek);
  let daysAhead = (dayIndex - currentDayIndex) % 7;
  if (daysAhead <= 0) daysAhead += 7;
  
  const appointmentDate = new Date(today);
  appointmentDate.setDate(appointmentDate.getDate() + daysAhead);
  
  return appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onJoin }) => {
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const crowdInfo = getCrowdColor(doctor.crowdLevel);
  const availabilityStatus = getAvailabilityStatus(doctor.isPresent, doctor.shifts);
  const todayShift = getTodayShift(doctor.shifts);
  const nextAvailable = getNextAvailableShift(doctor.shifts);
  
  return (
    <>
      <Card className="p-6 flex flex-col h-full hover:border-blue-300">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
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
          
          <p className="text-slate-500 text-sm mb-3">{doctor.qualification} • {doctor.experience}</p>
          
          {/* Availability Status */}
          <div className={`${availabilityStatus.bg} rounded-lg p-3 mb-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{availabilityStatus.icon}</span>
                <span className={`text-sm font-bold ${availabilityStatus.color}`}>{availabilityStatus.label}</span>
              </div>
              {todayShift && (
                <span className="text-xs bg-white px-2 py-1 rounded font-medium text-slate-600">
                  {todayShift.startTime} - {todayShift.endTime}
                </span>
              )}
            </div>
            {!todayShift && nextAvailable && (
              <p className="text-xs text-slate-600">Next available: {nextAvailable.day} ({nextAvailable.shift.startTime} - {nextAvailable.shift.endTime})</p>
            )}
            {!todayShift && !nextAvailable && (
              <p className="text-xs text-slate-600">Not available today</p>
            )}
          </div>

          {/* Schedule Toggle */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium mb-3 flex items-center gap-1"
          >
            {showSchedule ? '▼ Hide Schedule' : '▶ View Full Schedule'}
          </button>

          {/* Weekly Schedule */}
          {showSchedule && (
            <div className="bg-slate-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-bold text-slate-700 mb-2">Weekly Schedule</p>
              <div className="space-y-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const shift = doctor.shifts.find(s => s.dayOfWeek === day);
                  return (
                    <div key={day} className="flex justify-between text-xs text-slate-600">
                      <span className="font-medium">{day.slice(0, 3)}</span>
                      <span>{shift ? `${shift.startTime} - ${shift.endTime}` : 'Off'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Crowd Status Indicator - Only show if doctor is present */}
          {doctor.isPresent && (
            <div className={`${crowdInfo.bg} ${crowdInfo.text} p-3 rounded-lg mb-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide">Crowd Status</span>
                <span className="text-xs font-bold">{crowdInfo.label}</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                <div 
                  className={`${crowdInfo.badge} h-full rounded-full transition-all duration-500`}
                  style={{
                    width: doctor.crowdLevel === 'low' ? '25%' : 
                           doctor.crowdLevel === 'moderate' ? '50%' : 
                           doctor.crowdLevel === 'high' ? '75%' : 
                           doctor.crowdLevel === 'very-high' ? '100%' : '0%'
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Queue and Wait Time - Only show if doctor is present */}
          {doctor.isPresent && (
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
          )}
        </div>
        
        <Button 
          onClick={() => {
            if (doctor.isPresent) {
              onJoin(doctor.id);
            } else {
              setShowBookingModal(true);
            }
          }} 
          fullWidth
        >
          {doctor.isPresent ? 'Book Appointment' : 'Book on Available Schedule'}
        </Button>
      </Card>

      {/* Booking Modal for Unavailable Doctors */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{doctor.name}</h2>
            <p className="text-slate-600 mb-4">Doctor is currently unavailable. Please select an available time slot:</p>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const shift = doctor.shifts.find(s => s.dayOfWeek === day);
                if (!shift) return null;
                return (
                  <div 
                    key={day}
                    className="p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => {
                      const appointmentNumber = generateAppointmentNumber();
                      const formattedDate = formatDate(day);
                      const time = `${shift.startTime} AM`;
                      
                      navigate('/patient/appointment-confirmation', {
                        state: {
                          appointmentNumber,
                          doctorName: doctor.name,
                          specialty: doctor.specialty,
                          date: formattedDate,
                          time,
                          dayOfWeek: day,
                        }
                      });
                      setShowBookingModal(false);
                    }}
                  >
                    <p className="font-semibold text-slate-900">{day}</p>
                    <p className="text-sm text-blue-600">{shift.startTime} - {shift.endTime}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
          </Card>
        </div>
      )}
    </>
  );
};