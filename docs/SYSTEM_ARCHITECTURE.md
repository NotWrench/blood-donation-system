# Request Approval System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLOOD DONATION SYSTEM                               │
│                      Request Approval Workflow                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   HOSPITAL       │
                              │   (User Role)    │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
        ┌─────────────────────┐            ┌──────────────────────┐
        │  POST REQUEST       │            │  VIEW MY REQUESTS    │
        │  /hospital/         │            │  /hospital/my-       │
        │  post-request       │            │  requests            │
        └──────────┬──────────┘            └──────────┬───────────┘
                   │                                  │
                   │ Creates Request                 │ Fetches Hospital
                   │ (status: pending)               │ Requests
                   │                                 │
                   ▼                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │         DATABASE: requests TABLE                    │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ id | blood_group | units | location | status │  │
        │  │ 1  │ O+          │ 2     │ City H.  │pending │  │
        │  │ 2  │ A-          │ 1     │ City H.  │pending │  │
        │  │ 3  │ B+          │ 3     │ City H.  │pending │  │
        │  └──────────────────────────────────────────────┘  │
        └────────────────────┬────────────────────────────────┘
                             │
                             │ GET /api/requests
                             │
                             ▼
        ┌─────────────────────────────────────────────────────┐
        │         ADMIN DASHBOARD                             │
        │  /admin/requests                                    │
        │                                                     │
        │  ┌─────────────────────────────────────────────┐   │
        │  │ REQUEST QUEUE                               │   │
        │  │ ┌─────────────────────────────────────────┐ │   │
        │  │ │ O+ | 2 units | City H. | [Approve][X] │ │   │
        │  │ │ A- | 1 unit  | City H. | [Approve][X] │ │   │
        │  │ │ B+ | 3 units | City H. | [Approve][X] │ │   │
        │  │ └─────────────────────────────────────────┘ │   │
        │  │                                             │   │
        │  │ FILTERS: [All] [Pending] [Approved] [Reject]   │
        │  │ SEARCH: [Location/Blood Type]                  │
        │  └─────────────────────────────────────────────┘   │
        └────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────────┐    ┌──────────────────┐
        │ APPROVE          │    │ REJECT           │
        │ PUT /api/        │    │ PUT /api/        │
        │ requests/:id     │    │ requests/:id     │
        │ {status:         │    │ {status:         │
        │  approved}       │    │  rejected}       │
        └────────┬─────────┘    └────────┬─────────┘
                 │                       │
                 │ Update Status         │ Update Status
                 │ Deduct Inventory      │ No Inventory Change
                 │                       │
                 ▼                       ▼
        ┌─────────────────────────────────────────────────────┐
        │         DATABASE: requests TABLE (UPDATED)          │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ id | blood_group | units | location | status │  │
        │  │ 1  │ O+          │ 2     │ City H.  │approved│  │
        │  │ 2  │ A-          │ 1     │ City H.  │rejected│  │
        │  │ 3  │ B+          │ 3     │ City H.  │pending │  │
        │  └──────────────────────────────────────────────┘  │
        │                                                     │
        │         DATABASE: inventory TABLE (UPDATED)        │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ blood_group | units                          │  │
        │  │ O+          │ 48 (was 50, -2 for approved)  │  │
        │  │ A-          │ 32 (unchanged)                 │  │
        │  │ B+          │ 25 (unchanged)                 │  │
        │  └──────────────────────────────────────────────┘  │
        └────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────────┐    ┌──────────────────┐
        │  HOSPITAL VIEW   │    │  DONOR VIEW      │
        │  /hospital/my-   │    │  /dashboard      │
        │  requests        │    │                  │
        │                  │    │                  │
        │ Status: Approved │    │ Available Req:   │
        │ ✓ O+ 2 units     │    │ • B+ 3 units     │
        │ ✗ A- 1 unit      │    │ • O+ 2 units     │
        │ ⏳ B+ 3 units     │    │   (approved)     │
        │                  │    │                  │
        │ [Refresh]        │    │ [Accept Request] │
        └──────────────────┘    └──────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: HOSPITAL CREATES REQUEST
