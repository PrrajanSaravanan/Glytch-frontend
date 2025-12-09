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
    crowdLevel: 'high',
    isPresent: true,
    shifts: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' },
    ],
  },
  {
    id: 'd2',
    name: 'Dr. James Wilson',
    qualification: 'MBBS, MS',
    specialty: 'Orthopedic Surgeon',
    experience: '8+ years experience',
    queueLength: 3,
    estimatedWaitTime: '15 mins',
    crowdLevel: 'low',
    isPresent: true,
    shifts: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '14:00' },
    ],
  },
  {
    id: 'd3',
    name: 'Dr. Emily Chen',
    qualification: 'MD, Pediatrics',
    specialty: 'Pediatrician',
    experience: '5+ years experience',
    queueLength: 12,
    estimatedWaitTime: '60 mins',
    crowdLevel: 'very-high',
    isPresent: false,
    shifts: [
      { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '16:00' },
    ],
  },
  {
    id: 'd4',
    name: 'Dr. Michael Ross',
    qualification: 'MBBS, DNB',
    specialty: 'General Physician',
    experience: '15+ years experience',
    queueLength: 5,
    estimatedWaitTime: '25 mins',
    crowdLevel: 'moderate',
    isPresent: true,
    shifts: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '13:00' },
    ],
  },
];

export const CURRENT_PATIENT: Patient = {
  id: 'p-105',
  token: 'TKN-1234',
  tokenNumber: 1234,
  name: 'John Doe',
  position: 5,
  estimatedWait: 25,
  status: 'waiting',
  scheduledTime: '10:30', // Current time is around 10:15-10:25, so appointment in 5-15 min
  scheduledDate: new Date().toISOString().split('T')[0], // Today's date
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