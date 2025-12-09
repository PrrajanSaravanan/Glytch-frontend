import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

interface SignupRequest {
  email: string
  password: string
  name: string
  role: 'patient' | 'doctor' | 'staff'
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { email, password, name, role }: SignupRequest = await req.json()

    // Validate input
    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create auth user using service role (bypasses RLS)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true, // Auto-confirm email
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError?.message || 'Signup failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create profile using service role (bypasses RLS)
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
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create role-specific profile
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
        return new Response(
          JSON.stringify({ error: `Failed to create doctor profile: ${doctorError.message}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

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
        return new Response(
          JSON.stringify({ error: `Failed to create patient profile: ${patientError.message}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          role,
        }
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
