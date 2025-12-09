import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { DOCTORS } from '../../data/mockData';

export const DoctorList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get unique specialties from doctors
  const specialties = useMemo(() => {
    return Array.from(new Set(DOCTORS.map(doc => doc.specialty))).sort();
  }, []);

  // Filter doctors based on selected specialty
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) {
      return DOCTORS;
    }
    return DOCTORS.filter(doc => doc.specialty === selectedSpecialty);
  }, [selectedSpecialty]);

  const handleJoinQueue = (id: string) => {
    navigate(`/patient/token`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Available Doctors</h1>
          <p className="text-slate-500">Select a doctor to join their waiting queue.</p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Specialty
              {selectedSpecialty && (
                <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded text-sm font-bold">1</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                {/* "All Specialties" option */}
                <button
                  onClick={() => {
                    setSelectedSpecialty(null);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                    selectedSpecialty === null ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-semibold text-slate-900">All Specialties</p>
                  <p className="text-sm text-slate-500">{DOCTORS.length} doctors</p>
                </button>

                {/* Specialty options */}
                {specialties.map((specialty) => {
                  const count = DOCTORS.filter(doc => doc.specialty === specialty).length;
                  return (
                    <button
                      key={specialty}
                      onClick={() => {
                        setSelectedSpecialty(specialty);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                        selectedSpecialty === specialty ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{specialty}</p>
                      <p className="text-sm text-slate-500">{count} doctor{count > 1 ? 's' : ''}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Filter Badge */}
          {selectedSpecialty && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-semibold text-blue-700">{selectedSpecialty}</span>
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="text-blue-500 hover:text-blue-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {filteredDoctors.length > 0 ? (
          <>
            <p className="text-slate-600 mb-6">
              Showing <span className="font-semibold">{filteredDoctors.length}</span> of <span className="font-semibold">{DOCTORS.length}</span> doctors
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onJoin={handleJoinQueue} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filter to see available doctors.</p>
            <button
              onClick={() => setSelectedSpecialty(null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};