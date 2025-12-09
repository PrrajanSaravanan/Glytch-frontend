// ============================================================================
// SUPABASE DATABASE SERVICE
// ============================================================================
// Handle all database operations via Supabase
// Location: src/services/supabaseService.ts

import { supabase } from '../config/supabase'

export const supabaseService = {
  // ========== DOCTORS ==========

  // Get all doctors
  async getDoctors(specialty?: string, availableOnly: boolean = false) {
    try {
      let query = supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false })

      if (specialty) {
        query = query.eq('specialization', specialty)
      }

      if (availableOnly) {
        query = query.eq('available', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching doctors:', error)
      return []
    }
  },

  // Get single doctor
  async getDoctor(doctorId: string) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching doctor:', error)
      return null
    }
  },

  // ========== QUEUE ==========

  // Book appointment (add to queue)
  async bookAppointment(
    doctorId: string,
    healthSummary?: string,
    appointmentDate?: string,
    appointmentTime?: string,
    notes?: string
  ) {
    try {
      const { data, error } = await supabase
        .functions.invoke('queue-book', {
          body: {
            doctor_id: doctorId,
            health_summary: healthSummary,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            notes,
          },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error booking appointment:', error)
      throw error
    }
  },

  // Get queue status for doctor
  async getQueueStatus(doctorId: string) {
    try {
      const { data, error } = await supabase
        .from('doctor_queue')
        .select('*')
        .eq('doctor_id', doctorId)
        .in('status', ['waiting', 'in-progress'])
        .order('position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching queue status:', error)
      return []
    }
  },

  // Get patient's appointment status
  async getPatientAppointmentStatus(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('doctor_queue')
        .select('*')
        .eq('patient_id', patientId)
        .in('status', ['waiting', 'in-progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows" error
      return data || null
    } catch (error) {
      console.error('Error fetching appointment status:', error)
      return null
    }
  },

  // Mark appointment as served
  async markAppointmentServed(queueId: string, doctorId: string) {
    try {
      const { data, error } = await supabase
        .functions.invoke('queue-mark-served', {
          body: {
            queue_id: queueId,
            doctor_id: doctorId,
          },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error marking appointment as served:', error)
      throw error
    }
  },

  // Mark appointment as no-show
  async markAppointmentNoShow(queueId: string, doctorId: string, cancellationReason?: string) {
    try {
      const { data, error } = await supabase
        .functions.invoke('queue-mark-no-show', {
          body: {
            queue_id: queueId,
            doctor_id: doctorId,
            cancellation_reason: cancellationReason,
          },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error marking appointment as no-show:', error)
      throw error
    }
  },

  // Cancel appointment
  async cancelAppointment(queueId: string, reason?: string) {
    try {
      const { error } = await supabase
        .from('doctor_queue')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Cancelled by patient',
        })
        .eq('id', queueId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  },

  // ========== DOCTOR AVAILABILITY ==========

  // Set doctor availability
  async setDoctorAvailability(doctorId: string, available: boolean) {
    try {
      const { data, error } = await supabase
        .functions.invoke('doctor-set-availability', {
          body: {
            doctor_id: doctorId,
            available,
          },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error setting doctor availability:', error)
      throw error
    }
  },

  // ========== PROFILES ==========

  // Get user profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // ========== PATIENTS ==========

  // Get patient profile
  async getPatientProfile(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching patient profile:', error)
      return null
    }
  },

  // Update patient profile
  async updatePatientProfile(patientId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating patient profile:', error)
      throw error
    }
  },

  // ========== REALTIME SUBSCRIPTIONS ==========

  // Subscribe to queue changes for a doctor
  subscribeToQueueChanges(doctorId: string, callback: (data: any) => void) {
    const subscription = supabase
      .channel(`doctor_queue:doctor_id=eq.${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_queue',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  },

  // Subscribe to doctor availability changes
  subscribeToAvailabilityChanges(doctorId: string, callback: (data: any) => void) {
    const subscription = supabase
      .channel(`doctors:id=eq.${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctors',
          filter: `id=eq.${doctorId}`,
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  },

  // Unsubscribe from channel
  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription)
  },
}
