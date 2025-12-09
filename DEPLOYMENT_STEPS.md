# 🚀 SUPABASE DEPLOYMENT - EXACT STEPS

Follow these exact steps to get your Supabase backend running.

---

## STEP 1: Create Supabase Account & Project (2 minutes)

```
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (or Google/Email)
4. Click "New project"
5. Enter:
   - Organization: (default or create new)
   - Project name: "glytch-queue-system"
   - Password: Create strong password (save this!)
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait 5-10 minutes for initialization
```

---

## STEP 2: Get Your API Keys (2 minutes)

```
1. Your project is ready. Look at left sidebar → Settings → API
2. Under "Project API keys", find these:
   - Project URL: https://xxxxx.supabase.co
   - anon (public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. Copy both values
```

---

## STEP 3: Update .env.local (1 minute)

```bash
# In your project root, edit .env.local

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace with actual values from Step 2
```

---

## STEP 4: Run Database Migrations (5 minutes)

### First Migration (Schema)

```
1. In Supabase dashboard, go to: SQL Editor (left sidebar)
2. Click "New query"
3. Copy ENTIRE content from: supabase/migrations/001_initial_schema.sql
4. Paste into the query editor
5. Click "Run"
6. Wait for "Success" message
```

### Second Migration (RLS Policies)

```
1. Still in SQL Editor, click "New query"
2. Copy ENTIRE content from: supabase/migrations/002_rls_policies.sql
3. Paste into the query editor
4. Click "Run"
5. Wait for "Success" message
```

✅ **Database is now ready!**

---

## STEP 5: Enable Real-time (2 minutes)

```
1. In Supabase dashboard, go to: Database → Realtime (left sidebar)
2. Click on your project name
3. Under "Replication", enable these tables:
   ☑ doctor_queue
   ☑ doctors
   ☑ profiles
4. Click the toggle for each table
5. Wait for confirmation
```

✅ **Real-time is now enabled!**

---

## STEP 6: Install & Deploy Edge Functions (10 minutes)

### Install Supabase CLI

```bash
# In your terminal:
npm install -g supabase@latest

# Verify installation:
supabase --version
```

### Login to Supabase

```bash
supabase login

# You'll be asked to:
# 1. Open browser to: https://app.supabase.com/account/tokens
# 2. Create new access token
# 3. Copy token
# 4. Paste into terminal
```

### Link Your Project

```bash
# Get your project ref from: 
# Supabase → Settings → General → Project ID

supabase link --project-ref YOUR_PROJECT_REF

# When asked for password, enter the one you created in Step 1
```

### Deploy Each Function

```bash
# Deploy all 7 functions:

supabase functions deploy patient-create
supabase functions deploy queue-book
supabase functions deploy queue-mark-served
supabase functions deploy queue-mark-no-show
supabase functions deploy doctor-set-availability
supabase functions deploy queue-status
supabase functions deploy doctors-list

# Wait for "✓ Function deployed successfully" for each
```

✅ **All functions deployed!**

---

## STEP 7: Install Frontend Dependencies (3 minutes)

```bash
# Install Supabase client:
npm install @supabase/supabase-js

# Verify it's installed:
npm list @supabase/supabase-js
```

---

## STEP 8: Test Your Setup (5 minutes)

### Start Dev Server

```bash
npm run dev

# You should see:
# > vite
# VITE ... ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### Test Sign Up

```
1. Open http://localhost:5173
2. Go to Patient Signup (or any signup page)
3. Create account:
   - Email: test@example.com
   - Password: testpass123
4. Click "Sign Up"
5. Wait for success message
```

### Verify in Supabase

```
1. Go to Supabase dashboard
2. Click: Authentication (left sidebar)
3. Click: Users
4. You should see your test user in the list!
```

✅ **Authentication works!**

---

## STEP 9: Create Test Doctor (2 minutes)

### In Supabase SQL Editor

```sql
-- Copy and run this query:

INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'doctor@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Copy the returned UUID (something like: 12345678-1234-5678-1234...)
```

### Create Doctor Profile

```sql
-- Replace DOCTOR_UUID with the ID from above query

INSERT INTO public.profiles (id, name, email, role) 
VALUES (
  'DOCTOR_UUID',
  'Dr. John Smith',
  'doctor@test.com',
  'doctor'
);

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
  'DOCTOR_UUID',
  'Cardiology',
  10,
  true,
  15,
  20,
  4.5,
  'Cardiology Department',
  'Experienced cardiologist'
);
```

✅ **Test doctor created!**

---

## STEP 10: Test Appointment Booking (3 minutes)

### In Your Frontend

```typescript
// In any component:

