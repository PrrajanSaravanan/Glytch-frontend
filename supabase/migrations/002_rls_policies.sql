-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This file contains all RLS policies for secure data access

-- ============================================================================
-- PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Staff and admins can view all profiles
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('staff')
);

-- Policy 4: New users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- ============================================================================
-- PATIENTS TABLE RLS POLICIES
-- ============================================================================

-- Policy 1: Patients can view their own record
CREATE POLICY "Patients can view own record"
ON public.patients
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Patients can update their own record
CREATE POLICY "Patients can update own record"
ON public.patients
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Staff can view all patient records
CREATE POLICY "Staff can view all patient records"
ON public.patients
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Policy 4: Doctors can view patient health summaries in their queue
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

-- Policy 5: Patients can insert their own record (during signup)
CREATE POLICY "Patients can insert own record"
ON public.patients
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- ============================================================================
-- DOCTORS TABLE RLS POLICIES
-- ============================================================================

-- Policy 1: Everyone can view available doctors (public list)
CREATE POLICY "Everyone can view doctors"
ON public.doctors
FOR SELECT
USING (true);

-- Policy 2: Doctors can view their own record
CREATE POLICY "Doctors can view own record"
ON public.doctors
FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Doctors can update their own record
CREATE POLICY "Doctors can update own record"
ON public.doctors
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Staff can update any doctor's availability and queue
CREATE POLICY "Staff can update doctor records"
ON public.doctors
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Policy 5: Doctors can insert their own record (during signup)
CREATE POLICY "Doctors can insert own record"
ON public.doctors
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- ============================================================================
-- DOCTOR QUEUE TABLE RLS POLICIES
-- ============================================================================

-- Policy 1: Patients can view their own queue entries
CREATE POLICY "Patients can view own queue entries"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = patient_id);

-- Policy 2: Patients can see current queue status for any doctor
CREATE POLICY "Patients can view current queue status"
ON public.doctor_queue
FOR SELECT
USING (status = 'waiting' OR status = 'in-progress');

-- Policy 3: Doctors can view their own queue
CREATE POLICY "Doctors can view own queue"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = doctor_id);

-- Policy 4: Doctors can update queue status (mark served, no-show)
CREATE POLICY "Doctors can update own queue status"
ON public.doctor_queue
FOR UPDATE
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

-- Policy 5: Staff can view all queues
CREATE POLICY "Staff can view all queues"
ON public.doctor_queue
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Policy 6: Staff can update any queue
CREATE POLICY "Staff can update all queues"
ON public.doctor_queue
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Policy 7: Patients can insert queue entry (book appointment)
CREATE POLICY "Patients can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Policy 8: Staff can insert queue entry
CREATE POLICY "Staff can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- Policy 9: Patients can cancel their own appointments
CREATE POLICY "Patients can cancel own appointment"
ON public.doctor_queue
FOR UPDATE
USING (
  auth.uid() = patient_id 
  AND status = 'waiting'
)
WITH CHECK (status = 'cancelled');

-- ============================================================================
-- ENABLE RLS ON TABLES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ENABLE REALTIME ON TABLES
-- ============================================================================

-- Enable realtime for doctor_queue (main table for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_queue;

-- Enable realtime for doctors (for availability changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;

-- ============================================================================
-- RLS POLICY VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Test if RLS is enabled
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'patients', 'doctors', 'doctor_queue');
-- SELECT * FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'CHECK';