┌──────────────────────────────────────────────────────────────────────────────┐
│ Hospital User                                                                │
│ ├─ Navigates to: /hospital/post-request                                     │
│ ├─ Fills form: Blood Type, Units, Urgency                                   │
│ └─ Submits: POST /api/hospital/requests                                     │
│                                                                              │
│ Backend Action:                                                              │
│ ├─ Validates input                                                          │
│ ├─ Resolves hospital location from user profile                             │
│ ├─ Creates request with status: "pending"                                   │
│ └─ Returns: Created request object                                          │
│                                                                              │
│ Database State:                                                              │
│ └─ INSERT INTO requests (blood_group, units, location, status, urgency)     │
│    VALUES ('O+', 2, 'City Hospital', 'pending', 'critical')                 │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 2: ADMIN REVIEWS REQUEST
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin User                                                                   │
│ ├─ Navigates to: /admin/requests                                            │
│ ├─ Fetches: GET /api/requests                                               │
│ ├─ Sees all pending requests in queue                                       │
│ ├─ Can filter by status or search by location/blood type                    │
│ └─ Reviews request details                                                  │
│                                                                              │
│ Backend Action:                                                              │
│ └─ SELECT * FROM requests ORDER BY created_at DESC                          │
│                                                                              │
│ Frontend Display:                                                            │
│ ├─ Request Card with details                                                │
│ ├─ [Approve] button (green)                                                 │
│ └─ [Reject] button (red)                                                    │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 3A: ADMIN APPROVES REQUEST
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin User                                                                   │
│ └─ Clicks: [Approve] button                                                 │
│                                                                              │
│ Frontend Action:                                                             │
│ ├─ Shows loading spinner                                                    │
│ ├─ Sends: PUT /api/requests/:id {status: "approved"}                        │
│ └─ Disables buttons during processing                                       │
│                                                                              │
│ Backend Action (Transaction):                                                │
│ ├─ BEGIN TRANSACTION                                                        │
│ ├─ UPDATE requests SET status = 'approved' WHERE id = :id                   │
│ ├─ SELECT units FROM inventory WHERE blood_group = :blood_group             │
│ ├─ IF units < requested_units: ROLLBACK (insufficient inventory)            │
│ ├─ ELSE: UPDATE inventory SET units = units - :units                        │
│ ├─ COMMIT TRANSACTION                                                       │
│ └─ Returns: Updated request object                                          │
│                                                                              │
│ Database State:                                                              │
│ ├─ requests: status = 'approved'                                            │
│ └─ inventory: units -= 2 (for O+)                                           │
│                                                                              │
│ Frontend Update:                                                             │
│ ├─ Request moves to "Approved" section                                      │
│ ├─ Buttons replaced with status indicator                                   │
│ └─ Statistics updated                                                       │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 3B: ADMIN REJECTS REQUEST
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin User                                                                   │
│ └─ Clicks: [Reject] button                                                  │
│                                                                              │
│ Frontend Action:                                                             │
│ ├─ Shows loading spinner                                                    │
│ ├─ Sends: PUT /api/requests/:id {status: "rejected"}                        │
│ └─ Disables buttons during processing                                       │
│                                                                              │
│ Backend Action:                                                              │
│ ├─ UPDATE requests SET status = 'rejected' WHERE id = :id                   │
│ ├─ NO inventory changes                                                     │
│ └─ Returns: Updated request object                                          │
│                                                                              │
│ Database State:                                                              │
│ └─ requests: status = 'rejected'                                            │
│                                                                              │
│ Frontend Update:                                                             │
│ ├─ Request moves to "Rejected" section                                      │
│ ├─ Buttons replaced with status indicator                                   │
│ └─ Statistics updated                                                       │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 4: HOSPITAL SEES STATUS UPDATE
┌──────────────────────────────────────────────────────────────────────────────┐
│ Hospital User                                                                │
│ ├─ Navigates to: /hospital/my-requests                                      │
│ ├─ Clicks: [Refresh] button                                                 │
│ └─ Fetches: GET /api/hospital/requests                                      │
│                                                                              │
│ Backend Action:                                                              │
│ ├─ Resolves hospital location from user profile                             │
│ ├─ SELECT * FROM requests WHERE location LIKE '%hospital_location%'         │
│ └─ Returns: Hospital's requests with updated status                         │
│                                                                              │
│ Frontend Display:                                                            │
│ ├─ Request shows status badge:                                              │
│ │  ├─ Approved: Green badge ✓                                               │
│ │  ├─ Rejected: Red badge ✗                                                 │
│ │  └─ Pending: Amber badge ⏳ (pulsing)                                      │
│ └─ Statistics updated                                                       │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 5: DONOR SEES AVAILABLE REQUEST
┌──────────────────────────────────────────────────────────────────────────────┐
│ Donor User                                                                   │
│ ├─ Navigates to: /dashboard                                                 │
│ ├─ Fetches: GET /api/donor/available-requests                               │
│ └─ Sees approved requests in "Recent Activity"                              │
│                                                                              │
│ Backend Action:                                                              │
│ ├─ SELECT * FROM requests WHERE status = 'pending'                          │
│ └─ Returns: Available requests for donor to accept                          │
│                                                                              │
│ Frontend Display:                                                            │
│ ├─ Shows approved requests matching donor's blood type                      │
│ ├─ Displays urgency level                                                   │
│ └─ [Donate / Accept Request] button                                         │
│                                                                              │
│ Donor Action:                                                                │
│ └─ Clicks: [Donate / Accept Request]                                        │
│    ├─ Sends: POST /api/donor/accept-request/:id                             │
│    ├─ Backend updates request status to 'approved'                          │
│    ├─ Inventory deducted                                                    │
│    └─ Request no longer available to other donors                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APP STRUCTURE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

