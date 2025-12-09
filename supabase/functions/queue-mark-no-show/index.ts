// ============================================================================
// SUPABASE EDGE FUNCTION: Mark Patient as No-Show
// ============================================================================
// This function marks a patient as no-show and removes them from queue
// POST /functions/v1/queue-mark-no-show

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

    const { queue_id, doctor_id, cancellation_reason } = await req.json()

    if (!queue_id || !doctor_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Queue ID and Doctor ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Verify authorization (doctor or staff)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profileData || (profileData.role !== 'doctor' && profileData.role !== 'staff')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Mark patient as no-show
    const { error: updateError } = await supabase
      .from('doctor_queue')
      .update({
        status: 'no-show',
        completed_at: new Date().toISOString(),
        cancellation_reason: cancellation_reason || 'Patient did not show up',
      })
      .eq('id', queue_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to mark as no-show' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get remaining waiting patients and recalculate positions
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

      // Update positions for remaining patients
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
    const queueCount = remainingQueue?.length || 0
    await supabase
      .from('doctors')
      .update({ current_queue_count: queueCount })
      .eq('id', doctor_id)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: 'Patient marked as no-show',
          remainingInQueue: queueCount,
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
