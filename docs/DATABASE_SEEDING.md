# Database Seeding - Demo Data Documentation

## ✅ Status: IMPLEMENTED

The database seeding script has been updated with realistic demo data for testing and demonstration purposes.

## 📋 Requirements Met

✅ **5 donors with different blood groups**
- Rahul Mehta (O+)
- Priya Singh (A-)
- Arjun Nair (B+)
- Sneha Patel (AB+)
- Vikram Sharma (O-)

✅ **3 hospitals**
- City General Hospital (Dr. Meera Kapoor)
- Apollo Medical Center (Dr. Karthik Rao)
- Fortis Healthcare (Dr. Anjali Desai)

✅ **6 blood requests (mix of pending and approved)**
- 3 pending requests
- 3 approved requests

✅ **Link requests to hospitals**
- Each request has a hospital location
- Matches hospital names in users table

✅ **Link some donors to completed donations**
- 3 approved requests linked to specific donors
- donor_email field populated for approved requests

## 📁 File Modified

```
server/seed_demo.js  (Updated with new demo data)
```

## 🎯 Demo Data Details

### Users (9 total)

#### Donors (5)
```javascript
1. Rahul Mehta
   - Email: donor1@lifedrops.demo
   - Password: Demo@123
   - Blood Group: O+
   - Location: Mumbai
   - Phone: +91-9876543210

2. Priya Singh
   - Email: donor2@lifedrops.demo
   - Password: Demo@123
   - Blood Group: A-
   - Location: Delhi
   - Phone: +91-9876543211

3. Arjun Nair
   - Email: donor3@lifedrops.demo
   - Password: Demo@123
   - Blood Group: B+
   - Location: Bangalore
   - Phone: +91-9876543212

4. Sneha Patel
   - Email: donor4@lifedrops.demo
   - Password: Demo@123
   - Blood Group: AB+
   - Location: Pune
   - Phone: +91-9876543213

5. Vikram Sharma
   - Email: donor5@lifedrops.demo
   - Password: Demo@123
   - Blood Group: O-
   - Location: Chennai
   - Phone: +91-9876543214
```

#### Hospitals (3)
```javascript
1. City General Hospital
   - Contact: Dr. Meera Kapoor
   - Email: hospital1@lifedrops.demo
   - Password: Demo@123
   - Location: City General Hospital
   - Phone: +91-2212345678

2. Apollo Medical Center
   - Contact: Dr. Karthik Rao
   - Email: hospital2@lifedrops.demo
   - Password: Demo@123
   - Location: Apollo Medical Center
   - Phone: +91-4412345679

3. Fortis Healthcare
   - Contact: Dr. Anjali Desai
   - Email: hospital3@lifedrops.demo
   - Password: Demo@123
   - Location: Fortis Healthcare
   - Phone: +91-2012345680
```

#### Admin (1)
```javascript
System Admin
- Email: admin@lifedrops.demo
- Password: Admin@123
- Location: Pune
- Phone: +91-9999999999
```

### Blood Requests (6 total)

#### Pending Requests (3)
```javascript
1. Critical Request
   - Blood Group: O-
   - Units: 2
   - Hospital: City General Hospital
   - Status: pending
   - Urgency: critical
   - Created: 2026-04-27 09:30:00
   - Donor: None (awaiting acceptance)

2. High Priority Request
   - Blood Group: A+
   - Units: 1
   - Hospital: Apollo Medical Center
   - Status: pending
   - Urgency: high
   - Created: 2026-04-27 10:15:00
   - Donor: None (awaiting acceptance)

3. Normal Request
   - Blood Group: B+
   - Units: 3
   - Hospital: Fortis Healthcare
   - Status: pending
   - Urgency: normal
   - Created: 2026-04-27 11:00:00
   - Donor: None (awaiting acceptance)
```

#### Approved Requests (3)
```javascript
1. Completed Donation
   - Blood Group: O+
   - Units: 2
   - Hospital: City General Hospital
   - Status: approved
   - Urgency: high
   - Created: 2026-04-25 08:00:00
   - Donor: Rahul Mehta (donor1@lifedrops.demo)

2. Completed Donation
   - Blood Group: A-
   - Units: 1
   - Hospital: Apollo Medical Center
   - Status: approved
   - Urgency: normal
   - Created: 2026-04-24 14:30:00
   - Donor: Priya Singh (donor2@lifedrops.demo)

3. Completed Donation
   - Blood Group: AB+
   - Units: 1
   - Hospital: Fortis Healthcare
   - Status: approved
   - Urgency: normal
   - Created: 2026-04-23 16:45:00
   - Donor: Sneha Patel (donor4@lifedrops.demo)
```

