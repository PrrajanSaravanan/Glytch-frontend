// ============================================================================
// SUPABASE EDGE FUNCTION: Set Doctor Availability
// ============================================================================
// This function toggles doctor availability
// POST /functions/v1/doctor-set-availability

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

    const { doctor_id, available } = await req.json()

    if (!doctor_id || available === undefined) {
      return new Response(
        JSON.stringify({ success: false, message: 'Doctor ID and available status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Verify authorization (only staff can change doctor availability)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profileData || profileData.role !== 'staff') {
      return new Response(
        JSON.stringify({ success: false, message: 'Only staff can change doctor availability' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Update doctor availability
    const { data: updatedDoctor, error: updateError } = await supabase
      .from('doctors')
      .update({ available })
      .eq('id', doctor_id)
      .select()

    if (updateError || !updatedDoctor) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update doctor availability' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          doctorId: doctor_id,
          available,
          message: available ? 'Doctor is now available' : 'Doctor is now unavailable',
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
