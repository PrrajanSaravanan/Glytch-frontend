// ============================================================================
// SUPABASE EDGE FUNCTION: Get Queue Status
// ============================================================================
// This function returns the queue status for a specific doctor
// GET /functions/v1/queue-status/:doctor_id

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
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const doctor_id = pathSegments[pathSegments.length - 1]

    if (!doctor_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Doctor ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get all queue entries for the doctor, ordered by position
    const { data: queue, error: queueError } = await supabase
      .from('doctor_queue')
      .select('*')
      .eq('doctor_id', doctor_id)
      .in('status', ['waiting', 'in-progress'])
      .order('position', { ascending: true })

    if (queueError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch queue' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get doctor info
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctor_id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          doctorId: doctor_id,
          doctorName: doctorData?.name,
          totalInQueue: queue?.length || 0,
          queue: queue || [],
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
