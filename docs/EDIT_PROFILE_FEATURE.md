# Edit Profile Feature - Documentation

## ✅ Feature Status: ALREADY IMPLEMENTED

The edit profile functionality is **fully functional** and already exists in the codebase for all roles (admin, donor, hospital).

## 📋 Requirements Met

✅ **Add "Edit Profile" button**
- Button located in top-right of profile page
- Toggles between "Edit Profile" and "Cancel" states
- Clean, minimal design

✅ **Allow updating name, phone, location**
- Name: Text input (all roles)
- Phone: Text input (all roles)
- Location: Text input (all roles)
- Blood Group: Dropdown (donor only)
- Hospital Name: Text input (hospital only)

✅ **Save changes to database**
- PUT to `/user/update` endpoint
- Updates users table
- Transaction-safe
- Validation included

✅ **Show updated data immediately**
- UI updates instantly after save
- localStorage updated with new data
- Success message displayed
- No page refresh needed

✅ **Keep UI minimal**
- Clean card design
- Simple edit/cancel toggle
- Inline editing
- Minimal buttons

## 📁 Files Involved

### Frontend
```
app/donor/profile/page.tsx       (Main implementation - 300+ lines)
app/admin/profile/page.tsx       (Redirects to donor profile)
app/hospital/profile/page.tsx    (Redirects to donor profile)
app/dashboard/profile/page.tsx   (Redirects to donor profile)
```

### Backend
```
server/routes/users.js           (API endpoints)
  - GET /api/user/profile        (Fetch profile)
  - PUT /user/update             (Update profile)
```

### Database
```
users table                      (Stores profile data)
```

## 🎯 Feature Details

### Profile Page (`/donor/profile`, `/admin/profile`, `/hospital/profile`)

**Access:** All roles (protected by RoleGuard)

**Features:**
- View profile information
- Edit profile button (top-right)
- Inline editing mode
- Save changes button
- Cancel editing
- Success/Error messages
- Loading states
- Role-specific fields

### UI Components

1. **Header Section**
   - Page title: "My Profile"
   - Edit Profile button (top-right)
   - Description text

2. **Profile Card**
   - Full Name (editable)
   - Email (read-only)
   - Phone (editable)
   - Location (editable)
   - Blood Group (editable - donor only)
   - Hospital Name (editable - hospital only)
   - Role badge (read-only)

3. **Edit Profile Button**
   - Icon: PencilLine
   - Text: "Edit Profile" / "Cancel"
   - Toggles edit mode
   - Clears messages on toggle

4. **Save Changes Button**
   - Only visible in edit mode
   - Icon: CheckCircle
   - Loading spinner during save
   - Disabled during save

5. **Messages**
   - Success: Green banner with checkmark
   - Error: Red banner with error text

### Field Types

**Editable Fields:**
- Name: Text input
- Phone: Text input
- Location: Text input
- Blood Group: Dropdown (donor only)
- Hospital Name: Text input (hospital only)

**Read-Only Fields:**
- Email: Cannot be changed
- Role: Cannot be changed

## 🔄 Workflow

```
1. User navigates to profile page
   ↓
2. Profile data fetched from API
   ↓
3. Data displayed in read-only mode
   ↓
4. User clicks "Edit Profile" button
   ↓
5. Fields become editable
   ↓
6. User modifies fields
   ↓
7. User clicks "Save Changes" button
   ↓
8. Frontend sends PUT to /user/update
   - Includes: id, email, role, name, phone, location
   - Includes: blood_group (donor) or hospital_name (hospital)
   ↓
9. Backend processes update:
   - Validates user exists
   - Validates blood group (if provided)
   - Updates only provided fields
   - Returns updated user object
   ↓
10. Success response returned
   ↓
11. Frontend updates:
    - Shows success message
    - Updates profile state
    - Updates localStorage
    - Exits edit mode
    - Displays new data
```

## 🔌 API Endpoints

### GET /api/user/profile

**Purpose:** Fetch user profile data

**Request:**
```http
GET /api/user/profile?id=123
GET /api/user/profile?email=user@example.com
```

