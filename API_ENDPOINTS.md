# Supabase Queue Management API Endpoints

Complete reference for all available API endpoints in your Supabase backend.

---

## Authentication Endpoints

### Sign Up (Create New User)

**Endpoint**: `POST /auth/v1/signup`  
**Provider**: Supabase Auth  
**Authentication**: Public  

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "data": {
    "name": "John Doe",
    "role": "patient"
  }
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "authenticated",
    "user_metadata": {
      "name": "John Doe",
      "role": "patient"
    }
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

### Log In

**Endpoint**: `POST /auth/v1/token?grant_type=password`  
**Provider**: Supabase Auth  
**Authentication**: Public  

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

---

### Log Out

**Method**: Frontend only (clear session)  
**Code**:
```typescript
import { supabaseAuthService } from '@/services/supabaseAuthService'

await supabaseAuthService.logout()
```

---

## Doctor Management Endpoints

### Get All Doctors

**Endpoint**: `GET /functions/v1/doctors-list`  
**Authentication**: Public  
**Parameters** (Optional):
- `specialty`: Filter by specialty (e.g., "Cardiology")
- `available`: Filter by availability (true/false)

**Example Request**:
```bash
GET https://your-project.supabase.co/functions/v1/doctors-list?specialty=Cardiology&available=true
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalDoctors": 5,
    "doctors": [
      {
        "id": "doctor-uuid-1",
        "name": "Dr. John Smith",
        "specialization": "Cardiology",
        "experience_years": 10,
        "available": true,
        "avg_consult_time_minutes": 15,
        "max_queue_capacity": 20,
        "current_queue_count": 3,
        "rating": 4.8,
        "review_count": 45,
        "department": "Cardiology Department",
        "bio": "Experienced cardiologist with 10+ years",
        "image_url": "https://...",
        "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    ]
  }
}
```

---

### Get Single Doctor

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const doctor = await supabaseService.getDoctor('doctor-uuid')
```

**Response**:
```json
{
  "id": "doctor-uuid",
  "name": "Dr. John Smith",
  "specialization": "Cardiology",
  "experience_years": 10,
  "available": true,
  "avg_consult_time_minutes": 15,
  "max_queue_capacity": 20,
  "current_queue_count": 3,
  "rating": 4.8,
  "review_count": 45,
  "department": "Cardiology Department",
  "bio": "Experienced cardiologist with 10+ years",
  "image_url": "https://...",
  "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}
```

---

## Queue Management Endpoints

### Book Appointment (Add to Queue)

**Endpoint**: `POST /functions/v1/queue-book`  
**Authentication**: Required (Patient)  
**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "doctor_id": "doctor-uuid",
  "health_summary": "General checkup needed"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "queue_id": "queue-uuid",
    "token": "A001",
    "position": 1,
    "estimated_wait_time": 15,
    "doctor_id": "doctor-uuid",
    "patient_name": "John Doe",
    "doctor_name": "Dr. John Smith",
    "status": "waiting",
    "created_at": "2025-12-10T10:30:00Z"
  }
}
```

---

### Get Queue Status for Doctor

**Endpoint**: `GET /functions/v1/queue-status/:doctor_id`  
**Authentication**: Public  
**Parameters**:
- `doctor_id`: UUID of the doctor

**Example Request**:
```bash
GET https://your-project.supabase.co/functions/v1/queue-status/doctor-uuid-1
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "doctor_id": "doctor-uuid-1",
    "doctor_name": "Dr. John Smith",
    "total_in_queue": 5,
    "queue": [
      {
        "id": "queue-uuid-1",
        "token": "A001",
        "position": 1,
        "status": "in-progress",
        "patient_name": "Alice Johnson",
        "estimated_wait_time": 0,
        "created_at": "2025-12-10T09:30:00Z"
      },
      {
        "id": "queue-uuid-2",
        "token": "A002",
        "position": 2,
        "status": "waiting",
        "patient_name": "Bob Williams",
        "estimated_wait_time": 15,
        "created_at": "2025-12-10T09:45:00Z"
      },
      {
        "id": "queue-uuid-3",
        "token": "A003",
        "position": 3,
        "status": "waiting",
        "patient_name": "Carol Davis",
        "estimated_wait_time": 30,
        "created_at": "2025-12-10T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Patient Appointment Status

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const appointment = await supabaseService.getPatientAppointmentStatus('patient-uuid')
```

**Response**:
```json
{
  "id": "queue-uuid",
  "token": "A002",
  "position": 2,
  "status": "waiting",
  "doctor_id": "doctor-uuid",
  "doctor_name": "Dr. John Smith",
  "estimated_wait_time": 15,
  "appointment_date": "2025-12-10",
  "appointment_time": "10:45:00",
  "created_at": "2025-12-10T09:45:00Z"
}
```

---

### Mark Patient Served (Doctor Completes Consultation)

**Endpoint**: `POST /functions/v1/queue-mark-served`  
**Authentication**: Required (Doctor/Staff)  
**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "queue_id": "queue-uuid",
  "doctor_id": "doctor-uuid",
  "consultation_notes": "Patient responded well to treatment"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Patient marked as served. Next patient: Bob Williams",
    "completed_patient": {
      "id": "queue-uuid-1",
      "token": "A001",
      "patient_name": "Alice Johnson",
      "status": "completed"
    },
    "next_patient": {
      "id": "queue-uuid-2",
      "token": "A002",
      "patient_name": "Bob Williams",
      "position": 1,
      "status": "in-progress"
    },
    "remaining_in_queue": 4
  }
}
```

---

### Mark Patient No-Show

**Endpoint**: `POST /functions/v1/queue-mark-no-show`  
**Authentication**: Required (Doctor/Staff)  
**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "queue_id": "queue-uuid",
  "doctor_id": "doctor-uuid",
  "reason": "Patient did not arrive"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Patient marked as no-show",
    "marked_patient": {
      "id": "queue-uuid",
      "token": "A001",
      "patient_name": "John Doe",
      "status": "no-show"
    },
    "remaining_in_queue": 4
  }
}
```

