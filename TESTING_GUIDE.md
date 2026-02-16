# Back2u - Testing Guide

Comprehensive guide for testing all use cases and API endpoints.

## Testing Setup

### Prerequisites
- Postman, Insomnia, or similar API client (optional)
- Web browser (Chrome, Firefox, Safari)
- Node.js running on `localhost:5000`
- PostgreSQL database setup complete

### Base URL
- Local: `http://localhost:5000`
- API: `http://localhost:5000/api`

## Test Credentials

After running `node config/setupDatabase.js`, use these sample accounts:

### security Account
```
Email: djivani@conestogac.on.ca
Role: security
```

### Student Accounts
```
Email: student@conestogac.on.ca
Email: maya@conestogac.on.ca
Email: alex@conestogac.on.ca
Email: sarah@conestogac.on.ca
```

*Note: All sample passwords are hashed. Check `setupDatabase.js` for the plain text version.*

---

## UC01: User Registration Testing

### Test 1.1: Successful Registration
**Path:** `POST /api/auth/register`

**Request Body:**
```json
{
  "student_id": "S999",
  "email": "newuser@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Test",
  "campus": "Main",
  "program": "Computer Science",
  "password": "TestPass123!",
  "role": "student"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 7,
    "student_id": "S999",
    "email": "newuser@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Test",
    "campus": "Main",
    "program": "Computer Science",
    "is_verified": true,
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Test 1.2: Duplicate Email
**Path:** `POST /api/auth/register`

**Request Body:** (Use existing email)
```json
{
  "email": "student@conestogac.on.ca"
}
```

**Expected Response (400):**
```json
{
  "message": "Email already in use"
}
```

### Test 1.3: Invalid Password
**Path:** `POST /api/auth/register`

**Request Body:** (Password too weak)
```json
{
  "password": "weak"
}
```

**Expected Response (400):**
```json
{
  "message": "Password validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one number",
    "Password must contain at least one special character (!@#$%^&*)"
  ]
}
```

### Test 1.4: Invalid Email Domain
**Path:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "ValidPass123!"
}
```

**Expected Response (400):**
```json
{
  "message": "Please use your Conestoga email (@conestogac.on.ca)"
}
```

### UI Test 1.5: Registration Form
1. Navigate to `/register.html`
2. Fill in all fields
3. Watch password requirements update in real-time
4. Try submitting with weak password - should see validation error
5. Correct password and submit
6. Should redirect to dashboard

---

## UC02: User Login Testing

### Test 2.1: Successful Login
**Path:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "student@conestogac.on.ca",
  "password": "correctPassword123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 2,
    "student_id": "S002",
    "email": "student@conestogac.on.ca",
    "first_name": "Jeel",
    "last_name": "Patel",
    "campus": "Main",
    "program": "Web Development",
    "is_verified": true,
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Test 2.2: Invalid Email
**Path:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "nonexistent@conestogac.on.ca",
  "password": "somePassword123!"
}
```

**Expected Response (401):**
```json
{
  "message": "Incorrect email or password"
}
```

### Test 2.3: Invalid Password
**Path:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "student@conestogac.on.ca",
  "password": "wrongPassword123!"
}
```

**Expected Response (401):**
```json
{
  "message": "Incorrect email or password"
}
```

### UI Test 2.4: Login Form
1. Navigate to `/login.html`
2. Enter valid credentials
3. Click Login
4. Should redirect to dashboard
5. Token should be saved to localStorage

### Test 2.5: Get Current User
**Path:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Expected Response (200):**
```json
{
  "id": 2,
  "student_id": "S002",
  "email": "student@conestogac.on.ca",
  "first_name": "Jeel",
  "last_name": "Patel",
  "campus": "Main",
  "program": "Web Development",
  "is_verified": true,
  "role": "student"
}
```

---

## UC03: Report Lost Item Testing

