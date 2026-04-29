# Donor Response Feature - Documentation

## ✅ Feature Status: IMPLEMENTED

The donor response feature has been successfully implemented, allowing donors to view and accept available blood donation requests.

## 📋 Requirements Met

✅ **Show list of available requests**
- New page at `/donor/available-requests`
- Displays all pending blood requests
- Shows blood type, units, location, urgency, and date

✅ **Add "Accept / Donate" button**
- Each request has an "Accept / Donate" button
- Button shows loading state during processing
- Disabled state prevents double-clicks

✅ **When clicked: Save in database**
- Saves donor email in `requests.donor_email` field
- Creates record in donor's history
- Transaction-based for data consistency

✅ **When clicked: Mark request as partially fulfilled**
- Updates request status from 'pending' to 'approved'
- Deducts units from blood inventory
- Removes request from available list

## 📁 Files Created/Modified

### New Files
```
app/donor/available-requests/page.tsx  (New - 250+ lines)
```

### Modified Files
```
app/dashboard/constants.ts  (Added navigation item)
```

### Existing Files (No Changes - Already Working)
```
server/routes/donor.js  (API endpoints already exist)
  - GET /api/donor/available-requests
  - POST /api/donor/accept-request/:id
```

## 🎯 Feature Details

### Available Requests Page (`/donor/available-requests`)

**URL:** `/donor/available-requests`  
**Access:** Donor role only (protected by RoleGuard)

**Features:**
- List of all pending blood requests
- Real-time data from database
- Fallback to seeded data if API unavailable
- Responsive design (mobile, tablet, desktop)
- Loading states
- Success/Error messages
- Auto-refresh after accepting request

### UI Components

1. **Header Section**
   - Page title: "Available Requests"
   - Description text
   - Counter showing number of available requests

2. **Request Cards**
   - Blood type with icon (large display)
   - Number of units needed
   - Hospital location with map pin icon
   - Request date and time
   - Urgency badge (color-coded)
   - Accept/Donate button

3. **Urgency Badges**
   - Critical: Red with 🚨 emoji
   - High/Urgent: Orange
   - Normal: Blue

4. **Action Button**
   - Text: "Accept / Donate"
   - Icon: Heart
   - Loading state: "Processing..."
   - Disabled during processing

5. **Messages**
   - Success: Green banner with checkmark
   - Error: Amber banner with alert icon
   - Info box: Blue box with important information

6. **Empty State**
   - Heart icon
   - "No requests available" message
   - Helpful text to check back later

## 🔄 Workflow

```
1. Donor logs in
   ↓
2. Navigates to "Available Requests" in sidebar
   ↓
3. Sees list of pending blood requests
   ↓
4. Reviews request details:
   - Blood type
   - Units needed
   - Hospital location
   - Urgency level
   ↓
5. Clicks "Accept / Donate" button
   ↓
6. Frontend sends POST to /api/donor/accept-request/:id
   - Includes donor email from localStorage
   ↓
7. Backend processes (in transaction):
   - Validates request is still pending
   - Checks inventory availability
   - Updates request status to 'approved'
   - Saves donor email in request
   - Deducts units from inventory
   ↓
8. Success response returned
   ↓
9. Frontend updates:
   - Shows success message
   - Removes request from list
   - Request now appears in donor's history
   ↓
10. Request marked as "partially fulfilled"
    - Status: 'approved'
    - Donor email saved
    - Inventory updated
```

## 🔌 API Endpoints

### GET /api/donor/available-requests

**Purpose:** Fetch all pending blood requests

**Request:**
```http
GET /api/donor/available-requests
```

**Response (Success - 200):**
```json
[
  {
    "id": 123,
    "blood_group": "O+",
    "units": 2,
    "location": "City Hospital",
    "status": "pending",
    "urgency": "critical",
    "created_at": "2026-04-27T10:30:00.000Z"
  }
]
```

**Response (Empty - 200):**
```json
[]
```

### POST /api/donor/accept-request/:id

**Purpose:** Accept a blood donation request

**Request:**
```http
POST /api/donor/accept-request/123
Content-Type: application/json

{
  "email": "donor@example.com"
}
```

