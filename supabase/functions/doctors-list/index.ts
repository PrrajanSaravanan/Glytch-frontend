// ============================================================================
// SUPABASE EDGE FUNCTION: List All Doctors
// ============================================================================
// This function returns a list of all available doctors
// GET /functions/v1/doctors-list

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
    const specialty = url.searchParams.get('specialty')
    const available = url.searchParams.get('available')

    let query = supabase
      .from('doctors')
      .select('*')
      .order('rating', { ascending: false })

    if (specialty) {
      query = query.eq('specialization', specialty)
    }

    if (available === 'true') {
      query = query.eq('available', true)
    }

    const { data: doctors, error: doctorsError } = await query

    if (doctorsError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch doctors' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalDoctors: doctors?.length || 0,
          doctors: doctors || [],
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
