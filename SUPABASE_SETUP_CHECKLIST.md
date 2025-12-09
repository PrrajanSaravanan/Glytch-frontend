# SUPABASE SETUP CHECKLIST

## 🎯 Quick Setup Guide

Follow these steps to get Supabase running with your Glytch application.

---

## STEP 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub/Google
4. Create new organization
5. Create new project
   - **Project Name**: Glytch-Queue-Management
   - **Database Password**: Save securely!
   - **Region**: Choose closest to your location
6. Wait for project to initialize (5-10 minutes)

---

## STEP 2: Get API Keys

1. In Supabase Dashboard, go to **Settings → API**
2. Find these values:
   - **Project URL**: Copy this
   - **anon public**: Copy this key

3. Create `.env.local` in project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## STEP 3: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Create new query
3. Copy entire content from: `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Create another query
7. Copy entire content from: `supabase/migrations/002_rls_policies.sql`
8. Paste and click **Run**

**✅ You should see "Success" messages**

---

## STEP 4: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

```bash
# Install CLI if you haven't
npm install -g supabase@latest

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_ref

# Deploy all functions
supabase functions deploy patient-create
supabase functions deploy queue-book
supabase functions deploy queue-mark-served
supabase functions deploy queue-mark-no-show
supabase functions deploy doctor-set-availability
supabase functions deploy queue-status
supabase functions deploy doctors-list
```

### Option B: Manual Upload

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create Function** for each:
   - patient-create
   - queue-book
   - queue-mark-served
   - queue-mark-no-show
   - doctor-set-availability
   - queue-status
   - doctors-list
3. Copy code from corresponding files in `supabase/functions/`
4. Deploy each function

---

## STEP 5: Enable Realtime

1. Go to **Database → Realtime** in Supabase Dashboard
2. Select the project
3. In the **Replication** tab, enable these tables:
   - ✅ doctor_queue (INSERT, UPDATE, DELETE)
   - ✅ doctors (UPDATE)
   - ✅ profiles (UPDATE)

---

## STEP 6: Configure Email Templates (Optional)

For production, configure email:

1. Go to **Authentication → Email Templates**
2. Customize:
   - Welcome email
   - Confirmation email
   - Password reset email
   - Magic link email

---

## STEP 7: Verify Installation

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Run dev server
npm run dev

# Test authentication flow:
# 1. Go to http://localhost:5173
# 2. Try to sign up as patient
# 3. Check Supabase Dashboard → Authentication → Users
# 4. Verify new user created
```

---

## STEP 8: Create Test Data

### Add Sample Doctor

In Supabase SQL Editor:

```sql
-- First, create a user account
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'doctor@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Copy the returned UUID and use it below

-- Then create doctor profile
INSERT INTO public.profiles (id, name, email, role) 
VALUES (
  'PASTE_UUID_HERE',
  'Dr. Sarah Smith',
  'doctor@example.com',
  'doctor'
);

-- Create doctor record
INSERT INTO public.doctors (
  id,
  specialization,
  experience_years,
  available,
  avg_consult_time_minutes,
  max_queue_capacity,
  rating,
  department,
  bio
) VALUES (
  'PASTE_UUID_HERE',
  'Cardiology',
  10,
  true,
  15,
  20,
  4.5,
  'Cardiology Department',
  'Experienced cardiologist with 10 years of practice'
);
```

---

## STEP 9: Test API Endpoints

### Using cURL:

```bash
# Get list of doctors
curl -X GET http://localhost:54321/functions/v1/doctors-list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Book appointment
curl -X POST http://localhost:54321/functions/v1/queue-book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor-uuid",
    "health_summary": "General checkup"
  }'
```

### Using Postman:

1. Import the provided Postman collection
2. Add your token to environment variables
3. Run each request in order

---

## STEP 10: Frontend Integration

### Update Component to Use Supabase

Example - Patient Login:

```typescript
import { supabaseAuthService } from '@/services/supabaseAuthService'

const handleLogin = async (email: string, password: string) => {
  try {
    const user = await supabaseAuthService.login(email, password)
    console.log('Logged in:', user)
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

Example - Get Doctors List:

```typescript
import { supabaseService } from '@/services/supabaseService'

const loadDoctors = async () => {
  const doctors = await supabaseService.getDoctors('Cardiology', true)
  setDoctorList(doctors)
}

// Subscribe to real-time updates
const subscription = supabaseService.subscribeToQueueChanges(doctorId, (data) => {
  console.log('Queue updated:', data)
  loadQueueStatus()
})
```

---

## 🐛 TROUBLESHOOTING

### "Invalid JWT" Error
- Check `Authorization: Bearer {token}` header format
- Verify token from login response
- Ensure token hasn't expired (typically 1 hour)

### "Permission denied" Error
- User role must match operation requirements
- Check RLS policies in Supabase
- Verify user ID matches data being accessed

### Functions not deploying
- Install Supabase CLI: `npm install -g supabase`
- Ensure you're logged in: `supabase login`
- Link your project: `supabase link --project-ref YOUR_REF`

### Realtime not working
- Enable on table in **Realtime** settings
- Check subscription is active in code
- Verify network/firewall allows WebSocket

### Database queries failing
- Check RLS policies allow the operation
- Verify table names are correct
- Check user has correct role

---

## 📝 MIGRATION PATH FROM FIREBASE

### Old (Firebase)
```typescript
import { authService } from '@/services/authService'
const user = await authService.login(email, password)
```

### New (Supabase)
```typescript
import { supabaseAuthService } from '@/services/supabaseAuthService'
const user = await supabaseAuthService.login(email, password)
```

Replace all Firebase imports with Supabase equivalents:
- `firestore` → `supabaseService`
- `auth` → `supabaseAuthService`
- `db` → `supabaseService` (database operations)

---

## ✅ VERIFICATION CHECKLIST

- [ ] Supabase project created
- [ ] API keys copied to `.env.local`
- [ ] Migrations executed successfully
- [ ] All 7 functions deployed
- [ ] Realtime enabled on tables
- [ ] Test user created
- [ ] Sample doctor created
- [ ] Frontend environment variables set
- [ ] Can sign up new user
- [ ] Can login
- [ ] Can book appointment
- [ ] Can see real-time queue updates

---

## 📚 HELPFUL LINKS

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## 🆘 GET HELP

If you encounter issues:

1. Check [Supabase Status](https://status.supabase.com)
2. Review error messages in Edge Function logs
3. Check browser console for JavaScript errors
4. Look at Supabase authentication logs
5. Check database RLS policies

---

**Setup Time**: ~30 minutes
**Difficulty**: Beginner-Intermediate
**Status**: ✅ Ready to Deploy