### Blood Inventory (8 blood types)
```javascript
A+:  42 units
A-:  18 units
B+:  36 units
B-:  12 units
O+:  55 units
O-:  20 units
AB+: 16 units
AB-:  8 units
```

## 🚀 How to Run

### Method 1: Using Node.js
```bash
cd server
node seed_demo.js
```

### Method 2: Using npm script (if configured)
```bash
cd server
npm run seed
```

### Method 3: Reset and Seed
```bash
# First reset the database
psql -U your_username -d your_database -f reset_db.sql

# Then seed with demo data
node seed_demo.js
```

## 📊 Data Relationships

### Hospital → Requests
```
City General Hospital
  ├─ O- (2 units) - pending, critical
  └─ O+ (2 units) - approved, high → Rahul Mehta

Apollo Medical Center
  ├─ A+ (1 unit) - pending, high
  └─ A- (1 unit) - approved, normal → Priya Singh

Fortis Healthcare
  ├─ B+ (3 units) - pending, normal
  └─ AB+ (1 unit) - approved, normal → Sneha Patel
```

### Donors → Completed Donations
```
Rahul Mehta (O+)
  └─ Donated O+ (2 units) to City General Hospital

Priya Singh (A-)
  └─ Donated A- (1 unit) to Apollo Medical Center

Sneha Patel (AB+)
  └─ Donated AB+ (1 unit) to Fortis Healthcare

Arjun Nair (B+)
  └─ No donations yet (available for B+ requests)

Vikram Sharma (O-)
  └─ No donations yet (available for O- critical request)
```

## 🔐 Login Credentials

### For Testing

**Donor Accounts:**
- Email: `donor1@lifedrops.demo` to `donor5@lifedrops.demo`
- Password: `Demo@123`

**Hospital Accounts:**
- Email: `hospital1@lifedrops.demo` to `hospital3@lifedrops.demo`
- Password: `Demo@123`

**Admin Account:**
- Email: `admin@lifedrops.demo`
- Password: `Admin@123`

## 🎯 Testing Scenarios

### Scenario 1: Admin Approval Workflow
1. Login as admin (`admin@lifedrops.demo`)
2. Navigate to "Approve Requests"
3. See 3 pending requests
4. Approve or reject requests
5. See 3 already approved requests

### Scenario 2: Hospital Request Management
1. Login as hospital (`hospital1@lifedrops.demo`)
2. Navigate to "Our Requests"
3. See requests from City General Hospital
4. Create new request
5. Wait for admin approval

### Scenario 3: Donor Response
1. Login as donor (`donor5@lifedrops.demo` - Vikram, O-)
2. Navigate to "Available Requests"
3. See O- critical request (perfect match!)
4. Accept the request
5. Check "My History" for completed donation

### Scenario 4: Donor History
1. Login as donor (`donor1@lifedrops.demo` - Rahul)
2. Navigate to "My History"
3. See completed O+ donation to City General Hospital

### Scenario 5: Profile Management
1. Login as any user
2. Navigate to "My Profile"
3. Click "Edit Profile"
4. Update name, phone, location
5. Save changes

## 📈 Data Distribution

### Blood Groups Coverage
- O+ : 1 donor (Rahul)
- A- : 1 donor (Priya)
- B+ : 1 donor (Arjun)
- AB+: 1 donor (Sneha)
- O- : 1 donor (Vikram)

### Request Status Distribution
- Pending: 3 requests (50%)
- Approved: 3 requests (50%)
- Rejected: 0 requests (0%)

### Urgency Distribution
- Critical: 1 request (17%)
- High: 2 requests (33%)
- Normal: 3 requests (50%)

### Hospital Distribution
- City General Hospital: 2 requests
- Apollo Medical Center: 2 requests
- Fortis Healthcare: 2 requests

## 🔄 Seeding Logic

### Idempotent Seeding
The seed script is designed to be idempotent:
- Uses `WHERE NOT EXISTS` to prevent duplicates
- Safe to run multiple times
- Won't create duplicate users or requests

