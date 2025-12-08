import { Doctor, HoldEntry, QueueStats, Patient } from '../types';

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Bennett',
    qualification: 'MBBS, MD',
    specialty: 'Cardiologist',
    experience: '12+ years experience',
    queueLength: 8,
    estimatedWaitTime: '45 mins',
  },
  {
    id: 'd2',
    name: 'Dr. James Wilson',
    qualification: 'MBBS, MS',
    specialty: 'Orthopedic Surgeon',
    experience: '8+ years experience',
    queueLength: 3,
    estimatedWaitTime: '15 mins',
  },
  {
    id: 'd3',
    name: 'Dr. Emily Chen',
    qualification: 'MD, Pediatrics',
    specialty: 'Pediatrician',
    experience: '5+ years experience',
    queueLength: 12,
    estimatedWaitTime: '60 mins',
  },
  {
    id: 'd4',
    name: 'Dr. Michael Ross',
    qualification: 'MBBS, DNB',
    specialty: 'General Physician',
    experience: '15+ years experience',
    queueLength: 5,
    estimatedWaitTime: '25 mins',
  },
];

export const CURRENT_PATIENT: Patient = {
  id: 'p-105',
  token: 'TKN-1234',
  name: 'John Doe',
  position: 5,
  estimatedWait: 25,
  status: 'waiting',
};

export const NEXT_PATIENT_STAFF_VIEW = {
  name: 'Alice Johnson',
  token: 'TKN-1235',
  position: 1,
};

export const HOLD_LIST: HoldEntry[] = [
  {
    id: 'h1',
    patientName: 'Robert Smith',
    tokenId: 'TKN-1220',
    timeOnHold: '10:15 AM',
    reason: 'Lab reports pending',
  },
  {
    id: 'h2',
    patientName: 'Linda Taylor',
    tokenId: 'TKN-1228',
    timeOnHold: '10:45 AM',
    reason: 'Stepped out for phone call',
  },
];

export const STAFF_STATS: QueueStats = {
  waiting: 24,
  served: 45,
  doctorsAvailable: 4,
  avgServiceTime: '12 mins',
};