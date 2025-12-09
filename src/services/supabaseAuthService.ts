// ============================================================================
// SUPABASE AUTHENTICATION SERVICE
// ============================================================================
// Handle user authentication with Supabase Auth
// Location: src/services/supabaseAuthService.ts

import { supabase } from '../config/supabase'
import { AuthUser } from './authService'

export const supabaseAuthService = {
  // Sign up new user
  async signup(email: string, password: string, name: string, role: 'patient' | 'doctor' | 'staff'): Promise<AuthUser> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Signup failed')
      }

      // Set session for immediate profile creation
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      })

      if (sessionError) {
        console.error('Session error:', sessionError)
      }

      // Create profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email,
          role,
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      // If doctor, create doctor profile
      if (role === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            id: authData.user.id,
            specialization: '',
            experience_years: 0,
            available: true,
            avg_consult_time_minutes: 15,
            max_queue_capacity: 20,
            current_queue_count: 0,
            rating: 0,
            review_count: 0,
            department: '',
          })

        if (doctorError) {
          console.error('Doctor error:', doctorError)
          throw new Error(`Failed to create doctor profile: ${doctorError.message}`)
        }
      }

      // If patient, create patient profile
      if (role === 'patient') {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            id: authData.user.id,
            health_details: '',
            medical_history: [],
            allergies: '',
            emergency_contact: '',
            emergency_phone: '',
          })

        if (patientError) {
          console.error('Patient error:', patientError)
          throw new Error(`Failed to create patient profile: ${patientError.message}`)
        }
      }

      return {
        uid: authData.user.id,
        email: authData.user.email || '',
        displayName: name,
      }
    } catch (error) {
      throw error
    }
  },

  // Sign in user
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) {
        throw new Error(error?.message || 'Login failed')
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.user.id)
        .single()

      return {
        uid: data.user.id,
        email: data.user.email || '',
        displayName: profileData?.name || '',
      }
    } catch (error) {
      throw error
    }
  },

  // Sign out user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        return null
      }

      return {
        uid: data.session.user.id,
        // Sign up new user - profiles auto-created by database trigger
        displayName: data.session.user.user_metadata?.name || '',
      }
            // Create auth user - database trigger will auto-create profiles
      return null
    }
  },

  // Get user role
  async getUserRole(userId: string): Promise<'patient' | 'doctor' | 'staff' | null> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      return data?.role || null
    } catch (error) {
            // Return user info
            // Note: Profiles are automatically created by database trigger
  },
