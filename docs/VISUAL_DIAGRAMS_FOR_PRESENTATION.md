# Visual Diagrams for Presentation

## Diagram 1: System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         FRONTEND (Next.js + React)                 │    │
│  │                                                     │    │
│  │  • Login/Register Pages                            │    │
│  │  • Dashboard (Sidebar, Navbar)                     │    │
│  │  • Role-specific Pages                             │    │
│  │  • Forms, Tables, Charts                           │    │
│  │                                                     │    │
│  │  Running on: http://localhost:3000                 │    │
│  └────────────────────┬───────────────────────────────┘    │
└───────────────────────┼────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        │ (fetch API)
                        │ JSON Data
                        │
┌───────────────────────▼────────────────────────────────────┐
│              BACKEND SERVER (Express.js)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              API ROUTES                              │  │
│  │                                                       │  │
│  │  /api/auth/register    → Create account             │  │
│  │  /api/auth/login       → Login                      │  │
│  │  /api/hospital/requests → Create request            │  │
│  │  /api/requests/:id     → Approve/reject             │  │
│  │  /api/donor/accept-request → Accept request         │  │
│  │                                                       │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                    │
│  ┌───────────────────▼───────────────────────────────┐  │
│  │         BUSINESS LOGIC                             │  │
│  │                                                     │  │
│  │  • Validate input                                  │  │
│  │  • Check permissions                               │  │
│  │  • Hash passwords                                  │  │
│  │  • Execute transactions                            │  │
│  │                                                     │  │
│  └───────────────────┬───────────────────────────────┘  │
│                                                           │
│  Running on: http://localhost:5000                       │
└───────────────────────┼───────────────────────────────────┘
                        │
                        │ SQL Queries
                        │ (pg library)
                        │
┌───────────────────────▼────────────────────────────────────┐
│              DATABASE (PostgreSQL)                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   users     │  │  requests   │  │  inventory  │       │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤       │
│  │ id          │  │ id          │  │ blood_group │       │
│  │ name        │  │ blood_group │  │ units       │       │
│  │ email       │  │ units       │  └─────────────┘       │
│  │ password    │  │ location    │                         │
│  │ role        │  │ status      │                         │
│  │ blood_group │  │ urgency     │                         │
│  │ location    │  │ donor_email │                         │
│  └─────────────┘  └─────────────┘                         │
│                                                             │
│  Running on: localhost:5432                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Diagram 2: User Roles & Permissions

```
┌──────────────────────────────────────────────────────────────┐
│                      USER ROLES                               │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     DONOR       │      │    HOSPITAL     │      │     ADMIN       │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ Can:            │      │ Can:            │      │ Can:            │
│ • View approved │      │ • Create        │      │ • View ALL      │
│   requests      │      │   requests      │      │   requests      │
│ • Accept        │      │ • View own      │      │ • Approve       │
│   requests      │      │   requests      │      │   requests      │
│ • View history  │      │ • See status    │      │ • Reject        │
│ • Update        │      │ • Update        │      │   requests      │
│   profile       │      │   profile       │      │ • View stats    │
│                 │      │                 │      │ • Full access   │
│ Cannot:         │      │ Cannot:         │      │                 │
│ • Create        │      │ • Approve       │      │ Cannot:         │
│   requests      │      │   requests      │      │ • (Nothing -    │
│ • Approve       │      │ • See other     │      │   full access)  │
│   requests      │      │   hospitals     │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Diagram 3: Request Lifecycle (Status Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

Step 1: HOSPITAL CREATES REQUEST
┌──────────────────────────────────────┐
│  Hospital fills form:                 │
│  • Blood type: O+                     │
│  • Units: 2                           │
│  • Urgency: Critical                  │
└──────────────┬───────────────────────┘
               │
               ↓
        ┌─────────────┐
        │   STATUS:   │
        │  "pending"  │
        └─────────────┘
               │
               │ Visible to: Hospital, Admin
               │
               ↓

Step 2: ADMIN REVIEWS REQUEST
┌──────────────────────────────────────┐
│  Admin sees request and decides:      │
│  • Approve → Status: "approved"       │
│  • Reject  → Status: "rejected"       │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ↓             ↓
┌─────────────┐  ┌─────────────┐
│   STATUS:   │  │   STATUS:   │
│ "approved"  │  │ "rejected"  │
└─────────────┘  └─────────────┘
        │             │
        │             └─→ END (Request rejected)
        │
        │ Visible to: Hospital, Admin, Donor
        │ Inventory: Deducted
        │
        ↓

Step 3: DONOR ACCEPTS REQUEST
┌──────────────────────────────────────┐
│  Donor sees approved request          │
│  Clicks "Accept / Donate"             │
└──────────────┬───────────────────────┘
               │
               ↓
        ┌─────────────┐
        │   STATUS:   │
        │ "fulfilled" │
        └─────────────┘
               │
               │ Visible to: All roles
               │ Donor email: Saved
               │ Inventory: Already deducted
               │
               ↓
            ┌──────┐
            │ END  │
            └──────┘
```

