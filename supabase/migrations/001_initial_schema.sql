-- ============================================================================
-- SUPABASE QUEUE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- This file contains all table definitions for the queue management system
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'staff')),
  doctor_id UUID NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. PATIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  health_details TEXT,
  medical_history TEXT[] DEFAULT '{}',
  allergies TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. DOCTORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  qualification TEXT,
  license_number TEXT UNIQUE,
  experience_years INT,
  available BOOLEAN DEFAULT TRUE,
  avg_consult_time_minutes INT DEFAULT 15,
  max_queue_capacity INT DEFAULT 20,
  current_queue_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  department TEXT,
  bio TEXT,
  image_url TEXT,
  working_days TEXT[] DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday"}',
  consultation_fee INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. DOCTOR QUEUE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  health_summary TEXT,
  token TEXT NOT NULL,
  position INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in-progress', 'completed', 'no-show', 'cancelled')),
  estimated_wait_time INT,
  appointment_date DATE,
  appointment_time TIME,
  notes TEXT,
  consultation_fee INT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'unpaid')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.doctor_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. INDICES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_doctor_id ON public.profiles(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON public.doctors(available);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_doctor_id ON public.doctor_queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_patient_id ON public.doctor_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_status ON public.doctor_queue(status);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_position ON public.doctor_queue(doctor_id, position);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_token ON public.doctor_queue(token);
CREATE INDEX IF NOT EXISTS idx_doctor_queue_created ON public.doctor_queue(created_at DESC);

-- ============================================================================
-- 6. FUNCTIONS FOR TIMESTAMP UPDATES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to patients
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE
ON public.patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to doctors
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE
ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to doctor_queue
CREATE TRIGGER update_doctor_queue_updated_at BEFORE UPDATE
ON public.doctor_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. FUNCTIONS FOR QUEUE MANAGEMENT
-- ============================================================================

-- Function to generate next token
CREATE OR REPLACE FUNCTION generate_queue_token(doctor_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INT;
  token_value TEXT;
BEGIN
  -- Get next queue number for the doctor
  SELECT COALESCE(MAX(CAST(SUBSTRING(token FROM 2) AS INT)), 0) + 1
  INTO next_number
  FROM public.doctor_queue
  WHERE doctor_id = doctor_id_param
  AND DATE(created_at) = CURRENT_DATE
  AND status != 'cancelled';
  
  token_value := 'A' || LPAD(next_number::TEXT, 3, '0');
  RETURN token_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update positions in queue
CREATE OR REPLACE FUNCTION recalculate_queue_positions(doctor_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Update all positions for waiting patients
  WITH numbered_queue AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_position
    FROM public.doctor_queue
    WHERE doctor_id = doctor_id_param
    AND status = 'waiting'
  )
  UPDATE public.doctor_queue dq
  SET position = nq.new_position,
      estimated_wait_time = nq.new_position * (
        SELECT avg_consult_time_minutes 
        FROM public.doctors 
        WHERE id = doctor_id_param
      )
  FROM numbered_queue nq
  WHERE dq.id = nq.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.profiles IS 'Extended user profiles with role and metadata';
COMMENT ON TABLE public.patients IS 'Patient-specific health information';
COMMENT ON TABLE public.doctors IS 'Doctor profiles with specialization and queue info';
COMMENT ON TABLE public.doctor_queue IS 'Queue management for each doctor';
COMMENT ON COLUMN public.doctor_queue.token IS 'Queue token format: A001, A002, etc.';
COMMENT ON COLUMN public.doctor_queue.position IS 'Position in queue (1-based, in order)';
COMMENT ON COLUMN public.doctor_queue.status IS 'Current status in queue lifecycle';
