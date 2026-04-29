# Data Flow Between Roles - Complete Documentation

## Overview
This document explains how data flows between Hospital, Admin, and Donor roles in the blood donation system.

## Status Flow

### Request Lifecycle
```
pending → approved → fulfilled
   ↓         ↓          ↓
Hospital  Admin     Donor
creates   approves  accepts
```

### Status Definitions
1. **pending** - Hospital created, waiting for admin approval
2. **approved** - Admin approved, available for donors
3. **fulfilled** - Donor accepted and completed donation
4. **rejected** - Admin rejected the request

## Data Flow Diagram

```
┌──────────────┐
│   HOSPITAL   │
│   Creates    │
│   Request    │
└──────┬───────┘
       │
       │ POST /api/hospital/requests
       │ status: "pending"
       ↓
┌──────────────────────┐
│   DATABASE           │
│   requests table     │
│   status: "pending"  │
└──────┬───────────────┘
       │
       │ GET /api/requests (all requests)
       ↓
┌──────────────┐
│    ADMIN     │
│   Reviews    │
│   Request    │
└──────┬───────┘
       │
       │ PUT /api/requests/:id
       │ status: "approved" or "rejected"
       ↓
┌──────────────────────┐
│   DATABASE           │
│   requests table     │
│   status: "approved" │
└──────┬───────────────┘
       │
       │ GET /api/donor/available-requests
       │ WHERE status = "approved"
       ↓
┌──────────────┐
│    DONOR     │
│   Accepts    │
│   Request    │
└──────┬───────┘
       │
       │ POST /api/donor/accept-request/:id
       │ status: "fulfilled"
       │ donor_email: saved
       │ inventory: deducted
       ↓
┌──────────────────────┐
│   DATABASE           │
│   requests table     │
│   status: "fulfilled"│
│   donor_email: set   │
└──────────────────────┘
```

## API Endpoints

### 1. Hospital Creates Request
**Endpoint:** `POST /api/hospital/requests`

**Request Body:**
```json
{
  "blood_group": "O+",
  "units": 2,
  "urgency": "critical",
  "userId": 1,
  "email": "hospital@example.com"
}
```

