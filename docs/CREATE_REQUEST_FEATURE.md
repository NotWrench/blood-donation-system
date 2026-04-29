# Create Blood Request Feature - Documentation

## ✅ Feature Status: ALREADY IMPLEMENTED

The create blood request feature is **fully functional** and already exists in the codebase.

## 📍 Location

**Frontend:** `app/hospital/post-request/page.tsx`  
**Backend:** `server/routes/hospital.js` (POST endpoint)  
**URL:** `/hospital/post-request`

## 🎯 Requirements Met

✅ **Form with required fields:**
- Blood group (dropdown: A+, A-, B+, B-, O+, O-, AB+, AB-)
- Units (number input, minimum 1)
- Urgency (dropdown: normal, high, critical)

✅ **Save to database:**
- POST to `/api/hospital/requests`
- Saves to `requests` table
- Includes hospital location from user profile

✅ **Show in hospital "Our Requests":**
- Displays in `/hospital/my-requests` page
- Fetches via GET `/api/hospital/requests`
- Filtered by hospital location

✅ **Default status = pending:**
- Status automatically set to "pending" on creation
- Defined in backend: `status: 'pending'`

## 🎨 UI Features

### Form Design
- **Modern card layout** with rounded corners and shadows
- **Icon-enhanced inputs** for better UX
- **Responsive design** (mobile, tablet, desktop)
- **Loading states** during submission
- **Success/Error messages** with visual feedback

### Form Fields

1. **Blood Type Needed**
   - Dropdown with all 8 blood types
   - Icon: Droplet
   - Default: O+

2. **Units**
   - Number input
   - Minimum: 1
   - Icon: Syringe
   - Default: 1

3. **Urgency**
   - Dropdown with 3 levels
   - Options: Normal, High, Critical
   - Icon: Clock
   - Default: Normal

### Submit Button
- Full-width button
- Loading spinner during submission
- Disabled state while processing
- Success feedback on completion

## 🔄 Workflow

```
1. Hospital user navigates to /hospital/post-request
   ↓
2. Fills out form:
   - Selects blood type
   - Enters number of units
   - Selects urgency level
   ↓
3. Clicks "Post Request" button
   ↓
4. Frontend sends POST to /api/hospital/requests
   - Includes: blood_group, units, urgency
   - Includes: userId, email (from localStorage)
   ↓
5. Backend processes request:
   - Resolves hospital location from user profile
   - Validates input (blood_group, units)
   - Normalizes urgency level
   - Inserts into database with status: 'pending'
   ↓
6. Success response returned
   ↓
7. Form shows success message
   ↓
8. Form resets to default values
   ↓
9. Request appears in /hospital/my-requests
```

## 🔌 API Endpoint

### POST /api/hospital/requests

**Request Body:**
```json
{
  "blood_group": "O+",
  "units": 2,
  "urgency": "critical",
  "userId": 123,
  "email": "hospital@example.com"
}
```

**Response (Success - 201):**
```json
{
  "id": 456,
  "blood_group": "O+",
  "units": 2,
  "location": "City Hospital",
  "status": "pending",
  "urgency": "critical",
  "created_at": "2026-04-27T10:30:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "message": "Hospital profile location not found"
}
```

**Response (Error - 400):**
```json
{
  "message": "Missing required fields"
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid units"
}
```

## 💾 Database

### Table: requests

**Insert Query:**
```sql
INSERT INTO requests (blood_group, units, location, status, urgency)
VALUES ($1, $2, $3, 'pending', $4)
RETURNING id, blood_group, units, location, status, urgency, created_at
```

**Fields:**
- `blood_group`: VARCHAR(5) - Blood type (A+, A-, B+, B-, O+, O-, AB+, AB-)
- `units`: INTEGER - Number of units needed (must be > 0)
- `location`: VARCHAR(120) - Hospital location (auto-resolved from user profile)
- `status`: VARCHAR(20) - Always 'pending' on creation
- `urgency`: VARCHAR(20) - normal, high, or critical
- `created_at`: TIMESTAMPTZ - Auto-generated timestamp

## 🔐 Security & Validation

### Frontend Validation
- Blood group: Must be one of 8 valid types
- Units: Minimum value of 1
- Urgency: Must be normal, high, or critical

### Backend Validation
- **Hospital location resolution:**
  - First tries to resolve by userId
  - Falls back to email if userId not found
  - Returns error if location cannot be resolved
  
- **Required fields check:**
  - blood_group must be present
  - units must be present
  
- **Units validation:**
  - Must be a finite number
  - Must be greater than 0
  
- **Urgency normalization:**
  - Accepts: low, normal, high, critical
  - Defaults to "normal" if invalid value provided
  - Case-insensitive

### Authentication
- Requires hospital user to be logged in
- Uses localStorage to get user credentials
- Protected by RoleGuard component

## 📊 User Experience