---

### Cancel Appointment

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const result = await supabaseService.cancelAppointment('queue-uuid', 'Patient requested cancellation')
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "queue_id": "queue-uuid",
  "cancellation_reason": "Patient requested cancellation"
}
```

---

## Doctor Availability Management

### Set Doctor Availability

**Endpoint**: `POST /functions/v1/doctor-set-availability`  
**Authentication**: Required (Staff)  
**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "doctor_id": "doctor-uuid",
  "available": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "doctor_id": "doctor-uuid",
    "doctor_name": "Dr. John Smith",
    "available": true,
    "message": "Doctor availability updated successfully"
  }
}
```

---

## Real-time Subscriptions

### Subscribe to Queue Changes

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const subscription = supabaseService.subscribeToQueueChanges(
  'doctor-uuid',
  (payload) => {
    console.log('Queue updated:', payload)
    // Handle: INSERT (new patient), UPDATE (status change), DELETE (cancellation)
  }
)

// Clean up when done:
supabaseService.unsubscribe(subscription)
```

**Payload Examples**:

**New Patient Added**:
```json
{
  "eventType": "INSERT",
  "new": {
    "id": "queue-uuid-5",
    "doctor_id": "doctor-uuid",
    "token": "A005",
    "position": 5,
    "patient_name": "Eve Wilson",
    "status": "waiting",
    "created_at": "2025-12-10T10:30:00Z"
  }
}
```

**Patient Status Changed**:
```json
{
  "eventType": "UPDATE",
  "old": {
    "status": "waiting",
    "position": 3
  },
  "new": {
    "status": "in-progress",
    "position": 1
  }
}
```

**Appointment Cancelled**:
```json
{
  "eventType": "DELETE",
  "old": {
    "id": "queue-uuid-2",
    "token": "A002",
    "patient_name": "Bob Williams",
    "status": "waiting"
  }
}
```

---

### Subscribe to Doctor Availability Changes

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const subscription = supabaseService.subscribeToAvailabilityChanges(
  'doctor-uuid',
  (payload) => {
    console.log('Doctor availability changed:', payload)
  }
)

// Clean up when done:
supabaseService.unsubscribe(subscription)
```

