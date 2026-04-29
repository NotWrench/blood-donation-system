# Quick Setup Guide - After Donor Accept Fix

## 🚀 Quick Start (3 Steps)

### Step 1: Update Database Schema
```bash
cd server
psql -U postgres -d blood_donation -f reset_db.sql
```

This will:
- Drop and recreate all tables
- Add the new `donations` table
- Update `requests` table to support 'fulfilled' status
- Initialize inventory with 0 units for all blood types

### Step 2: Seed Demo Data
```bash
node seed_demo.js
```

This will create:
- 5 donors (including rahul@example.com)
- 3 hospitals (including cityhospital@example.com)
- 1 admin (admin@lifedrops.com)
- 6 blood requests (3 pending, 3 approved)
- Inventory with blood units

### Step 3: Start the Application
```bash
# Terminal 1: Start Backend
node index.js

# Terminal 2: Start Frontend (from project root)
cd ..
npm run dev
```

---

## ✅ Test the Fix

### Test Flow:
1. **Open**: http://localhost:3000
2. **Login as Admin**: admin@lifedrops.com / admin123
3. **Approve Request**: Go to "Request Queue" → Click "Approve" on a pending request
4. **Logout**: Click profile → Logout
5. **Login as Donor**: rahul@example.com / password123
6. **Accept Request**: Go to "Available Requests" → Click "Accept / Donate"
7. **Verify Success**: Should see green success message
8. **Check History**: Go to "History" → Should see your donation

### Expected Results:
- ✅ Success message: "Donation Successful! Thank you for saving lives."
- ✅ Request disappears from Available Requests
- ✅ Donation appears in History
- ✅ Request status changes to "fulfilled" (visible to admin/hospital)
- ✅ Inventory is deducted

---

## 🔧 If You Have Existing Database

If you already have data you want to keep, use the migration script instead:

```bash
cd server
psql -U postgres -d blood_donation -f migrate_add_donations.sql
```

This will:
- Update the status constraint without dropping data
- Create the donations table
- Migrate existing fulfilled requests to donations table
- Keep all your existing users and requests

---

## 🧪 Test Error Scenarios

### Test 1: Already Fulfilled Request
1. Accept a request as donor
2. Try to accept the same request again (if you can find it)
3. **Expected**: "This request is not available for donation..."

### Test 2: Insufficient Inventory
1. As admin, approve a request for 100 units
2. As donor, try to accept it
3. **Expected**: "Insufficient inventory for [blood type]. Available: X units, Required: 100 units"

### Test 3: Not Logged In
1. Clear browser localStorage (F12 → Application → Local Storage → Clear)
2. Try to accept a request
3. **Expected**: "Please log in to accept requests"

---

## 📊 Verify Database Changes

Check if everything is set up correctly:

```bash
psql -U postgres -d blood_donation
```

Then run:

```sql
-- Check if donations table exists
\dt donations

-- Check requests status constraint
\d requests

-- Count donations
SELECT COUNT(*) FROM donations;

-- View recent donations
SELECT * FROM donations ORDER BY donated_at DESC LIMIT 5;
```

---

## 🎯 Quick Troubleshooting

### Issue: "relation 'donations' does not exist"
**Solution**: Run `reset_db.sql` or `migrate_add_donations.sql`

### Issue: "new row for relation 'requests' violates check constraint"
**Solution**: The status constraint wasn't updated. Run migration script.

### Issue: Backend shows "Connection Error"
**Solution**: 
1. Check if PostgreSQL is running
2. Verify database credentials in `server/db.js`
3. Ensure database `blood_donation` exists

### Issue: "Request not found"
**Solution**: 
1. Make sure you seeded the database
2. Check if requests exist: `SELECT * FROM requests;`
3. Verify request ID is correct

---

## 📝 Test Users (After Seeding)

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Donor    | rahul@example.com            | password123 |
| Donor    | priya@example.com            | password123 |
| Hospital | cityhospital@example.com     | password123 |
| Hospital | metrocare@example.com        | password123 |
| Admin    | admin@lifedrops.com          | admin123    |

---

## ✅ Success Indicators

After setup, you should see:

**Backend Console**:
```
Server running on port 5000
Database connected successfully
```

**Frontend**:
```
Ready on http://localhost:3000
```

**Database**:
```sql
-- Should return 8 rows
SELECT * FROM inventory;

-- Should return users
SELECT COUNT(*) FROM users;

-- Should return requests
SELECT COUNT(*) FROM requests;
```

---

## 🎉 You're All Set!

The donor "Accept / Donate" functionality is now fully working with:
- ✅ Proper database schema
- ✅ Donation tracking
- ✅ Meaningful error messages
- ✅ Transaction safety
- ✅ Complete data flow

**Happy testing!** 🚀
