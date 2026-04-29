# Request Approval System - Quick Start Guide

## For Admins

### Accessing the Approval Queue
1. Log in as an admin user
2. Navigate to the Dashboard
3. Click the "Approve / Reject Requests" button in the CTA card, OR
4. Use the sidebar navigation: **Approve Requests** (under admin menu)

### Approving a Request
1. Find the request in the queue
2. Review the details:
   - Blood type and units needed
   - Hospital location
   - Urgency level
   - Request timestamp
3. Click the **Approve** button (green checkmark)
4. The request status updates immediately
5. Inventory is automatically deducted

### Rejecting a Request
1. Find the request in the queue
2. Review the details to understand why it should be rejected
3. Click the **Reject** button (red X)
4. The request status updates immediately
5. No inventory is deducted

### Filtering & Searching
- **Status Filter:** Click buttons to filter by "all", "pending", "approved", or "rejected"
- **Search:** Use the search bar to find requests by:
  - Hospital location
  - Blood type (e.g., "O+", "A-")

### Understanding Request Priority
- **Critical:** Red badge - highest priority, needs immediate attention
- **High/Urgent:** Orange badge - should be processed soon
- **Normal:** Blue badge - standard priority
- **Low:** Gray badge - can be processed when convenient

## For Hospitals

### Viewing Your Requests
1. Log in as a hospital user
2. Navigate to Dashboard → **Our Requests** (sidebar)
3. See all requests submitted by your hospital

### Understanding Request Status
- **Pending (Amber):** Request is awaiting admin approval
  - Pulsing indicator shows it's active
  - Admin is reviewing it
- **Approved (Green):** Request has been approved
  - Blood units have been allocated
  - Donors can now fulfill this request
- **Rejected (Red):** Request has been rejected
  - Resubmit with different parameters if needed

### Refreshing Status
1. Click the **Refresh** button in the top right
2. The page syncs with the latest admin decisions
3. Status badges update to reflect current state

### Creating New Requests
1. Click **Post Request** in the sidebar
2. Fill in the form:
   - Blood type needed
   - Number of units
   - Urgency level
3. Submit the request
4. Request appears in "Our Requests" with "Pending" status
5. Wait for admin approval

## For Donors

### Viewing Available Requests
1. Log in as a donor user
2. Navigate to Dashboard
3. See available requests in the "Recent Activity" section
4. Only **pending** requests are available for donors to fulfill

### Understanding Request Status
- **Pending:** Available for you to accept
- **Approved:** Already fulfilled by another donor
- **Rejected:** Not needed at this time

### Accepting a Request
1. Find a pending request matching your blood type
2. Click "Donate / Accept Request" button
3. The request status changes to "approved"
4. Inventory is deducted
5. Your donation history is updated

## System Architecture

### Data Flow
```
Hospital Creates Request
    ↓
Request appears as "Pending" in Admin Queue
    ↓
Admin Reviews & Approves/Rejects
    ↓
Status Updates in Hospital View
    ↓
Approved Requests Available to Donors
    ↓
Donor Accepts Request
    ↓
Inventory Deducted
```

### Status Transitions
```
pending ──→ approved (inventory deducted)
pending ──→ rejected (no inventory change)
approved ──→ (final state)
rejected ──→ (final state)
```

## API Endpoints

### For Admins
- `GET /api/requests` - Fetch all requests
- `PUT /api/requests/:id` - Update request status

### For Hospitals
- `GET /api/hospital/requests` - Fetch hospital's requests
- `POST /api/hospital/requests` - Create new request

### For Donors
- `GET /api/donor/available-requests` - Fetch pending requests
- `POST /api/donor/accept-request/:id` - Accept a request

## Troubleshooting

### "Connection Error" Message
**Problem:** Can't connect to the database
**Solution:**
1. Ensure the backend server is running on `http://localhost:5000`
2. Check database connection in server logs
3. Click "Retry Sync" button to try again

### Request Status Not Updating
**Problem:** Status change doesn't appear immediately
**Solution:**
1. Click the "Refresh" button (for hospitals)
2. Reload the page (F5)
3. Check browser console for errors

### Insufficient Inventory Error
**Problem:** Can't approve request due to low stock
**Solution:**
1. Check current inventory levels in "Blood Stock" page
2. Restock blood units if needed
3. Try approving again

### Request Not Found
**Problem:** Request disappears from queue
**Solution:**
1. The request may have been processed by another admin
2. Refresh the page to see current state
3. Check the "Rejected" filter to see if it was rejected

## Best Practices

### For Admins
1. **Review Urgency:** Prioritize critical and high-urgency requests
2. **Check Inventory:** Verify stock before approving
3. **Batch Process:** Review similar requests together
4. **Document Rejections:** Note reasons for rejections if system supports it

### For Hospitals
1. **Submit Early:** Submit requests as soon as blood is needed
2. **Accurate Details:** Provide correct blood type and unit count
3. **Monitor Status:** Check "Our Requests" regularly
4. **Resubmit if Rejected:** Adjust parameters and resubmit if needed

### For Donors
1. **Check Regularly:** Look for new requests matching your blood type
2. **Respond Quickly:** Accept critical requests immediately
3. **Track History:** Monitor your donation history
4. **Update Profile:** Keep your blood type current

## Performance Tips

- **Admins:** Use filters to reduce queue size (e.g., show only "pending")
- **Hospitals:** Refresh only when expecting updates
- **Donors:** Check dashboard during peak hours for more requests

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify database connectivity
4. Contact system administrator if problems persist
