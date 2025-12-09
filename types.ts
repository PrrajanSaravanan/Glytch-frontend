export type CrowdLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type TokenStatus = 'waiting' | 'active' | 'served' | 'no-show' | 're-enter';

export interface Shift {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  experience: string;
  queueLength: number;
  estimatedWaitTime: string; // e.g., "45 mins"
  crowdLevel?: CrowdLevel; // low, moderate, high, very-high
  isPresent: boolean; // Currently present in hospital
  shifts: Shift[]; // Weekly schedule
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // e.g., "Monday, December 15, 2025"
  time: string; // e.g., "09:00 AM"
  patientName: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export interface Patient {
  id: string;
  token: string;
  tokenNumber: number;
  name: string;
  position: number;
  estimatedWait: number; // in minutes
  status: TokenStatus; // waiting, active, served, no-show, re-enter
  scheduledTime?: string; // Appointment time in "HH:mm" format (e.g., "09:30")
  scheduledDate?: string; // Appointment date (e.g., "2025-12-15")
}

export interface HoldEntry {
  id: string;
  patientName: string;
  tokenId: string;
  timeOnHold: string;
  reason: string;
}

export interface QueueStats {
  waiting: number;
  served: number;
  doctorsAvailable: number;
  avgServiceTime: string;
}