app/
├── admin/
│   ├── layout.tsx (RoleGuard: admin only)
│   ├── dashboard/
│   │   └── page.tsx (redirects to /dashboard)
│   └── requests/
│       └── page.tsx ⭐ NEW - Admin Approval Queue
│           ├── Fetch requests from API
│           ├── Filter & Search
│           ├── Approve/Reject buttons
│           └── Real-time status updates
│
├── dashboard/
│   ├── page.tsx (Main dashboard for all roles)
│   │   ├── Admin: Shows stats + CTA to /admin/requests
│   │   ├── Hospital: Shows hospital stats
│   │   └── Donor: Shows available requests
│   ├── constants.ts (Navigation config - UPDATED)
│   ├── shared-components.tsx (StatusBadge, BloodBadge, etc.)
│   └── [other pages...]
│
├── hospital/
│   ├── layout.tsx (RoleGuard: hospital only)
│   ├── dashboard/
│   │   └── page.tsx (redirects to /dashboard)
│   └── my-requests/
│       └── page.tsx ⭐ UPDATED - Enhanced with refresh & status display
│           ├── Fetch hospital requests
│           ├── Display with status badges
│           ├── Refresh button for sync
│           └── Statistics
│
└── donor/
    ├── layout.tsx (RoleGuard: donor only)
    ├── dashboard/
    │   └── page.tsx (redirects to /dashboard)
    └── [other pages...]