import { supabaseService } from '@/services/supabaseService'

// Get doctors list:
const doctors = await supabaseService.getDoctors()
console.log('Doctors:', doctors)

// Book appointment (replace with real doctor ID):
const result = await supabaseService.bookAppointment(
  'DOCTOR_UUID_HERE',
  'General checkup needed'
)
console.log('Booking result:', result)
```

### Or Use Postman

```
1. Import: Supabase_Queue_API.postman_collection.json
2. Set variables:
   - supabase_url: https://your-project.supabase.co
   - access_token: (get from login response)
   - doctor_id: (from test doctor)
3. Run "Book Appointment" request
4. Check response
```

✅ **Booking works!**

---

## STEP 11: Verify Real-time Works (2 minutes)

### In Your Frontend

```typescript
// Subscribe to queue changes:

const subscription = supabaseService.subscribeToQueueChanges(
  'DOCTOR_UUID_HERE',
  (payload) => {
    console.log('Queue updated:', payload)
  }
)

// Make a booking from another tab/window
// You should see the update logged!

// Clean up when done:
supabaseService.unsubscribe(subscription)
```

✅ **Real-time works!**

---

## STEP 12: You're Done! 🎉

### Verify All Components

- [x] Supabase project created
- [x] API keys configured
- [x] Database migrations run
- [x] Real-time enabled
- [x] Functions deployed
- [x] Dependencies installed
- [x] Dev server running
- [x] Authentication tested
- [x] Doctor created
- [x] Booking tested
- [x] Real-time verified

### Your Backend is Ready for:

✅ Production deployment  
✅ More users and testing  
✅ Scale to millions of records  
✅ Real-time queue updates  
✅ Complete queue management  

---

## 📋 QUICK REFERENCE

### Important Links
- **Supabase Dashboard**: https://app.supabase.com
- **Your Project URL**: https://your-project.supabase.co
- **This Project**: http://localhost:5173

### Important Files
- **SQL Migrations**: `supabase/migrations/`
- **Edge Functions**: `supabase/functions/`
- **Supabase Config**: `src/config/supabase.ts`
- **Auth Service**: `src/services/supabaseAuthService.ts`
- **DB Service**: `src/services/supabaseService.ts`

### Important Commands
```bash
npm run dev                    # Start dev server
npm install @supabase/supabase-js  # Install dependency
supabase login                 # Login to Supabase
supabase functions deploy NAME # Deploy function
```

---

## 🆘 TROUBLESHOOTING

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
npm run dev
```

### "Invalid API key"
- Check `.env.local` has correct values
- Restart dev server after updating `.env.local`

### "SQL syntax error"
- Make sure you copied the ENTIRE SQL file
- Check for any truncation
- Try running smaller parts of the query

### "Function deployment failed"
```bash
supabase logout
supabase login
supabase link --project-ref YOUR_REF
supabase functions deploy patient-create
```

### "Real-time not updating"
- Confirm real-time is enabled for the table
- Check browser console for errors
- Refresh the page

---

## ✅ FINAL CHECKLIST

Before going to production:

- [x] All SQL migrations executed
- [x] All 7 functions deployed
- [x] Real-time enabled
- [x] Environment variables set
- [x] Authentication tested
- [x] Booking tested
- [x] Real-time tested
- [ ] Update doctor list in database
- [ ] Configure email templates (optional)
- [ ] Set up backups (automatic in Supabase)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (optional)

---

## 🎓 NEXT LEARNING STEPS

1. Read `SUPABASE_COMPLETE_GUIDE.md` for full architecture
2. Review SQL files to understand database design
3. Study edge function code for business logic
4. Check `supabaseService.ts` for frontend integration
5. Explore Supabase dashboard features

---

## 📞 NEED HELP?

### Check These First
1. `SUPABASE_COMPLETE_GUIDE.md` - Full documentation
2. Browser console - JavaScript errors
3. Supabase dashboard - Database and function logs
4. This guide - Common issues

### Official Resources
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Total Setup Time**: ~30 minutes  
**Difficulty Level**: Beginner-Intermediate  
**Prerequisites**: Supabase account, Node.js installed  

---

**You've successfully migrated from Firebase to Supabase! 🚀**

Your queue management system is now running on a powerful PostgreSQL backend with real-time capabilities and serverless functions. Enjoy!
