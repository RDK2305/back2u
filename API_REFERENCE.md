# Back2u - API Reference

Quick reference for all API endpoints.

## Base URL
`http://localhost:5000/api`

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

# Authentication Endpoints

## Register User
```
POST /auth/register
```
**Public** | No auth required

**Request:**
```json
{
  "student_id": "S001",
  "email": "user@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Computer Science",
  "password": "SecurePass123!",
  "role": "student"
}
```

**Response:** 201 Created
```json
{
  "message": "User registered successfully",
  "user": {...},
  "token": "eyJhbGc..."
}
```

---

## Login User
```
POST /auth/login
```
**Public** | No auth required

**Request:**
```json
{
  "email": "user@conestogac.on.ca",
  "password": "SecurePass123!"
}
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGc..."
}
```

---

## Get Current User
```
GET /auth/me
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "id": 1,
  "student_id": "S001",
  "email": "user@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Computer Science",
  "is_verified": true,
  "role": "student"
}
```

---

## Update User Profile
```
PUT /auth/profile
```
**Private** | Requires authentication

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "campus": "Waterloo",
  "program": "Web Development",
  "password": "oldPassword123!",
  "newPassword": "newPassword123!"
}
```

**Response:** 200 OK
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

## Logout User
```
POST /auth/logout
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "message": "Logout successful"
}
```

---

# Item Endpoints

## Get All Items
```
GET /items
```
**Public** | No auth required

**Query Parameters:**
- `type` - "lost" or "found"
- `category` - phone, wallet, keys, id, clothing, bag, textbook, electronics, other
- `campus` - Main, Waterloo, Cambridge, Doon
- `status` - Reported, Open, Claimed, Returned, Disposed
- `search` - Search keyword
- `limit` - Results per page (default: 20)
- `page` - Page number (default: 1)

**Response:** 200 OK
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

---

## Get Single Item
```
GET /items/:id
```
**Public** | No auth required

**Response:** 200 OK
```json
{
  "id": 1,
  "title": "iPhone 13 Pro",
  "category": "phone",
  "description": "...",
  "type": "lost",
  "status": "Reported",
  "date_lost": "2026-02-08",
  "user_id": 2,
  "first_name": "John",
  "last_name": "Doe",
  "user_email": "john@conestogac.on.ca"
}
```

---

## Report Lost Item
```
POST /items/lost
```
**Private** | Requires authentication

**Request:** multipart/form-data
```
title: "iPhone 13 Pro"
category: "phone"
description: "Lost near library"
location_lost: "Library Building"
campus: "Main"
date_lost: "2026-02-08"
distinguishing_features: "Cracked screen"
image: [FILE] (optional)
```

**Response:** 201 Created
```json
{
  "message": "Lost item reported successfully",
  "item": {...}
}
```

---

## Report Found Item
```
POST /items/found
```
**Private** | Requires authentication

**Request:** multipart/form-data
```
title: "iPhone 13 Pro"
category: "phone"
description: "Found near library"
location_found: "Library Building"
campus: "Main"
distinguishing_features: "Cracked screen"
image: [FILE] (optional)
```

**Response:** 201 Created
```json
{
  "message": "Found item registered successfully",
  "item": {...}
}
```

---

## Get User's Lost Items
```
GET /items/lost/my-items
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## Get User's Found Items
```
GET /items/found/my-items
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

---

## Get Public Found Items
```
GET /items/public/found-items
```
**Public** | No auth required

**Query Parameters:**
- `category` - Filter by category
- `campus` - Filter by campus
- `limit` - Results per page
- `page` - Page number

**Response:** 200 OK
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

---

## Update Item
```
PUT /items/:id
```
**Private** | Requires authentication (owner only)

**Request:**
```json
{
  "title": "iPhone 13 Pro",
  "category": "phone",
  "description": "Updated description",
  "location_found": "New location",
  "campus": "Waterloo"
}
```

**Response:** 200 OK
```json
{
  "message": "Item updated successfully",
  "item": {...}
}
```

---

## Update Item Status
```
PUT /items/:id/status
```
**Private** | security only

**Request:**
```json
{
  "status": "Claimed"
}
```

**Response:** 200 OK
```json
{
  "message": "Item status updated successfully",
  "item": {...}
}
```

---

## Delete Item
```
DELETE /items/:id
```
**Private** | security only

**Response:** 200 OK
```json
{
  "message": "Item deleted successfully"
}
```

---

# Claim Endpoints

## Submit Claim
```
POST /claims
```
**Private** | Requires authentication

**Request:**
```json
{
  "item_id": 1
}
```

**Response:** 201 Created
```json
{
  "message": "Claim submitted successfully",
  "claim": {...}
}
```

---

## Get Claim Details
```
GET /claims/:id
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "id": 1,
  "item_id": 1,
  "claimer_id": 2,
  "owner_id": 3,
  "status": "pending",
  "verification_notes": null,
  "item_title": "iPhone 13 Pro",
  "claimer_first": "John",
  "claimer_last": "Doe"
}
```

---

## Get User's Claims
```
GET /claims/user/my-claims
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

