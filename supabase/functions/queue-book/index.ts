// ============================================================================
// SUPABASE EDGE FUNCTION: Book Appointment (Add to Queue)
// ============================================================================
// This function adds a patient to a doctor's queue
// POST /functions/v1/queue-book

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const { doctor_id, health_summary, appointment_date, appointment_time, notes } = await req.json()

    if (!doctor_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Doctor ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get doctor info for queue count and consultation time
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('avg_consult_time_minutes, current_queue_count')
      .eq('id', doctor_id)
      .single()

    if (doctorError || !doctorData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Doctor not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get patient name from profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Patient profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Generate token (A001, A002, etc.)
    const nextPosition = doctorData.current_queue_count + 1
    const token = 'A' + String(nextPosition).padStart(3, '0')

    // Calculate estimated wait time
    const estimatedWaitTime = nextPosition * doctorData.avg_consult_time_minutes

    // Insert into doctor_queue
    const { data: queueData, error: queueError } = await supabase
      .from('doctor_queue')
      .insert({
        doctor_id,
        patient_id: user.id,
        patient_name: profileData.name,
        health_summary: health_summary || null,
        token,
        position: nextPosition,
        status: 'waiting',
        estimated_wait_time: estimatedWaitTime,
        appointment_date: appointment_date || null,
        appointment_time: appointment_time || null,
        notes: notes || null,
      })
      .select()

    if (queueError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to add to queue' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Update doctor queue count
    const { error: updateError } = await supabase
      .from('doctors')
      .update({ current_queue_count: nextPosition })
      .eq('id', doctor_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update doctor queue count' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          queueId: queueData[0].id,
          token,
          position: nextPosition,
          estimatedWaitTime,
          patientName: profileData.name,
          doctorId: doctor_id,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
