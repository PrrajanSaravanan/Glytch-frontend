// ============================================================================
// SUPABASE EDGE FUNCTION: Mark Patient as Served
// ============================================================================
// This function marks a patient as completed and moves next patient to in-progress
// POST /functions/v1/queue-mark-served

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

    const { queue_id, doctor_id } = await req.json()

    if (!queue_id || !doctor_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Queue ID and Doctor ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Verify that the logged-in user is the doctor or staff
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, doctor_id')
      .eq('id', user.id)
      .single()

    if (!profileData || (profileData.role === 'doctor' && profileData.doctor_id !== doctor_id && profileData.id !== doctor_id)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Mark current patient as completed
    const { error: updateError } = await supabase
      .from('doctor_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', queue_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to mark as served' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get the next waiting patient
    const { data: nextPatient } = await supabase
      .from('doctor_queue')
      .select('*')
      .eq('doctor_id', doctor_id)
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(1)
      .single()

    if (nextPatient) {
      // Mark next patient as in-progress
      await supabase
        .from('doctor_queue')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', nextPatient.id)
    }

    // Recalculate queue positions and estimated wait times
    const { data: remainingQueue } = await supabase
      .from('doctor_queue')
      .select('*')
      .eq('doctor_id', doctor_id)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })

    if (remainingQueue && remainingQueue.length > 0) {
      const { data: doctorInfo } = await supabase
        .from('doctors')
        .select('avg_consult_time_minutes')
        .eq('id', doctor_id)
        .single()

      const consultTime = doctorInfo?.avg_consult_time_minutes || 15

      // Update all waiting patients with new positions
      for (let i = 0; i < remainingQueue.length; i++) {
        await supabase
          .from('doctor_queue')
          .update({
            position: i + 1,
            estimated_wait_time: (i + 1) * consultTime,
          })
          .eq('id', remainingQueue[i].id)
      }
    }

    // Update doctor queue count
    const { data: completedCount } = await supabase
      .from('doctor_queue')
      .select('id', { count: 'exact' })
      .eq('doctor_id', doctor_id)
      .eq('status', 'waiting')

    const queueCount = completedCount?.length || 0

    await supabase
      .from('doctors')
      .update({ current_queue_count: queueCount })
      .eq('id', doctor_id)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: 'Patient marked as served',
          nextPatient: nextPatient || null,
          remainingQueue: remainingQueue?.length || 0,
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