**Response (Success - 200):**
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "donor",
  "blood_group": "O+",
  "location": "Mumbai",
  "phone": "+91 9876543210",
  "hospital_name": null,
  "created_at": "2026-04-27T10:30:00.000Z"
}
```

**Response (Error - 404):**
```json
{
  "message": "User not found"
}
```

### PUT /user/update

**Purpose:** Update user profile

**Request:**
```http
PUT /user/update
Content-Type: application/json

{
  "id": 123,
  "email": "john@example.com",
  "role": "donor",
  "name": "John Doe Updated",
  "phone": "+91 9876543210",
  "location": "Delhi",
  "blood_group": "A+"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "name": "John Doe Updated",
    "email": "john@example.com",
    "role": "donor",
    "blood_group": "A+",
    "location": "Delhi",
    "phone": "+91 9876543210",
    "hospital_name": null,
    "created_at": "2026-04-27T10:30:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid blood group"
}
```

**Response (Error - 404):**
```json
{
  "message": "User not found"
}
```

## 💾 Database

### Users Table

**Update Query:**
```sql
UPDATE users
SET name = $1, phone = $2, location = $3, blood_group = $4
WHERE id = $5
RETURNING id, name, email, role, blood_group, location, phone, hospital_name, created_at
```

**Before:**
```sql
id | name      | email           | phone          | location | blood_group
123| John Doe  | john@example.com| +91 9876543210 | Mumbai   | O+
```

**After:**
```sql
id | name              | email           | phone          | location | blood_group
123| John Doe Updated  | john@example.com| +91 9876543210 | Delhi    | A+
```

## 🔐 Security & Validation

### Frontend Validation
- All fields are optional (can be empty)
- Blood group dropdown (donor only)
- Hospital name text input (hospital only)
- Email cannot be changed
- Role cannot be changed

### Backend Validation
1. **User identification:**
   - Requires id or email
   - User must exist in database

2. **Blood group validation:**
   - Must be one of: A+, A-, B+, B-, O+, O-, AB+, AB-
   - Only validated for donor role

3. **Field updates:**
   - Only updates provided fields
   - Trims whitespace from strings
   - Validates at least one field is provided

4. **Role-specific fields:**
   - blood_group: Only for donor role
   - hospital_name: Only for hospital role

### Authentication
- Protected by RoleGuard
- Requires valid login session
- Uses localStorage for user credentials

## 📊 User Experience

### View Mode (Default)
1. Profile data displayed in cards
2. All fields read-only
3. "Edit Profile" button visible
4. Clean, minimal design

### Edit Mode
1. Click "Edit Profile" button
2. Fields become editable
3. Button changes to "Cancel"
4. "Save Changes" button appears
5. Can modify fields
6. Can cancel to revert changes

### Save Flow
1. Modify fields
2. Click "Save Changes"
3. Button shows loading spinner
4. Success message appears
5. Fields return to read-only
6. New data displayed

### Cancel Flow
1. Click "Cancel" button
2. Fields return to read-only
3. Changes discarded
4. Original data restored

## 🎨 Visual Design

### Color Scheme
- **Primary:** Rose/Red (#DC2626)
- **Background:** Dark neutral (#171717)
- **Cards:** Neutral gray (#262626)
- **Borders:** Neutral gray (#404040)
- **Success:** Emerald green (#10B981)
- **Error:** Rose red (#F43F5E)

### Typography
- **Headings:** Black weight (900)
- **Labels:** Uppercase, tracked, small
- **Values:** Bold weight (700)
- **Buttons:** Black weight (900)

### Icons
- User: Full name
- Mail: Email
- Phone: Phone number
- MapPin: Location
- Droplet: Blood group
- Building2: Hospital name
- ShieldCheck: Role badge
- PencilLine: Edit button
- CheckCircle: Save button
- Loader2: Loading state

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Stacked fields
- Full-width buttons
- Touch-friendly targets

### Tablet (640px - 1024px)
- Two-column grid
- Optimized spacing
- Larger touch targets

### Desktop (> 1024px)
- Two-column grid layout
- Max-width container (4xl)
- Hover states
- Optimal spacing

## 🔗 Navigation

### Access Points
1. **Sidebar:** "My Profile" menu item (all roles)
2. **Direct URLs:**
   - `/donor/profile` (donor)
   - `/admin/profile` (admin)
   - `/hospital/profile` (hospital)
   - `/dashboard/profile` (all roles)

### Related Pages
- **Dashboard:** Overview and stats
- **Settings:** (if exists)

## ✨ Accessibility

- **Semantic HTML:** Proper form elements
- **Labels:** Clear, descriptive labels
- **Icons:** Visual enhancement
- **Focus states:** Clear indicators
- **Error messages:** Descriptive text
- **Loading states:** Clear indication
- **Keyboard navigation:** Full support
- **Disabled states:** Clear visual feedback

## 🧪 Testing

### Manual Testing Checklist
- [x] Profile page loads correctly
- [x] Profile data fetched from API
- [x] Edit button toggles edit mode
- [x] Fields become editable
- [x] Can modify name
- [x] Can modify phone
- [x] Can modify location
- [x] Can modify blood group (donor)
- [x] Can modify hospital name (hospital)
- [x] Email is read-only
- [x] Role is read-only
- [x] Save button works
- [x] Loading state displays
- [x] Success message shows
- [x] Error message shows
- [x] Data updates in UI
- [x] localStorage updated
- [x] Cancel button works
- [x] Changes discarded on cancel
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop
- [x] No TypeScript errors

### API Testing
- [x] GET endpoint returns profile
- [x] PUT endpoint updates profile
- [x] Validation works (blood group)
- [x] Validation works (missing fields)
- [x] User not found handled
- [x] Only provided fields updated
- [x] Role-specific fields work

## 🚀 Usage Instructions

### For All Users

1. **Log in** to your account
2. **Navigate** to "My Profile" in the sidebar
3. **View** your profile information
4. **Click** "Edit Profile" button (top-right)
5. **Modify** desired fields:
   - Name
   - Phone
   - Location
   - Blood Group (donor only)
   - Hospital Name (hospital only)
6. **Click** "Save Changes" button
7. **Wait** for success message
8. **View** updated information

### For Developers

**To add new editable field:**
```typescript
// File: app/donor/profile/page.tsx

