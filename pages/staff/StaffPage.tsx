import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Patient {
  id: string;
  name: string;
  tokenNumber: string;
  status: 'waiting' | 'active' | 'served' | 'no-show';
  appointmentTime: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  isAvailable: boolean;
  patients?: Patient[];
}

export const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([
    { 
      id: '1', 
      name: 'Dr. Emily Chen', 
      specialty: 'Pediatrician', 
      qualification: 'MBBS', 
      experience: '8 years', 
      isAvailable: true,
      patients: [
        { id: 'p1', name: 'John Doe', tokenNumber: 'TKN-1234', status: 'waiting', appointmentTime: '10:00 AM' },
        { id: 'p2', name: 'Alice Johnson', tokenNumber: 'TKN-1235', status: 'active', appointmentTime: '10:30 AM' },
      ]
    },
    { 
      id: '2', 
      name: 'Dr. Michael Johnson', 
      specialty: 'Cardiologist', 
      qualification: 'MD', 
      experience: '12 years', 
      isAvailable: true,
      patients: [
        { id: 'p3', name: 'Robert Smith', tokenNumber: 'TKN-1236', status: 'waiting', appointmentTime: '11:00 AM' },
      ]
    },
    { 
      id: '3', 
      name: 'Dr. Sarah Williams', 
      specialty: 'Dermatologist', 
      qualification: 'MBBS', 
      experience: '6 years', 
      isAvailable: false,
      patients: [
        { id: 'p4', name: 'Linda Taylor', tokenNumber: 'TKN-1237', status: 'served', appointmentTime: '09:00 AM' },
      ]
    },
    { 
      id: '4', 
      name: 'Dr. James Brown', 
      specialty: 'Orthopedist', 
      qualification: 'MD', 
      experience: '10 years', 
      isAvailable: true,
      patients: [
        { id: 'p5', name: 'Michael Brown', tokenNumber: 'TKN-1238', status: 'waiting', appointmentTime: '02:00 PM' },
        { id: 'p6', name: 'Patricia Lee', tokenNumber: 'TKN-1239', status: 'waiting', appointmentTime: '02:30 PM' },
      ]
    },
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleDoctorAvailability = (doctorId: string) => {
    setDoctors(prev =>
      prev.map(doc =>
        doc.id === doctorId ? { ...doc, isAvailable: !doc.isAvailable } : doc
      )
    );
    // Update selected doctor if it's the one being toggled
    if (selectedDoctor?.id === doctorId) {
      setSelectedDoctor(prev =>
        prev ? { ...prev, isAvailable: !prev.isAvailable } : null
      );
    }
  };

  const addDoctor = () => {
    if (newDoctorName.trim() && newDoctorSpecialty.trim()) {
      const newDoctor: Doctor = {
        id: `${doctors.length + 1}`,
        name: newDoctorName,
        specialty: newDoctorSpecialty,
        qualification: 'MBBS',
        experience: 'New',
        isAvailable: true,
        patients: [],
      };
      setDoctors([...doctors, newDoctor]);
      setNewDoctorName('');
      setNewDoctorSpecialty('');
      setShowAddForm(false);
    }
  };

  const removeDoctor = (doctorId: string) => {
    setDoctors(prev => prev.filter(doc => doc.id !== doctorId));
    if (selectedDoctor?.id === doctorId) {
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hospital Staff Management</h1>
          <p className="text-slate-600">Manage doctors and their availability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Doctors List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Doctor Section */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-l-blue-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Doctors Management</h2>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {showAddForm ? '✕ Cancel' : '+ Add Doctor'}
                </Button>
              </div>

              {showAddForm && (
                <div className="space-y-4 p-4 bg-white rounded-lg border border-blue-200">
                  <Input
                    label="Doctor Name"
                    type="text"
                    placeholder="Dr. Name"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                  />
                  <Input
                    label="Specialty"
                    type="text"
                    placeholder="e.g., Cardiologist"
                    value={newDoctorSpecialty}
                    onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                  />
                  <Button
                    onClick={addDoctor}
                    fullWidth
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add Doctor
                  </Button>
                </div>
              )}
            </Card>

            {/* Doctors List */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">List of Doctors ({doctors.length})</h3>
              <div className="space-y-3">
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                        <p className="text-sm text-slate-600">{doctor.specialty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Availability Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDoctorAvailability(doctor.id);
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                            doctor.isAvailable
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {doctor.isAvailable ? '✓ Available' : '✗ Unavailable'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDoctor(doctor.id);
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Doctor Details & Patients */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Doctor Details</h3>
              
              {selectedDoctor ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Name</p>
                    <p className="text-lg font-bold text-slate-900">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Specialty</p>
                    <p className="text-sm font-semibold text-blue-600">{selectedDoctor.specialty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Qualification</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedDoctor.qualification}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Experience</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedDoctor.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      selectedDoctor.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedDoctor.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDoctorAvailability(selectedDoctor.id)}
                    className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                      selectedDoctor.isAvailable
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedDoctor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-lg text-center">
                  <p className="text-slate-600">Select a doctor to view details</p>
                </div>
              )}
            </Card>

            {/* Patients List */}
            {selectedDoctor && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Patients ({selectedDoctor.patients?.length || 0})
                </h3>
                
                {selectedDoctor.patients && selectedDoctor.patients.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDoctor.patients.map(patient => (
                      <div
                        key={patient.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{patient.name}</p>
                            <p className="text-xs text-slate-600 mt-1">{patient.tokenNumber}</p>
                            <p className="text-xs text-slate-500 mt-1">Time: {patient.appointmentTime}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                            patient.status === 'active' ? 'bg-green-100 text-green-700' :
                            patient.status === 'waiting' ? 'bg-blue-100 text-blue-700' :
                            patient.status === 'served' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 rounded-lg text-center">
                    <p className="text-slate-600 text-sm">No patients scheduled</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