**Response (Success - 200):**
```json
{
  "id": 123,
  "blood_group": "O+",
  "units": 2,
  "location": "City Hospital",
  "donor_email": "donor@example.com",
  "status": "approved",
  "urgency": "critical",
  "created_at": "2026-04-27T10:30:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "message": "Donor email is required"
}
```

**Response (Error - 404):**
```json
{
  "message": "Request not found"
}
```

**Response (Error - 400):**
```json
{
  "message": "Request is no longer available"
}
```

**Response (Error - 400):**
```json
{
  "message": "Insufficient inventory for O+"
}
```

## 💾 Database Changes

### Requests Table

**When donor accepts request:**

**Before:**
```sql
id | blood_group | units | location      | donor_email | status   | urgency  | created_at
123| O+          | 2     | City Hospital | NULL        | pending  | critical | 2026-04-27 10:30:00
```

**After:**
```sql
id | blood_group | units | location      | donor_email         | status   | urgency  | created_at
123| O+          | 2     | City Hospital | donor@example.com   | approved | critical | 2026-04-27 10:30:00
```

**Changes:**
1. `donor_email`: NULL → donor@example.com
2. `status`: pending → approved

### Inventory Table

**Before:**
```sql
blood_group | units
O+          | 50
```

**After:**
```sql
blood_group | units
O+          | 48
```

**Changes:**
1. `units`: 50 → 48 (deducted 2 units)

## 🔐 Security & Validation

### Frontend Validation
- Checks if user is logged in
- Retrieves donor email from localStorage
- Prevents double-clicks with disabled state
- Shows loading indicator during processing

### Backend Validation
1. **Email validation:**
   - Email is required
   - Must be provided in request body

2. **Request validation:**
   - Request must exist
   - Request must be in 'pending' status
   - Cannot accept already approved/rejected requests

3. **Inventory validation:**
   - Checks if sufficient inventory available
   - Prevents over-allocation
   - Returns error if insufficient stock

4. **Transaction safety:**
   - Uses database transactions
   - Rollback on any error
   - Ensures data consistency

### Authentication
- Protected by RoleGuard (donor only)
- Requires valid login session
- Uses localStorage for user credentials

## 📊 User Experience

### Success Flow
1. Donor views available requests
2. Clicks "Accept / Donate" button
3. Button shows loading spinner
4. Success message appears (green)
5. Request removed from list
6. Can view in "My History" page

### Error Flow
1. Donor clicks "Accept / Donate" button
2. Button shows loading spinner
3. Error message appears (amber/red)
4. Request remains in list
5. Donor can retry or choose different request

### Empty State
1. No requests available
2. Shows heart icon
3. Displays friendly message
4. Suggests checking back later

## 🎨 Visual Design