### Password Hashing
- All passwords are hashed using bcrypt
- Salt rounds: 10
- Secure storage in database

### Timestamps
- Uses realistic timestamps
- Pending requests: Recent (today)
- Approved requests: Past few days
- Chronological order maintained

## 🛠️ Customization

### Adding More Donors
```javascript
{
  name: "New Donor Name",
  email: "donor6@lifedrops.demo",
  password: "Demo@123",
  role: "donor",
  phone: "+91-9876543215",
  hospital_name: null,
  blood_group: "A+",
  location: "Kolkata",
}
```

### Adding More Hospitals
```javascript
{
  name: "Dr. New Doctor",
  email: "hospital4@lifedrops.demo",
  password: "Demo@123",
  role: "hospital",
  phone: "+91-3312345681",
  hospital_name: "New Hospital Name",
  blood_group: "O+",
  location: "New Hospital Name",
}
```

### Adding More Requests
```javascript
{
  blood_group: "A+",
  units: 2,
  location: "Hospital Name",
  donor_email: null, // or "donor@email.com" for approved
  status: "pending", // or "approved"
  urgency: "normal", // or "high", "critical"
  created_at: "2026-04-27T12:00:00Z",
}
```

## 📝 Database Schema

### Users Table
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
email           VARCHAR(255) NOT NULL UNIQUE
password        TEXT NOT NULL
role            VARCHAR(20) CHECK (donor, hospital, admin)
phone           VARCHAR(30)
hospital_name   VARCHAR(150)
blood_group     VARCHAR(5) CHECK (A+, A-, B+, B-, O+, O-, AB+, AB-)
location        VARCHAR(120) NOT NULL
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### Requests Table
```sql
id              SERIAL PRIMARY KEY
blood_group     VARCHAR(5) NOT NULL
units           INTEGER NOT NULL CHECK (> 0)
location        VARCHAR(120) NOT NULL
donor_email     VARCHAR(255)
status          VARCHAR(20) CHECK (pending, approved, rejected)
urgency         VARCHAR(20) CHECK (low, normal, high, critical)
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### Inventory Table
```sql
blood_group     VARCHAR(5) PRIMARY KEY
units           INTEGER NOT NULL CHECK (>= 0)
```

## ✅ Verification

After seeding, verify the data:

```sql
-- Check users
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Expected: donor: 5, hospital: 3, admin: 1

-- Check requests
SELECT status, COUNT(*) FROM requests GROUP BY status;
-- Expected: pending: 3, approved: 3

-- Check approved requests with donors
SELECT blood_group, location, donor_email 
FROM requests 
WHERE status = 'approved';
-- Expected: 3 rows with donor emails

-- Check inventory
SELECT * FROM inventory ORDER BY blood_group;
-- Expected: 8 rows with units > 0
```

## 🎨 Realistic Data Features

### Indian Context
- Indian names (Rahul, Priya, Arjun, etc.)
- Indian phone numbers (+91 prefix)
- Indian cities (Mumbai, Delhi, Bangalore, etc.)
- Common hospital names in India

### Realistic Scenarios
- Critical O- request (universal donor, urgent)
- Mix of urgency levels
- Recent timestamps
- Completed donations in history
- Available donors for pending requests

### Data Consistency
- Hospital locations match request locations
- Donor blood groups match approved request blood groups
- Phone numbers follow Indian format
- Email addresses use demo domain

## 🚀 Production Considerations

### Before Production
1. **Remove demo data** - Don't use in production
2. **Change passwords** - Use strong, unique passwords
3. **Update email domain** - Use real email addresses
4. **Adjust inventory** - Set realistic stock levels
5. **Remove test accounts** - Create real user accounts

### Security Notes
- Demo passwords are intentionally simple
- All passwords are hashed with bcrypt
- Email addresses use `.demo` domain
- Phone numbers are fictional

## ✅ Summary

The database seeding script provides:
- ✅ 5 donors with different blood groups
- ✅ 3 hospitals with realistic names
- ✅ 6 blood requests (3 pending, 3 approved)
- ✅ Requests linked to hospitals
- ✅ Donors linked to completed donations
- ✅ Realistic Indian context
- ✅ Idempotent seeding
- ✅ Ready for testing and demos

**Status:** Production-ready for demo/testing purposes!

---

**Last Updated:** April 27, 2026  
**Status:** ✅ Fully Functional