**Payload Example**:
```json
{
  "eventType": "UPDATE",
  "old": {
    "available": true
  },
  "new": {
    "available": false
  }
}
```

---

## Profile Management

### Get Current User Profile

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const profile = await supabaseService.getProfile()
```

**Response** (Patient):
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "avatar_url": "https://...",
  "phone": "+1234567890"
}
```

**Response** (Doctor):
```json
{
  "id": "user-uuid",
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "role": "doctor",
  "avatar_url": "https://...",
  "phone": "+1234567890",
  "doctor_id": "doctor-uuid"
}
```

---

### Update User Profile

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

await supabaseService.updateProfile({
  name: "Updated Name",
  phone: "+9876543210",
  avatar_url: "https://new-avatar.com/image.jpg"
})
```

---

### Get Patient Profile

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

const patient = await supabaseService.getPatientProfile()
```

**Response**:
```json
{
  "id": "patient-uuid",
  "user_id": "user-uuid",
  "health_details": "No known allergies",
  "medical_history": ["Hypertension", "Diabetes"],
  "allergies": ["Penicillin"],
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+9876543210"
}
```

---

### Update Patient Profile

**Method**: Frontend service  
**Code**:
```typescript
import { supabaseService } from '@/services/supabaseService'

await supabaseService.updatePatientProfile({
  health_details: "Recently diagnosed with hypertension",
  medical_history: ["Hypertension", "Diabetes"],
  allergies: ["Penicillin", "Aspirin"],
  emergency_contact: "Jane Doe",
  emergency_phone: "+9876543210"
})
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized** (Invalid/Missing Token):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "status": 401
}
```

**400 Bad Request** (Invalid Data):
```json
{
  "error": "Bad Request",
  "message": "Missing required field: doctor_id",
  "status": 400
}
```

**404 Not Found** (Resource Not Found):
```json
{
  "error": "Not Found",
  "message": "Doctor not found",
  "status": 404
}
```

**500 Internal Server Error** (Server Error):
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred processing your request",
  "status": 500
}
```

---

## Rate Limiting

- **Free tier**: 1,000 requests/hour
- **Pro tier**: 10,000 requests/hour
- **Enterprise**: Custom limits

Header included in response:
```
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1670000000
```

---

## CORS Configuration

All endpoints support CORS from:
- `http://localhost:5173` (Development)
- `https://yourdomain.com` (Production - configure in Supabase)

---

## Testing Endpoints

### With cURL

```bash
# Get doctors list
curl -X GET "https://your-project.supabase.co/functions/v1/doctors-list?specialty=Cardiology" \
  -H "Content-Type: application/json"

# Book appointment (requires token)
curl -X POST "https://your-project.supabase.co/functions/v1/queue-book" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "doctor_id": "doctor-uuid",
    "health_summary": "General checkup"
  }'

# Get queue status
curl -X GET "https://your-project.supabase.co/functions/v1/queue-status/doctor-uuid" \
  -H "Content-Type: application/json"
```

### With Postman

1. Import: `Supabase_Queue_API.postman_collection.json`
2. Set environment variables:
   - `supabase_url`: Your Supabase URL
   - `access_token`: Token from login response
   - `doctor_id`: A valid doctor UUID
3. Run requests in order

---

## API Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/POST |
| 201 | Created | Successful POST creating resource |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

## Authentication Token Usage

All endpoints requiring authentication use JWT tokens:

```bash
# Get token from login response
# Include in all subsequent requests

curl -X POST "https://your-project.supabase.co/functions/v1/queue-book" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Token Expiry**:
- Access token: 1 hour
- Refresh token: 7 days
- Automatic refresh on token use

---

## Webhook Events (Advanced)

Real-time changes can trigger webhooks to external services. Configure in Supabase Dashboard:

**Events**:
- `queue:appointment:booked`
- `queue:appointment:served`
- `queue:appointment:no-show`
- `queue:appointment:cancelled`
- `doctor:availability:changed`

---

**Last Updated**: December 10, 2025  
**API Version**: 1.0  
**Status**: Production Ready ✅