### Success Flow
1. User fills out form
2. Clicks "Post Request"
3. Button shows loading spinner
4. Success message appears (green)
5. Form resets to defaults
6. User can create another request or navigate to "Our Requests"

### Error Flow
1. User fills out form
2. Clicks "Post Request"
3. Button shows loading spinner
4. Error message appears (red)
5. Form remains filled (user can retry)
6. User can correct and resubmit

## 🎨 Visual Design

### Color Scheme
- **Primary:** Rose/Red (#DC2626)
- **Background:** Dark neutral (#171717)
- **Borders:** Neutral gray (#262626)
- **Success:** Emerald green (#10B981)
- **Error:** Rose red (#F43F5E)

### Typography
- **Headings:** Black weight (900)
- **Labels:** Uppercase, tracked, small
- **Inputs:** Bold weight (700)
- **Buttons:** Black weight (900)

### Spacing
- **Card padding:** 3rem (desktop), 2rem (mobile)
- **Input padding:** 1rem vertical, 3.5rem left (for icon)
- **Form gaps:** 2rem between sections

## 🔗 Navigation

### Access Points
1. **Sidebar:** "Post Request" menu item (hospital role only)
2. **Dashboard CTA:** "Create Request" button (hospital role)
3. **Direct URL:** `/hospital/post-request`

### After Creation
- User can navigate to "Our Requests" to see the new request
- Request appears with "Pending" status
- Request includes all submitted details

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Full-width inputs
- Stacked form fields
- Touch-friendly buttons

### Tablet (640px - 1024px)
- Two-column grid for units/urgency
- Optimized spacing
- Larger touch targets

### Desktop (> 1024px)
- Centered card (max-width: 42rem)
- Two-column grid for units/urgency
- Hover states on inputs

## ✨ Accessibility

- **Semantic HTML:** Proper form elements
- **Labels:** Clear, descriptive labels for all inputs
- **Icons:** Visual enhancement (not relied upon for meaning)
- **Focus states:** Clear focus indicators
- **Error messages:** Descriptive error text
- **Loading states:** Clear indication of processing
- **Keyboard navigation:** Full keyboard support

## 🧪 Testing

### Manual Testing Checklist
- [x] Form loads correctly
- [x] All blood types selectable
- [x] Units input accepts numbers
- [x] Units input rejects negative numbers
- [x] Urgency dropdown works
- [x] Submit button shows loading state
- [x] Success message displays
- [x] Error message displays
- [x] Form resets after success
- [x] Request appears in "Our Requests"
- [x] Request has "pending" status
- [x] Hospital location auto-resolved
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop

### API Testing
- [x] POST endpoint responds correctly
- [x] Validation works (missing fields)
- [x] Validation works (invalid units)
- [x] Hospital location resolution works
- [x] Database insert successful
- [x] Returns created request object
- [x] Status defaults to "pending"

## 🚀 Usage Instructions

### For Hospital Users

1. **Log in** as a hospital user
2. **Navigate** to "Post Request" in the sidebar
3. **Select** blood type from dropdown
4. **Enter** number of units needed
5. **Select** urgency level
6. **Click** "Post Request" button
7. **Wait** for success message
8. **Navigate** to "Our Requests" to see the new request

### For Developers

**To modify the form:**
```typescript
// File: app/hospital/post-request/page.tsx

// Add new field to formData state
const [formData, setFormData] = React.useState({
  blood_group: "O+",
  units: 1,
  urgency: "normal",
  // Add new field here
});

// Add new input field in JSX
<input
  name="newField"
  value={formData.newField}
  onChange={handleChange}
  // ... other props
/>
```

**To modify backend validation:**
```javascript
// File: server/routes/hospital.js

router.post("/requests", async (req, res) => {
  // Add validation here
  const { blood_group, units, urgency, newField } = req.body;
  
  // Validate newField
  if (!newField) {
    return res.status(400).json({ message: "Missing newField" });
  }
  
  // ... rest of the code
});
```

## 📝 Notes

- **Hospital location** is automatically resolved from the user's profile
- **Status** is always set to "pending" on creation (cannot be changed by hospital)
- **Urgency** is normalized to lowercase in backend
- **Form resets** after successful submission
- **Seeded data** is used as fallback if database is unavailable

## 🔄 Integration with Approval System

This feature integrates seamlessly with the approval system:

1. Hospital creates request → Status: "pending"
2. Request appears in admin approval queue
3. Admin approves/rejects request
4. Status updates in hospital "Our Requests" view
5. Hospital can see approval status

## ✅ Summary

The create blood request feature is **fully functional** and meets all requirements:

- ✅ Form with blood group, units, urgency
- ✅ Saves to database
- ✅ Shows in hospital "Our Requests"
- ✅ Default status = pending
- ✅ Modern, responsive UI
- ✅ Comprehensive validation
- ✅ Error handling
- ✅ Success feedback
- ✅ Integration with approval system

**No changes needed** - the feature is production-ready!

---

**Last Verified:** April 27, 2026  
**Status:** ✅ Fully Functional