```

## API Endpoint Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                                       │
└─────────────────────────────────────────────────────────────────────────────┘

ADMIN ENDPOINTS
├─ GET /api/requests
│  └─ Returns: All requests sorted by creation date
│
└─ PUT /api/requests/:id
   ├─ Body: {status: "approved" | "rejected"}
   ├─ Returns: Updated request
   └─ Side Effects: Deducts inventory if approved

HOSPITAL ENDPOINTS
├─ GET /api/hospital/requests
│  ├─ Query: ?userId=X&email=Y
│  └─ Returns: Hospital's requests filtered by location
│
└─ POST /api/hospital/requests
   ├─ Body: {blood_group, units, urgency, userId, email}
   └─ Returns: Created request with status: "pending"

DONOR ENDPOINTS
├─ GET /api/donor/available-requests
│  └─ Returns: Pending requests available for donors
│
└─ POST /api/donor/accept-request/:id
   ├─ Body: {email}
   ├─ Updates: Request status to "approved"
   └─ Side Effects: Deducts inventory

INVENTORY ENDPOINTS
├─ GET /api/inventory
│  └─ Returns: Current blood stock levels
│
└─ PUT /api/inventory/:blood_group
   ├─ Body: {units}
   └─ Returns: Updated inventory
```

## Status Transition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REQUEST STATUS TRANSITIONS                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   PENDING    │
                              │ (Initial)    │
                              └──────┬───────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
            ┌──────────────┐                  ┌──────────────┐
            │  APPROVED    │                  │  REJECTED    │
            │ (Final)      │                  │ (Final)      │
            │ Inventory    │                  │ No Inventory │
            │ Deducted     │                  │ Change       │
            └──────────────┘                  └──────────────┘

RULES:
• Only pending requests can be approved or rejected
• Approved and rejected are final states (no further changes)
• Approval deducts from inventory
• Rejection does not affect inventory
• If inventory insufficient, approval fails
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

REQUESTS TABLE
┌────────────────────────────────────────────────────────────────────────────┐
│ Column       │ Type        │ Constraints                                    │
├──────────────┼─────────────┼────────────────────────────────────────────────┤
│ id           │ SERIAL      │ PRIMARY KEY                                    │
│ blood_group  │ VARCHAR(5)  │ CHECK (IN blood types)                         │
│ units        │ INTEGER     │ CHECK (> 0)                                    │
│ location     │ VARCHAR(120)│ NOT NULL                                       │
│ donor_email  │ VARCHAR(255)│ NULLABLE                                       │
│ status       │ VARCHAR(20) │ DEFAULT 'pending', CHECK (IN statuses)         │
│ urgency      │ VARCHAR(20) │ DEFAULT 'normal', CHECK (IN urgencies)         │
│ created_at   │ TIMESTAMPTZ │ DEFAULT NOW()                                  │
└────────────────────────────────────────────────────────────────────────────┘

INVENTORY TABLE
┌────────────────────────────────────────────────────────────────────────────┐
│ Column      │ Type       │ Constraints                                      │
├─────────────┼────────────┼──────────────────────────────────────────────────┤
│ blood_group │ VARCHAR(5) │ PRIMARY KEY, CHECK (IN blood types)              │
│ units       │ INTEGER    │ DEFAULT 0, CHECK (>= 0)                          │
└────────────────────────────────────────────────────────────────────────────┘

USERS TABLE
┌────────────────────────────────────────────────────────────────────────────┐
│ Column      │ Type        │ Constraints                                     │
├─────────────┼─────────────┼─────────────────────────────────────────────────┤
│ id          │ SERIAL      │ PRIMARY KEY                                     │
│ name        │ VARCHAR(100)│ NOT NULL                                        │
│ email       │ VARCHAR(255)│ UNIQUE (case-insensitive)                       │
│ password    │ TEXT        │ NOT NULL (bcrypt hashed)                        │
│ role        │ VARCHAR(20) │ DEFAULT 'donor', CHECK (IN roles)               │
│ blood_group │ VARCHAR(5)  │ CHECK (IN blood types)                          │
│ location    │ VARCHAR(120)│ NOT NULL                                        │
│ created_at  │ TIMESTAMPTZ │ DEFAULT NOW()                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ⭐ = New or significantly updated
- ✓ = Approved
- ✗ = Rejected
- ⏳ = Pending