---

## Diagram 4: Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

User fills form
    │
    ↓
┌─────────────────────────────────┐
│ Frontend validates:              │
│ • Email format                   │
│ • Password length                │
│ • All fields filled              │
└────────────┬────────────────────┘
             │
             ↓ POST /api/auth/register
┌─────────────────────────────────┐
│ Backend checks:                  │
│ • Email unique?                  │
│ • Valid blood group?             │
│ • Valid role?                    │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Hash password with bcrypt        │
│ (password → $2b$10$abc123...)    │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Save to database                 │
│ INSERT INTO users...             │
└────────────┬────────────────────┘
             │
             ↓
        ✅ Success!


┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

User enters email/password
    │
    ↓ POST /api/auth/login
┌─────────────────────────────────┐
│ Backend finds user by email      │
│ SELECT * FROM users              │
│ WHERE email = '...'              │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Compare passwords:               │
│ bcrypt.compare(                  │
│   entered_password,              │
│   stored_hash                    │
│ )                                │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ↓             ↓
  ✅ Match      ❌ No match
      │             │
      │             └─→ Error: "Invalid password"
      │
      ↓
┌─────────────────────────────────┐
│ Return user data:                │
│ { id, name, email, role }        │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Frontend stores in localStorage  │
│ localStorage.setItem("user", ..) │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Redirect to dashboard            │
│ /donor/dashboard                 │
│ /hospital/dashboard              │
│ /admin/dashboard                 │
└─────────────────────────────────┘
```

---

## Diagram 5: Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│         users            │
├──────────────────────────┤
│ id (PK)                  │
│ name                     │
│ email (UNIQUE)           │
│ password (HASHED)        │
│ role (donor/hospital/    │
│       admin)             │
│ blood_group              │
│ location                 │
│ phone                    │
│ hospital_name            │
│ created_at               │
└────────┬─────────────────┘
         │
         │ One hospital creates many requests
         │
         ↓
┌──────────────────────────┐
│       requests           │
├──────────────────────────┤
│ id (PK)                  │
│ blood_group              │
│ units                    │
│ location                 │
│ status (pending/         │
│         approved/        │
│         rejected/        │
│         fulfilled)       │
│ urgency (low/normal/     │
│          high/critical)  │
│ donor_email (FK)         │◄─────┐
│ created_at               │      │
└────────┬─────────────────┘      │
         │                         │
         │ Affects inventory       │ One donor fulfills one request
         │                         │
         ↓                         │
┌──────────────────────────┐      │
│       inventory          │      │
├──────────────────────────┤      │
│ blood_group (PK)         │      │
│ units                    │      │
└──────────────────────────┘      │
                                   │
┌──────────────────────────┐      │
│         users            │      │
│       (donor)            │──────┘
└──────────────────────────┘

Relationships:
• users (hospital) → requests (one-to-many)
• users (donor) → requests (one-to-many via donor_email)
• requests → inventory (affects units)
```