### Test 3.1: Successful Lost Item Report
**Path:** `POST /api/items/lost`

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "iPhone 13 Pro"
category: "phone"
description: "Lost iPhone 13 Pro, space gray"
location_lost: "Library Building, Ground Floor"
campus: "Main"
date_lost: "2026-02-08"
distinguishing_features: "Small crack on corner"
image: [FILE]
```

**Expected Response (201):**
```json
{
  "message": "Lost item reported successfully",
  "item": {
    "id": 14,
    "title": "iPhone 13 Pro",
    "category": "phone",
    "description": "Lost iPhone 13 Pro, space gray",
    "location_found": "Library Building, Ground Floor",
    "campus": "Main",
    "type": "lost",
    "status": "Reported",
    "date_lost": "2026-02-08",
    "distinguishing_features": "Small crack on corner",
    "image_url": "/uploads/item-1707504000000.jpg",
    "user_id": 2,
    "created_at": "2026-02-10T12:00:00Z",
    "updated_at": "2026-02-10T12:00:00Z"
  }
}
```

### Test 3.2: Missing Required Fields
**Path:** `POST /api/items/lost`

**Request Body:** (Missing category)
```json
{
  "title": "iPhone",
  "location_lost": "Library",
  "campus": "Main",
  "date_lost": "2026-02-08"
}
```

**Expected Response (400):**
```json
{
  "message": "Missing required fields: title, category, location_lost, campus, date_lost"
}
```

### Test 3.3: Invalid Date Format
**Path:** `POST /api/items/lost`

**Request Body:** (Invalid date)
```json
{
  "title": "iPhone",
  "category": "phone",
  "location_lost": "Library",
  "campus": "Main",
  "date_lost": "02-02-2026"
}
```

**Expected Response (400):**
```json
{
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

### Test 3.4: File Too Large
**Path:** `POST /api/items/lost`

**Request Body:** (File > 5MB)

**Expected Response (400):**
```
Request entity too large
```

### Test 3.5: Invalid File Type
**Path:** `POST /api/items/lost`

**Request Body:** (PDF or other non-image file)

**Expected Response (400):**
```
Images only!
```

### Test 3.6: Unauthorized (No Token)
**Path:** `POST /api/items/lost`

**Expected Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

### UI Test 3.7: Report Lost Item Form
1. Login as student
2. Navigate to "Report Lost Item"
3. Fill in all required fields
4. Test image preview functionality
5. Submit form
6. Should see success message
7. Should redirect to dashboard

---

## UC04: View My Lost Items Testing

### Test 4.1: Get User's Lost Items
**Path:** `GET /api/items/lost/my-items`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 11,
      "title": "iPhone 13 Pro",
      "category": "phone",
      "type": "lost",
      "status": "Reported",
      "date_lost": "2026-02-08",
      "location_found": "Library Building",
      "campus": "Main",
      "user_id": 2,
      "created_at": "2026-02-10T10:00:00Z"
    },
    ...
  ]
}
```

### Test 4.2: No Items
**Path:** `GET /api/items/lost/my-items`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Test 4.3: Unauthorized
**Path:** `GET /api/items/lost/my-items` (No token)

**Expected Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

### UI Test 4.4: Dashboard
1. Login as student who reported items
2. Navigate to Dashboard
3. Should see stats (Total, Open, Claimed)
4. Should see list of lost items
5. Click "Edit" - should open edit form
6. Verify all item details display correctly

### UI Test 4.5: Empty Dashboard
1. Login as student with no items
2. Dashboard should show "No lost items reported"
3. Should show button to "Report New Lost Item"

---

## UC11: Update User Profile Testing

### Test 11.1: Update Basic Info
**Path:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Waterloo",
  "program": "Computer Science"
}
```

**Expected Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 2,
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Waterloo",
    "program": "Computer Science",
    ...
  }
}
```

### Test 11.2: Change Password
**Path:** `PUT /api/auth/profile`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Waterloo",
  "program": "Computer Science",
  "password": "oldPassword123!",
  "newPassword": "NewPassword123!@"
}
```

**Expected Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

### Test 11.3: Incorrect Current Password
**Path:** `PUT /api/auth/profile`

**Request Body:** (Wrong current password)
```json
{
  "password": "wrongPassword123!",
  "newPassword": "NewPassword123!@"
}
```

**Expected Response (401):**
```json
{
  "message": "Current password is incorrect"
}
```

### Test 11.4: Invalid New Password
**Path:** `PUT /api/auth/profile`

**Request Body:** (Password too weak)
```json
{
  "password": "oldPassword123!",
  "newPassword": "weak"
}
```

**Expected Response (400):**
```json
{
  "message": "Password validation failed",
  "errors": [...]
}
```