// 1. Add to formData state
const [formData, setFormData] = React.useState({
  name: "",
  phone: "",
  location: "",
  newField: "", // Add here
});

// 2. Add EditableField component
<EditableField
  icon={IconName}
  label="New Field"
  name="newField"
  value={formData.newField}
  onChange={handleChange}
  disabled={!isEditing}
/>

// 3. Update backend payload
const payload = {
  // ... existing fields
  newField: formData.newField,
};
```

**To modify backend validation:**
```javascript
// File: server/routes/users.js

router.put("/update", async (req, res) => {
  // Add validation here
  const { newField } = req.body;
  
  if (newField && !isValidNewField(newField)) {
    return res.status(400).json({ message: "Invalid newField" });
  }
  
  // Add to updates
  if (typeof newField === "string") {
    values.push(newField.trim());
    updates.push(`new_field = $${values.length}`);
  }
});
```

## 📝 Role-Specific Behavior

### Donor
- Can edit: name, phone, location, blood_group
- Cannot edit: email, role
- Blood group: Dropdown with 8 options

### Hospital
- Can edit: name, phone, location, hospital_name
- Cannot edit: email, role, blood_group
- Hospital name: Text input

### Admin
- Can edit: name, phone, location
- Cannot edit: email, role, blood_group, hospital_name
- Same UI as donor/hospital

## 🔄 Integration with Existing Features

### With Authentication
- Uses localStorage for user credentials
- Updates localStorage after save
- Maintains session consistency

### With Dashboard
- Profile link in sidebar
- Accessible from all role dashboards
- Consistent navigation

### With Registration
- Profile created during registration
- Initial data from registration form
- Can be updated anytime

## ✅ Summary

The edit profile feature is **fully functional** and meets all requirements:

- ✅ Edit Profile button (top-right)
- ✅ Update name, phone, location
- ✅ Save changes to database
- ✅ Show updated data immediately
- ✅ Minimal, clean UI
- ✅ Role-specific fields
- ✅ Validation and error handling
- ✅ Success feedback
- ✅ Responsive design
- ✅ Works for all roles

**Status:** Production-ready!

---

**Last Verified:** April 27, 2026  
**Status:** ✅ Fully Functional