---

## Diagram 6: Complete Data Flow Example

```
┌─────────────────────────────────────────────────────────────┐
│         COMPLETE FLOW: Hospital → Admin → Donor             │
└─────────────────────────────────────────────────────────────┘

TIME: T0 - Hospital Creates Request
┌─────────────────────────────────────────────────────────────┐
│ Hospital: "We need 2 units of O+ blood urgently"            │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ POST /api/hospital/requests
┌─────────────────────────────────────────────────────────────┐
│ DATABASE STATE:                                              │
│                                                              │
│ requests table:                                              │
│ ┌────┬────────┬─────┬──────────┬─────────┬──────────┐      │
│ │ id │ blood  │units│ location │ status  │ urgency  │      │
│ ├────┼────────┼─────┼──────────┼─────────┼──────────┤      │
│ │123 │ O+     │ 2   │ City Hosp│ pending │ critical │      │
│ └────┴────────┴─────┴──────────┴─────────┴──────────┘      │
│                                                              │
│ inventory table:                                             │
│ ┌────────┬───────┐                                          │
│ │ blood  │ units │                                          │
│ ├────────┼───────┤                                          │
│ │ O+     │  50   │ ← No change yet                         │
│ └────────┴───────┘                                          │
└─────────────────────────────────────────────────────────────┘

TIME: T1 - Admin Approves Request
┌─────────────────────────────────────────────────────────────┐
│ Admin: "This request looks valid, approve it"                │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ PUT /api/requests/123 { status: "approved" }
┌─────────────────────────────────────────────────────────────┐
│ DATABASE STATE:                                              │
│                                                              │
│ requests table:                                              │
│ ┌────┬────────┬─────┬──────────┬─────────┬──────────┐      │
│ │ id │ blood  │units│ location │ status  │ urgency  │      │
│ ├────┼────────┼─────┼──────────┼─────────┼──────────┤      │
│ │123 │ O+     │ 2   │ City Hosp│approved │ critical │      │
│ └────┴────────┴─────┴──────────┴─────────┴──────────┘      │
│                                  ↑ Changed!                  │
│                                                              │
│ inventory table:                                             │
│ ┌────────┬───────┐                                          │
│ │ blood  │ units │                                          │
│ ├────────┼───────┤                                          │
│ │ O+     │  48   │ ← Deducted 2 units!                     │
│ └────────┴───────┘                                          │
└─────────────────────────────────────────────────────────────┘

TIME: T2 - Donor Accepts Request
┌─────────────────────────────────────────────────────────────┐
│ Donor: "I can donate O+ blood"                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ POST /api/donor/accept-request/123
┌─────────────────────────────────────────────────────────────┐
│ DATABASE STATE:                                              │
│                                                              │
│ requests table:                                              │
│ ┌────┬────────┬─────┬──────────┬──────────┬─────────────┐  │
│ │ id │ blood  │units│ location │ status   │ donor_email │  │
│ ├────┼────────┼─────┼──────────┼──────────┼─────────────┤  │
│ │123 │ O+     │ 2   │ City Hosp│fulfilled │donor@ex.com │  │
│ └────┴────────┴─────┴──────────┴──────────┴─────────────┘  │
│                                  ↑ Changed!  ↑ Added!       │
│                                                              │
│ inventory table:                                             │
│ ┌────────┬───────┐                                          │
│ │ blood  │ units │                                          │
│ ├────────┼───────┤                                          │
│ │ O+     │  48   │ ← No change (already deducted)          │
│ └────────┴───────┘                                          │
└─────────────────────────────────────────────────────────────┘

FINAL RESULT:
✅ Hospital sees: Request fulfilled
✅ Admin sees: Request fulfilled by donor@ex.com
✅ Donor sees: Request in history
✅ Inventory: 2 units deducted from O+
```

---

**Print these diagrams or have them ready on your screen during the viva!**
