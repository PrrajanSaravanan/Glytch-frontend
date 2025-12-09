-- ============================================================================
-- CREATE TRIGGER FOR AUTO-PROFILE CREATION ON USER SIGNUP
-- ============================================================================
-- This trigger automatically creates a profile in the profiles table
-- when a new user is created in auth.users

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role'
  );

  -- If role is patient, create patient profile
  IF (new.raw_user_meta_data->>'role') = 'patient' THEN
    INSERT INTO public.patients (id, health_details, medical_history, allergies, emergency_contact, emergency_phone)
    VALUES (
      new.id,
      '',
      '[]'::jsonb,
      '',
      '',
      ''
    );
  END IF;

  -- If role is doctor, create doctor profile
  IF (new.raw_user_meta_data->>'role') = 'doctor' THEN
    INSERT INTO public.doctors (id, specialization, experience_years, available, avg_consult_time_minutes, max_queue_capacity, current_queue_count, rating, review_count, department)
    VALUES (
      new.id,
      '',
      0,
      true,
      15,
      20,
      0,
      0,
      0,
      ''
    );
  END IF;

  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE RLS POLICIES - SIMPLER VERSION
-- ============================================================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Patients can insert own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can view own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can update own record" ON public.patients;
DROP POLICY IF EXISTS "Staff can view all patient records" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view patients in their queue" ON public.patients;

DROP POLICY IF EXISTS "Doctors can insert own record" ON public.doctors;
DROP POLICY IF EXISTS "Everyone can view doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can view own record" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can update own record" ON public.doctors;
DROP POLICY IF EXISTS "Staff can update doctor records" ON public.doctors;

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
-- PROFILES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- ============================================================================
-- PATIENTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own record"
ON public.patients
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Patients can update own record"
ON public.patients
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all patient records"
ON public.patients
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

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
-- DOCTORS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Everyone can view doctors"
ON public.doctors
FOR SELECT
USING (true);

CREATE POLICY "Doctors can view own record"
ON public.doctors
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Doctors can update own record"
ON public.doctors
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can update doctor records"
ON public.doctors
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

-- ============================================================================
-- DOCTOR QUEUE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own queue entries"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can view current queue status"
ON public.doctor_queue
FOR SELECT
USING (status = 'waiting' OR status = 'in-progress');

CREATE POLICY "Doctors can view own queue"
ON public.doctor_queue
FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own queue status"
ON public.doctor_queue
FOR UPDATE
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Staff can view all queues"
ON public.doctor_queue
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

CREATE POLICY "Staff can update all queues"
ON public.doctor_queue
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

CREATE POLICY "Patients can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff can insert queue entry"
ON public.doctor_queue
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
);

CREATE POLICY "Patients can cancel own appointment"
ON public.doctor_queue
FOR UPDATE
USING (
  auth.uid() = patient_id 
  AND status = 'waiting'
)
WITH CHECK (status = 'cancelled');