### Test 11.5: Password Mismatch
**Path:** `PUT /api/auth/profile`

**Request Body:** (New passwords don't match)
```json
{
  "newPassword": "NewPassword123!@",
  "newPassword": "DifferentPassword123!@"
}
```

**Expected Response (400):**
```json
{
  "message": "New passwords do not match"
}
```

### UI Test 11.6: Profile Page
1. Login and navigate to Profile
2. Verify current data is loaded
3. Update basic information
4. Click "Save Changes"
5. Should see success message
6. Refresh page - changes should persist

### UI Test 11.7: Change Password
1. On Profile page
2. Enter current password and new password
3. Watch password requirements update
4. Password fields are optional if left empty
5. Try submitting with weak password - should fail
6. Enter valid password and submit
7. Should see success message

---

## UC12: Logout Testing

### Test 12.1: Logout Endpoint
**Path:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

### UI Test 12.2: Logout Button
1. Login successfully
2. Click "Logout" button
3. Should redirect to home page
4. Token should be cleared from localStorage
5. JWT should no longer be valid

### UI Test 12.3: Protected Page Access After Logout
1. Logout
2. Try accessing `/dashboard.html` directly
3. Should redirect to `/login.html`

---

## UC13: Public Home Page Testing

### Test 13.1: Get Public Found Items
**Path:** `GET /api/items/public/found-items`

**Query Parameters:**
```
?limit=8&page=1
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 8,
  "total": 34,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

### Test 13.2: With Filters
**Path:** `GET /api/items/public/found-items?category=phone&campus=Main`

**Expected Response:** Only found items matching filters

### Test 13.3: Pagination
**Path:** `GET /api/items/public/found-items?page=2`

**Expected Response:** Items from page 2

### UI Test 13.4: Home Page
1. Navigate to `/index.html`
2. Should see recently found items
3. Click on item to view details
4. Try "Report Lost Item" button - should redirect to login
5. Try "Browse Found Items" button - should redirect to login
6. Login, then try buttons again - should work

### UI Test 13.5: Not Authenticated
1. Not logged in
2. Click item card
3. Should redirect to login
4. After login, should return to page

---

## Deferred Features Testing

### UC05: Register Found Item (Iteration 2+)
- Only accessible by security members
- Similar form to lost item but sets `type: 'found'` and initial `status: 'Open'`

### UC06: Search Found Items (Iteration 2+)
- Advanced search with keyword, category, location, date range
- Filters on found items only

### UC07: Submit Claim Request (Iteration 2+)
- Users can claim found items
- Submits detailed ownership proof

### UC08: Verify/Approve Claims (Iteration 2+)
- security can view pending claims
- Approve, reject, or request additional info
- Update item status accordingly

### UC09: Notifications (Iteration 2+)
- Email alerts on claim updates
- In-app notifications
- Requires Nodemailer setup

### UC10: Admin Dashboard (Iteration 2+)
- Statistics on items, claims, trends
- Campus heat map
- Item expiration management

---

## Performance Testing Checklist

- [ ] Page load times under 3 seconds
- [ ] Form submission under 2 seconds
- [ ] Image upload handles multiple files
- [ ] Pagination works smoothly
- [ ] Search filters respond quickly
- [ ] No console errors

## Security Testing Checklist

- [ ] JWT token validation
- [ ] Password hashing works
- [ ] Unauthorized access blocked
- [ ] Role-based access control
- [ ] File upload validation
- [ ] SQL injection prevented
- [ ] CORS properly configured
- [ ] Rate limiting (future)

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

---

## Troubleshooting Common Test Issues

### Token Expired
- Generate new token by logging in again
- Token expires after 7 days

### CORS Errors
- Ensure frontend and API are on same domain/port
- Check CORS headers in server setup

### File Upload Fails
- Check file size (max 5MB)
- Check file format (JPG, PNG, GIF only)
- Ensure uploads folder exists

### Database Errors
- Verify PostgreSQL is running
- Check .env credentials
- Run setupDatabase.js to reset

### Validation Errors
- Check required fields
- Verify date format (YYYY-MM-DD)
- Check password requirements

---

**Last Updated:** February 10, 2026
**Test Coverage:** 100% for Iteration 1 use cases
