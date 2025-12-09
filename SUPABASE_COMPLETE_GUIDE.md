# SUPABASE QUEUE MANAGEMENT SYSTEM - COMPLETE BACKEND

## ✅ Complete System Built

This document outlines the entire Supabase backend setup for the queue management system.

---

## 📋 TABLE OF CONTENTS

1. [Database Schema](#database-schema)
2. [RLS Policies](#rls-policies)
3. [Edge Functions](#edge-functions)
4. [API Endpoints](#api-endpoints)
5. [Realtime Setup](#realtime-setup)
6. [Frontend Integration](#frontend-integration)
7. [Environment Variables](#environment-variables)
8. [Testing with Postman](#testing-with-postman)

---

## 📊 DATABASE SCHEMA

### Tables Created

1. **profiles** - Extended user profiles
2. **patients** - Patient-specific data
3. **doctors** - Doctor profiles and queue info
4. **doctor_queue** - Queue management

### File Location
`supabase/migrations/001_initial_schema.sql`

### Key Features
- Automatic timestamps with triggers
- Helper functions for queue management
- Performance indices on frequently queried fields
- Comments for documentation

---

## 🔐 ROW LEVEL SECURITY (RLS) POLICIES

### File Location
`supabase/migrations/002_rls_policies.sql`

### Policy Summary

#### Profiles Table
- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ✅ Staff can view all profiles
- ✅ New users can insert during signup

#### Patients Table
- ✅ Patients can view/update their own record
- ✅ Staff can view all patient records
- ✅ Doctors can view patients in their queue
- ✅ Patients can insert during signup

#### Doctors Table
- ✅ Everyone can view available doctors
- ✅ Doctors can view/update their own record
- ✅ Staff can update any doctor's availability
- ✅ Doctors can insert during signup

#### Doctor Queue Table
- ✅ Patients can view only their appointments
- ✅ Patients can see current queue status
- ✅ Doctors can view/update their own queue
- ✅ Staff can view/manage all queues
- ✅ Patients can cancel waiting appointments
- ✅ Realtime enabled for live updates

---

## ⚡ EDGE FUNCTIONS

All Edge Functions are serverless TypeScript functions hosted on Supabase.

### 1. Patient Create
**File**: `supabase/functions/patient-create/index.ts`
**Endpoint**: `POST /functions/v1/patient-create`

**Purpose**: Create a new patient profile

**Request**:
```json
{
  "name": "John Doe",
  "healthDetails": "Diabetes",
  "medicalHistory": ["Hypertension"],
  "allergies": "Penicillin",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1-234-567-8901"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "patientId": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2. Queue Book
**File**: `supabase/functions/queue-book/index.ts`
**Endpoint**: `POST /functions/v1/queue-book`

**Purpose**: Add patient to doctor's queue

**Request**:
```json
{
  "doctor_id": "uuid",
  "health_summary": "General checkup",
  "appointment_date": "2025-12-10",
  "appointment_time": "10:30",
  "notes": "First time visit"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "queueId": "uuid",
    "token": "A001",
    "position": 1,
    "estimatedWaitTime": 15,
    "patientName": "John Doe",
    "doctorId": "uuid"
  }
}
```

**Logic**:
1. Calculates next token (A001, A002, etc.)
2. Determines position = queue_count + 1
3. Inserts into doctor_queue table
4. Updates doctor's queue_count
5. Calculates estimated wait = position × avg_consult_time_minutes

---

### 3. Mark Served
**File**: `supabase/functions/queue-mark-served/index.ts`
**Endpoint**: `POST /functions/v1/queue-mark-served`

**Purpose**: Mark patient as completed and move next patient to in-progress

**Request**:
```json
{
  "queue_id": "uuid",
  "doctor_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Patient marked as served",
    "nextPatient": { ... },
    "remainingQueue": 4
  }
}
```

**Logic**:
1. Marks current patient status = 'completed'
2. Sets completed_at timestamp
3. Moves next waiting patient to 'in-progress'
4. Recalculates all positions and estimated wait times
5. Updates doctor's queue_count

---

### 4. Mark No-Show
**File**: `supabase/functions/queue-mark-no-show/index.ts`
**Endpoint**: `POST /functions/v1/queue-mark-no-show`

**Purpose**: Mark patient as no-show

**Request**:
```json
{
  "queue_id": "uuid",
  "doctor_id": "uuid",
  "cancellation_reason": "Patient did not arrive"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Patient marked as no-show",
    "remainingInQueue": 4
  }
}
```

**Logic**:
1. Marks patient status = 'no-show'
2. Records cancellation reason and timestamp
3. Recalculates remaining queue positions
4. Updates estimated wait times

---

### 5. Set Doctor Availability
**File**: `supabase/functions/doctor-set-availability/index.ts`
**Endpoint**: `POST /functions/v1/doctor-set-availability`

**Purpose**: Toggle doctor availability (staff only)

**Request**:
```json
{
  "doctor_id": "uuid",
  "available": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "doctorId": "uuid",
    "available": true,
    "message": "Doctor is now available"
  }
}
```

---

### 6. Queue Status
**File**: `supabase/functions/queue-status/index.ts`
**Endpoint**: `GET /functions/v1/queue-status/:doctor_id`

**Purpose**: Get queue status for a doctor

**Response**:
```json
{
  "success": true,
  "data": {
    "doctorId": "uuid",
    "doctorName": "Dr. Smith",
    "totalInQueue": 5,
    "queue": [
      {
        "id": "uuid",
        "patient_name": "John Doe",
        "token": "A001",
        "position": 1,
        "status": "in-progress",
        "estimated_wait_time": 15
      }
    ]
  }
}
```

---

### 7. Doctors List
**File**: `supabase/functions/doctors-list/index.ts`
**Endpoint**: `GET /functions/v1/doctors-list?specialty=Cardiology&available=true`

**Purpose**: Get list of doctors with filters

**Query Parameters**:
- `specialty` (optional): Filter by specialization
- `available` (optional): Filter by availability (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalDoctors": 12,
    "doctors": [
      {
        "id": "uuid",
        "name": "Dr. Sarah Smith",
        "specialization": "Cardiology",
        "available": true,
        "rating": 4.5,
        "current_queue_count": 3,
        "avg_consult_time_minutes": 15
      }
    ]
  }
}
```

---

## 🔌 API ENDPOINTS SUMMARY

| Method | Endpoint | Function | Requires Auth |
|--------|----------|----------|----------------|
| POST | /functions/v1/patient-create | Create patient profile | ✅ Yes |
| POST | /functions/v1/queue-book | Book appointment | ✅ Yes |
| GET | /functions/v1/queue-status/:id | Get queue status | ✅ Yes |
| POST | /functions/v1/queue-mark-served | Mark patient served | ✅ Yes (Doctor) |
| POST | /functions/v1/queue-mark-no-show | Mark no-show | ✅ Yes (Doctor/Staff) |
| POST | /functions/v1/doctor-set-availability | Set availability | ✅ Yes (Staff) |
| GET | /functions/v1/doctors-list | List doctors | ✅ Optional |

---

## 📡 REALTIME SETUP

### Enable Realtime on Tables

Tables with realtime enabled:
- `doctor_queue` (INSERT, UPDATE, DELETE)
- `doctors` (UPDATE for availability changes)

### Subscription Example

```typescript
// Subscribe to queue changes
const subscription = supabaseService.subscribeToQueueChanges(
  doctorId,
  (payload) => {
    console.log('Queue updated:', payload)
    // Handle: INSERT, UPDATE, DELETE
  }
)

// Unsubscribe when done
supabaseService.unsubscribe(subscription)
```

### Event Types

- **INSERT**: New patient added to queue
- **UPDATE**: Patient status changed, position updated
- **DELETE**: Patient removed from queue

---

## 🔌 FRONTEND INTEGRATION

### Environment Variables

Add to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Files Created

1. **src/config/supabase.ts** - Supabase client initialization
2. **src/services/supabaseAuthService.ts** - Authentication
3. **src/services/supabaseService.ts** - Database & realtime operations

### Usage in Components

```typescript
import { supabaseService } from '@/services/supabaseService'
import { supabaseAuthService } from '@/services/supabaseAuthService'

// Book appointment
const result = await supabaseService.bookAppointment(doctorId, healthSummary)

// Get queue status
const queue = await supabaseService.getQueueStatus(doctorId)

// Subscribe to changes
const subscription = supabaseService.subscribeToQueueChanges(doctorId, (data) => {
  // Handle real-time updates
})
```

---

## 🔐 ENVIRONMENT VARIABLES

### Required for Frontend

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### How to Get These

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → VITE_SUPABASE_URL
   - **anon public** key → VITE_SUPABASE_ANON_KEY

---

## 🧪 TESTING WITH POSTMAN

### Import Collection

Create a new Postman collection with these requests:

### 1. Sign Up as Patient
```
POST http://localhost:54321/functions/v1/auth-signup
Headers:
  Content-Type: application/json

Body:
{
  "email": "patient@test.com",
  "password": "password123",
  "name": "John Doe",
  "role": "patient"
}
```

### 2. Sign In
```
POST http://localhost:54321/auth/v1/token?grant_type=password
Headers:
  Content-Type: application/json

Body:
{
  "email": "patient@test.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJh...",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

### 3. Get Doctors List
```
GET http://localhost:54321/functions/v1/doctors-list?specialty=Cardiology&available=true
Headers:
  Content-Type: application/json
  Authorization: Bearer {access_token}
```

### 4. Book Appointment
```
POST http://localhost:54321/functions/v1/queue-book
Headers:
  Content-Type: application/json
  Authorization: Bearer {access_token}

Body:
{
  "doctor_id": "doctor-uuid-here",
  "health_summary": "General checkup needed",
  "appointment_date": "2025-12-10",
  "appointment_time": "10:30",
  "notes": "First visit"
}
```

### 5. Get Queue Status
```
GET http://localhost:54321/functions/v1/queue-status/doctor-uuid
Headers:
  Authorization: Bearer {access_token}
```

### 6. Mark as Served (Doctor Only)
```
POST http://localhost:54321/functions/v1/queue-mark-served
Headers:
  Content-Type: application/json
  Authorization: Bearer {doctor_access_token}

Body:
{
  "queue_id": "queue-uuid",
  "doctor_id": "doctor-uuid"
}
```

---

## 📦 FILE STRUCTURE

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      # Tables & functions
│   └── 002_rls_policies.sql         # Security policies
└── functions/
    ├── patient-create/
    │   └── index.ts
    ├── queue-book/
    │   └── index.ts
    ├── queue-mark-served/
    │   └── index.ts
    ├── queue-mark-no-show/
    │   └── index.ts
    ├── doctor-set-availability/
    │   └── index.ts
    ├── queue-status/
    │   └── index.ts
    └── doctors-list/
        └── index.ts

src/
├── config/
│   └── supabase.ts                  # Client setup
├── services/
│   ├── supabaseAuthService.ts       # Auth operations
│   └── supabaseService.ts            # DB & realtime
└── context/
    └── AuthContext.tsx              # Auth context
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Create Supabase Project
- Visit [supabase.com](https://supabase.com)
- Create new project
- Get Project URL and API keys

### 2. Run Migrations
In Supabase SQL Editor:
1. Run `001_initial_schema.sql`
2. Run `002_rls_policies.sql`

### 3. Deploy Edge Functions
```bash
supabase functions deploy patient-create
supabase functions deploy queue-book
supabase functions deploy queue-mark-served
supabase functions deploy queue-mark-no-show
supabase functions deploy doctor-set-availability
supabase functions deploy queue-status
supabase functions deploy doctors-list
```

### 4. Configure Environment
Add to `.env.local`:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 5. Test Connection
Run your frontend and test signup/login flow

---

## ✨ KEY FEATURES

✅ **Complete Authentication** - Sign up, login, logout
✅ **Role-Based Access** - Patient, Doctor, Staff
✅ **Queue Management** - Token generation, position tracking
✅ **Real-time Updates** - Live queue status
✅ **Automatic Calculations** - Wait times, positions
✅ **RLS Security** - Database-level access control
✅ **Edge Functions** - Serverless backend logic
✅ **Scalable** - Built on PostgreSQL

---

## 🐛 TROUBLESHOOTING

### "Invalid JWT"
- Check Authorization header is present
- Verify token is not expired
- Confirm token format: `Bearer {token}`

### "Permission denied"
- Check RLS policies are enabled
- Verify user has correct role
- Check user ID matches the data

### "Function not found"
- Ensure all 7 functions are deployed
- Check function names match exactly
- Verify Supabase CLI is installed

### "Realtime not updating"
- Confirm realtime is enabled on table
- Check subscription is active
- Verify firewall/CORS settings

---

## 📚 ADDITIONAL RESOURCES

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ✅ CHECKLIST

- [ ] Supabase project created
- [ ] Migrations run
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Frontend dependencies installed
- [ ] Authentication tested
- [ ] Queue booking tested
- [ ] Realtime subscriptions tested
- [ ] All RLS policies verified
- [ ] Production deployment ready

---

**Last Updated**: December 10, 2025
**System Status**: ✅ Complete and Ready for Use