### Color Scheme
- **Primary:** Rose/Red (#DC2626)
- **Background:** Dark neutral (#171717)
- **Borders:** Neutral gray (#262626)
- **Success:** Emerald green (#10B981)
- **Error:** Amber (#F59E0B)
- **Critical:** Rose red (#F43F5E)
- **High:** Orange (#F97316)
- **Normal:** Blue (#3B82F6)

### Typography
- **Headings:** Black weight (900)
- **Body:** Bold weight (700)
- **Labels:** Uppercase, tracked, small
- **Buttons:** Black weight (900)

### Icons
- Droplet: Blood type
- MapPin: Location
- Clock: Date/time
- Heart: Accept/Donate action
- AlertCircle: Information/warnings
- CheckCircle: Success messages
- Loader2: Loading states

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Stacked request details
- Full-width buttons
- Shortened button text ("Accept")
- Touch-friendly targets

### Tablet (640px - 1024px)
- Two-column grid
- Optimized spacing
- Larger touch targets
- Full button text visible

### Desktop (> 1024px)
- Five-column grid layout
- Hover states on cards
- Full button text ("Accept / Donate")
- Optimal spacing and padding

## 🔗 Navigation

### Access Points
1. **Sidebar:** "Available Requests" menu item (donor role only)
2. **Direct URL:** `/donor/available-requests`

### Related Pages
- **My History:** `/donor/history` - View accepted requests
- **Dashboard:** `/dashboard` - Overview and stats
- **Profile:** `/dashboard/profile` - Donor profile

## ✨ Accessibility

- **Semantic HTML:** Proper structure
- **Labels:** Clear, descriptive text
- **Icons:** Visual enhancement (not relied upon)
- **Focus states:** Clear indicators
- **Error messages:** Descriptive text
- **Loading states:** Clear indication
- **Keyboard navigation:** Full support
- **Color contrast:** WCAG compliant

## 🧪 Testing

### Manual Testing Checklist
- [x] Page loads correctly
- [x] Requests display from API
- [x] Fallback to seeded data works
- [x] Accept button functional
- [x] Loading state displays
- [x] Success message shows
- [x] Error message shows
- [x] Request removed after accept
- [x] Donor email saved in database
- [x] Request status updated to 'approved'
- [x] Inventory deducted correctly
- [x] Transaction rollback on error
- [x] Empty state displays correctly
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop
- [x] Navigation item appears for donors
- [x] No TypeScript errors

### API Testing
- [x] GET endpoint returns pending requests
- [x] POST endpoint accepts request
- [x] Validation works (missing email)
- [x] Validation works (request not found)
- [x] Validation works (request not pending)
- [x] Validation works (insufficient inventory)
- [x] Transaction rollback works
- [x] Donor email saved correctly
- [x] Status updated correctly
- [x] Inventory deducted correctly

## 🚀 Usage Instructions

### For Donors

1. **Log in** as a donor user
2. **Navigate** to "Available Requests" in the sidebar
3. **Review** available blood donation requests
4. **Check** blood type, units, location, and urgency
5. **Click** "Accept / Donate" button on desired request
6. **Wait** for success message
7. **View** accepted request in "My History" page

### For Developers

**To modify the page:**
```typescript
// File: app/donor/available-requests/page.tsx

// Add new field to display
<div className="flex items-start gap-2">
  <Icon className="w-4 h-4 text-neutral-500" />
  <div>
    <p className="text-sm font-bold text-white">{request.newField}</p>
  </div>
</div>
```

**To modify API behavior:**
```javascript
// File: server/routes/donor.js

router.post("/accept-request/:id", async (req, res) => {
  // Add custom logic here
  // Example: Send notification email
  // Example: Update additional fields
});
```

## 📝 Integration with Existing Features

### With Approval System
1. Hospital creates request → Status: "pending"
2. Request appears in donor "Available Requests"
3. Donor accepts request → Status: "approved"
4. Request appears in admin approval queue as "approved"
5. Admin can see which donor accepted it

### With Donor History
1. Donor accepts request
2. Request saved with donor_email
3. Request appears in "My History" page
4. Shows as "approved" status

### With Inventory Management
1. Donor accepts request
2. Inventory automatically deducted
3. Admin can see updated inventory levels
4. Prevents over-allocation

## 🔄 Status Transitions

```
pending → approved (when donor accepts)
approved → (final state, no further changes by donor)
```

**Note:** The term "partially fulfilled" means the request status is changed to "approved" and the donor email is saved, indicating a donor has committed to fulfill the request.

## 📈 Future Enhancements

Potential improvements:
- Filter by blood type
- Filter by location/distance
- Sort by urgency
- Sort by date
- Notification system
- Confirmation dialog before accepting
- Donation scheduling
- Multiple donors per request
- Partial unit fulfillment
- Donor eligibility check
- Cooldown period tracking

## ✅ Summary

The donor response feature is **fully functional** and meets all requirements:

- ✅ Show list of available requests
- ✅ Add "Accept / Donate" button
- ✅ Save in database (donor_email field)
- ✅ Mark request as partially fulfilled (status: 'approved')
- ✅ Deduct from inventory
- ✅ Modern, responsive UI
- ✅ Comprehensive validation
- ✅ Error handling
- ✅ Success feedback
- ✅ Integration with existing features

**Status:** Production-ready!

---

**Implementation Date:** April 27, 2026  
**Status:** ✅ Fully Functional
