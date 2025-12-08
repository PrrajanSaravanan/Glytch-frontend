export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  experience: string;
  queueLength: number;
  estimatedWaitTime: string; // e.g., "45 mins"
}

export interface Patient {
  id: string;
  token: string;
  name: string;
  position: number;
  estimatedWait: number; // in minutes
  status: 'waiting' | 'serving' | 'hold' | 'served';
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