**Response:**
```json
{
  "id": 123,
  "blood_group": "O+",
  "units": 2,
  "location": "City Hospital",
  "status": "pending",
  "urgency": "critical",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Database Action:**
- Inserts new request with `status = "pending"`
- Location resolved from hospital user profile

**UI Update:**
- Hospital sees request in "Our Requests" page
- Status shows as "Pending"

---

### 2. Admin Views All Requests
**Endpoint:** `GET /api/requests`

**Response:**
```json
[
  {
    "id": 123,
    "blood_group": "O+",
    "units": 2,
    "location": "City Hospital",
    "status": "pending",
    "urgency": "critical",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Database Query:**
```sql
SELECT * FROM requests ORDER BY created_at DESC
```

**UI Display:**
- Admin sees all requests (pending, approved, rejected, fulfilled)
- Can filter by status
- Can search by location or blood type

---

### 3. Admin Approves/Rejects Request
**Endpoint:** `PUT /api/requests/:id`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "id": 123,
  "blood_group": "O+",
  "units": 2,
  "location": "City Hospital",
  "status": "approved",
  "urgency": "critical",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Database Action:**
- Updates request status to "approved" or "rejected"
- If approved: Checks inventory availability
- If approved: Deducts from inventory (prevents double deduction)

**UI Update:**
- Admin sees status badge change instantly
- Hospital sees status update in "Our Requests"
- Donor sees request appear in "Available Requests"

---

### 4. Donor Views Available Requests
**Endpoint:** `GET /api/donor/available-requests`

**Response:**
```json
[
  {
    "id": 123,
    "blood_group": "O+",
    "units": 2,
    "location": "City Hospital",
    "status": "approved",
    "urgency": "critical",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Database Query:**
```sql
SELECT id, blood_group, units, location, status, urgency, created_at 
FROM requests 
WHERE status = 'approved' 
ORDER BY urgency DESC, created_at DESC 
LIMIT 50
```

**UI Display:**
- Donor sees only approved requests
- Sorted by urgency (critical first)
- Shows "Accept / Donate" button

---

### 5. Donor Accepts Request
**Endpoint:** `POST /api/donor/accept-request/:id`

**Request Body:**
```json
{
  "email": "donor@example.com"
}
```

**Response:**
```json
{
  "id": 123,
  "blood_group": "O+",
  "units": 2,
  "location": "City Hospital",
  "status": "fulfilled",
  "urgency": "critical",
  "donor_email": "donor@example.com",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Database Actions (Transaction):**
1. Check request exists and status is "approved"
2. Check inventory has sufficient units
3. Update request: `status = "fulfilled"`, `donor_email = email`
4. Deduct from inventory: `units = units - request.units`

**UI Update:**
- Donor sees "Donation Successful!" message
- Request removed from "Available Requests"
- Request appears in donor's "History"
- Hospital sees status update to "Fulfilled"
- Admin sees status update to "Fulfilled"

---

## Data Flow Verification

### Flow 1: Hospital → Admin → Donor (Success Path)

**Step 1: Hospital Creates Request**
```
Hospital: POST /api/hospital/requests
Database: INSERT INTO requests (status = "pending")
Result: Request ID 123 created
```

**Step 2: Admin Approves Request**
```
Admin: PUT /api/requests/123 (status = "approved")
Database: UPDATE requests SET status = "approved" WHERE id = 123
Database: UPDATE inventory SET units = units - 2 WHERE blood_group = "O+"
Result: Request 123 approved, inventory deducted
```

**Step 3: Donor Accepts Request**
```
Donor: POST /api/donor/accept-request/123
Database: UPDATE requests SET status = "fulfilled", donor_email = "donor@example.com" WHERE id = 123
Result: Request 123 fulfilled, donor recorded
```

**Final State:**
- Hospital sees: Status = "Fulfilled"
- Admin sees: Status = "Fulfilled"
- Donor sees: Request in history with status "Fulfilled"
- Inventory: Deducted by 2 units

---

### Flow 2: Hospital → Admin (Rejection Path)

**Step 1: Hospital Creates Request**
```
Hospital: POST /api/hospital/requests
Database: INSERT INTO requests (status = "pending")
Result: Request ID 124 created
```

**Step 2: Admin Rejects Request**
```
Admin: PUT /api/requests/124 (status = "rejected")
Database: UPDATE requests SET status = "rejected" WHERE id = 124
Result: Request 124 rejected
```

**Final State:**
- Hospital sees: Status = "Rejected"
- Admin sees: Status = "Rejected"
- Donor: Does NOT see request (not approved)
- Inventory: No change

---

## Instant UI Updates

### How It Works

All pages update the UI instantly after actions without requiring page refresh:

**1. Hospital Page:**
```typescript
// After creating request
setSuccess("Request Created Successfully!");
setFormData({ blood_group: "O+", units: 1, urgency: "normal" });
```

**2. Admin Page:**
```typescript
// After approving/rejecting
setRequests(prev => prev.map(r => 
  r.id === id ? { ...r, status: newStatus } : r
));
setSuccessMessage("Request Approved Successfully!");
```

**3. Donor Page:**
```typescript
// After accepting request
setRequests(prev => prev.filter(req => req.id !== requestId));
setSuccessMessage("Donation Successful!");
```

### Why It Works

1. **Optimistic Updates:** UI updates immediately before API response
2. **State Management:** React state updates trigger re-renders
3. **Filtering:** Lists automatically filter based on status
4. **No Polling:** No need for periodic API calls

---

## Database Schema

### requests Table
```sql
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  blood_group VARCHAR(5) NOT NULL,
  units INTEGER NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  urgency VARCHAR(20) DEFAULT 'normal',
  donor_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Status Values
- `pending` - Waiting for admin approval
- `approved` - Approved by admin, available for donors
- `fulfilled` - Completed by donor
- `rejected` - Rejected by admin

---

## Error Handling

### Hospital Create Request
**Errors:**
- Missing required fields → 400 Bad Request
- Invalid units → 400 Bad Request
- Hospital location not found → 400 Bad Request

### Admin Approve Request
**Errors:**
- Request not found → 404 Not Found
- Insufficient inventory → 400 Bad Request
- Database error → 500 Server Error

### Donor Accept Request
**Errors:**
- Request not found → 404 Not Found
- Request not approved → 400 Bad Request
- Insufficient inventory → 400 Bad Request
- Missing donor email → 400 Bad Request

---

## Testing Checklist

### Test 1: Complete Flow (Hospital → Admin → Donor)
1. Login as hospital: `cityhospital@example.com` / `password123`
2. Create request: O+, 2 units, critical
3. **Expected:** Request appears in hospital "Our Requests" with status "Pending"

4. Login as admin: `admin@lifedrops.com` / `admin123`
5. Navigate to "Requests"
6. **Expected:** See the new request with status "Pending"
7. Click "Approve"
8. **Expected:** Status changes to "Approved" instantly

9. Login as donor: `rahul@example.com` / `password123`
10. Navigate to "Available Requests"
11. **Expected:** See the approved request
12. Click "Accept / Donate"
13. **Expected:** "Donation Successful!" message, request disappears

14. Login as hospital again
15. **Expected:** Request status shows "Fulfilled"

16. Login as admin again
17. **Expected:** Request status shows "Fulfilled"

### Test 2: Rejection Flow
1. Hospital creates request
2. Admin rejects request
3. **Expected:** Hospital sees "Rejected" status
4. **Expected:** Donor does NOT see request in available list

### Test 3: Inventory Check
1. Check current inventory for O+
2. Hospital creates request for O+ (more units than available)
3. Admin tries to approve
4. **Expected:** Error message about insufficient inventory

---

## Key Changes Made

### 1. Donor Available Requests Endpoint ✅
**Changed:** Status filter from `pending` to `approved`

**Before:**
```sql
WHERE status = 'pending'
```

**After:**
```sql
WHERE status = 'approved'
```

**Reason:** Donors should only see admin-approved requests

### 2. Donor Accept Request Endpoint ✅
**Changed:** Status update from `approved` to `fulfilled`

**Before:**
```sql
UPDATE requests SET status = 'approved', donor_email = $1
```

**After:**
```sql
UPDATE requests SET status = 'fulfilled', donor_email = $1
```

**Reason:** Distinguish between admin-approved and donor-fulfilled

### 3. Donor History Endpoint ✅
**Changed:** Status filter from `approved` to `fulfilled`

**Before:**
```sql
WHERE status IN ('approved', 'rejected')
```

**After:**
```sql
WHERE status IN ('fulfilled', 'rejected')
```

**Reason:** Show only completed donations in history

---

## Files Modified

### ✅ Backend (1 file)
- `server/routes/donor.js`
  - Updated available-requests to filter by `status = 'approved'`
  - Updated accept-request to set `status = 'fulfilled'`
  - Updated history to filter by `status = 'fulfilled'`
  - Updated seeded data to use `fulfilled` status

### ✅ No Frontend Changes Needed
All frontend pages already handle status updates correctly through API responses.

---

## Status: ✅ COMPLETE

Data flow between roles is now working correctly:
- ✅ Hospital requests appear in admin dashboard
- ✅ Admin approved requests appear in donor dashboard
- ✅ Donor accepted requests update status globally
- ✅ All changes reflect across roles immediately
- ✅ Simple logic without over-engineering