---

## Get Item's Claims
```
GET /items/:id/claims
```
**Private** | Requires authentication

**Response:** 200 OK
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## Update Claim
```
PUT /claims/:id
```
**Private** | Requires authentication (claimer or admin)

**Request:**
```json
{
  "status": "verified",
  "verification_notes": "User verified ownership"
}
```

**Response:** 200 OK
```json
{
  "message": "Claim updated successfully",
  "claim": {...}
}
```

---

## Verify Claim (security)
```
PUT /claims/:id/verify
```
**Private** | security only

**Request:**
```json
{
  "status": "verified",
  "verification_notes": "In-person verification completed"
}
```

**Response:** 200 OK
```json
{
  "message": "Claim verification updated successfully",
  "claim": {...}
}
```

---

## Delete/Cancel Claim
```
DELETE /claims/:id
```
**Private** | Requires authentication (claimer or admin)

**Response:** 200 OK
```json
{
  "message": "Claim deleted successfully"
}
```

---

# Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

# Error Response Format

```json
{
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

---

# Categories

- `phone` - Mobile phones
- `wallet` - Wallets and purses
- `keys` - Keys and keychains
- `id` - Student/security ID cards
- `clothing` - Clothing items
- `bag` - Backpacks and bags
- `textbook` - Textbooks and books
- `electronics` - Other electronics
- `other` - Other items

---

# Campuses

- `Main` - Main Campus (Kitchener)
- `Waterloo` - Waterloo Campus
- `Cambridge` - Cambridge Campus
- `Doon` - Doon Campus

---

# Status Values

**Items:**
- `Reported` - Lost item just reported
- `Open` - Found item waiting for claim
- `Claimed` - Item has been claimed
- `Returned` - Item returned to owner
- `Disposed` - Item disposed after expiry

**Claims:**
- `pending` - Claim awaiting verification
- `verified` - Claim approved
- `rejected` - Claim rejected
- `completed` - Claim finalized

---

# User Roles

- `student` - Regular student user
- `security` - Campus security member

---

# Example Requests

## Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "S001",
    "email": "user@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "password": "SecurePass123!",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@conestogac.on.ca",
    "password": "SecurePass123!"
  }'

# Get items with filters
curl http://localhost:5000/api/items?type=found&campus=Main&limit=10

# Report lost item (with file)
curl -X POST http://localhost:5000/api/items/lost \
  -H "Authorization: Bearer token..." \
  -F "title=iPhone 13 Pro" \
  -F "category=phone" \
  -F "date_lost=2026-02-08" \
  -F "location_lost=Library" \
  -F "campus=Main" \
  -F "image=@/path/to/image.jpg"
```

---

**API Version:** 1.0.0
**Last Updated:** February 10, 2026
