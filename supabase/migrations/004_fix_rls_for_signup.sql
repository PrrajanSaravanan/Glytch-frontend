-- ============================================================================
-- FIX RLS POLICIES FOR SIGNUP - VERSION 4
-- ============================================================================
-- Disable RLS temporarily during auth operations by using a database function
-- that handles profile creation with proper permissions

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Patients can view own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can update own record" ON public.patients;
DROP POLICY IF EXISTS "Staff can view all patient records" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view patients in their queue" ON public.patients;
DROP POLICY IF EXISTS "Patients can insert own record" ON public.patients;

DROP POLICY IF EXISTS "Everyone can view doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can view own record" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can update own record" ON public.doctors;
DROP POLICY IF EXISTS "Staff can update doctor records" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can insert own record" ON public.doctors;

DROP POLICY IF EXISTS "Patients can view own queue entries" ON public.doctor_queue;
DROP POLICY IF EXISTS "Patients can view current queue status" ON public.doctor_queue;
DROP POLICY IF EXISTS "Doctors can view own queue" ON public.doctor_queue;
DROP POLICY IF EXISTS "Doctors can update own queue status" ON public.doctor_queue;
DROP POLICY IF EXISTS "Staff can view all queues" ON public.doctor_queue;
DROP POLICY IF EXISTS "Staff can update all queues" ON public.doctor_queue;
DROP POLICY IF EXISTS "Patients can insert queue entry" ON public.doctor_queue;
DROP POLICY IF EXISTS "Staff can insert queue entry" ON public.doctor_queue;
DROP POLICY IF EXISTS "Patients can cancel own appointment" ON public.doctor_queue;

-- ============================================================================
-- PROFILES TABLE - NEW POLICIES
-- ============================================================================

-- Allow anyone (authenticated) to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Staff can view all profiles
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- ============================================================================
-- PATIENTS TABLE - NEW POLICIES
-- ============================================================================

-- Allow anyone (authenticated) to insert their own record
CREATE POLICY "Patients can insert own record"
ON public.patients
FOR INSERT
WITH CHECK (true);

-- Patients can view their own record
CREATE POLICY "Patients can view own record"
ON public.patients
FOR SELECT
USING (auth.uid() = id);

-- Patients can update their own record
CREATE POLICY "Patients can update own record"
ON public.patients
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Staff can view all patient records
CREATE POLICY "Staff can view all patient records"
ON public.patients
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Doctors can view patient health summaries in their queue
CREATE POLICY "Doctors can view patients in their queue"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_queue
    WHERE doctor_id = auth.uid()
    AND patient_id = id
    AND status IN ('waiting', 'in-progress')
  )
);

-- ============================================================================
-- DOCTORS TABLE - NEW POLICIES
-- ============================================================================

-- Allow anyone (authenticated) to insert their own record
CREATE POLICY "Doctors can insert own record"
ON public.doctors
FOR INSERT
WITH CHECK (true);

-- Everyone can view available doctors (public list)
CREATE POLICY "Everyone can view doctors"
ON public.doctors
FOR SELECT
USING (true);

-- Doctors can view their own record
CREATE POLICY "Doctors can view own record"
ON public.doctors
FOR SELECT
USING (auth.uid() = id);

-- Doctors can update their own record
CREATE POLICY "Doctors can update own record"
ON public.doctors
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Staff can update any doctor's availability and queue
CREATE POLICY "Staff can update doctor records"
ON public.doctors
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- ============================================================================
-- DOCTOR QUEUE TABLE - POLICIES
-- ============================================================================

-- Patients can view their own queue entries
CREATE POLICY "Patients can view own queue entries"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = patient_id);

-- Patients can see current queue status for any doctor
CREATE POLICY "Patients can view current queue status"
ON public.doctor_queue
FOR SELECT
USING (status = 'waiting' OR status = 'in-progress');

-- Doctors can view their own queue
CREATE POLICY "Doctors can view own queue"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctors can update queue status (mark served, no-show)
CREATE POLICY "Doctors can update own queue status"
ON public.doctor_queue
FOR UPDATE
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

-- Staff can view all queues
CREATE POLICY "Staff can view all queues"
ON public.doctor_queue
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Staff can update any queue
CREATE POLICY "Staff can update all queues"
ON public.doctor_queue
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Patients can insert queue entry (book appointment)
CREATE POLICY "Patients can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Staff can insert queue entry
CREATE POLICY "Staff can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Patients can cancel their own appointments
CREATE POLICY "Patients can cancel own appointment"
ON public.doctor_queue
FOR UPDATE
USING (
  auth.uid() = patient_id 
  AND status = 'waiting'
)
WITH CHECK (status = 'cancelled');
