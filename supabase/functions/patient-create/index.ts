// ============================================================================
// SUPABASE EDGE FUNCTION: Create Patient Profile
// ============================================================================
// This function creates a new patient profile in the database
// POST /functions/v1/patient-create

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Verify JWT and get user ID
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

    // Parse request body
    const { name, healthDetails, medicalHistory, allergies, emergencyContact, emergencyPhone } = await req.json()

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, message: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name,
        email: user.email,
        role: 'patient',
      })

    if (profileError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create profile' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create patient record
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert({
        id: user.id,
        health_details: healthDetails || null,
        medical_history: medicalHistory || [],
        allergies: allergies || null,
        emergency_contact: emergencyContact || null,
        emergency_phone: emergencyPhone || null,
      })
      .select()

    if (patientError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create patient record' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          patientId: user.id,
          name,
          email: user.email,
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
