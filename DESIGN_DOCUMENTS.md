# CampusFind - Design Documentation

## Overview
CampusFind is a campus-wide Lost & Found Management System designed to help students at Conestoga College quickly locate and return lost items within the campus community.

---

## 1. USER FLOW DIAGRAMS - 7 Major Use Cases

### Use Case 1: User Registration & Email Verification
```
START
  ↓
Enter Registration Form
  ↓
Validate Email Domain (.on.ca)
  ├─ Invalid → Show Error → Return to Form
  ├─ Valid & Not Verified Email → Send OTP
  └─ Valid & Verified Email → Auto-verified
  ↓
Enter OTP / Auto-approved
  ↓
Create User Account
  ↓
Hash Password & Store in DB
  ↓
Redirect to Profile Completion
  ↓
Complete Profile (Campus, Program)
  ↓
SUCCESS - Account Created
  ↓
END
```

### Use Case 2: User Login & Authentication
```
START
  ↓
Enter Email & Password
  ├─ Email Not Found → Show Error
  └─ Email Found → Verify Password
      ├─ Password Incorrect → Show Error
      └─ Password Correct
         ├─ User Verified → Generate JWT Token → Redirect to Dashboard
         └─ User Not Verified → Remind to Verify Email
  ↓
SUCCESS - User Authenticated
  ↓
END
```

### Use Case 3: Report Lost Item
```
START
  ↓
Click "Report Lost Item"
  ↓
Fill Form:
- Item Title
- Category (Wallet, Phone, Keys, etc.)
- Description
- Location Lost (Building/Floor)
- Date Lost
- Distinguishing Features
- Upload Image (Optional)
  ↓
Validate Required Fields
  ├─ Missing Fields → Show Error
  └─ All Fields Valid
     ↓
     Upload Image to Server
     ├─ Size > 5MB → Show Error
     └─ Size Valid → Store Image
        ↓
        Create Item Record in DB
        Status: "Reported"
        ↓
        SUCCESS - Item Listed
        ↓
        END
```

### Use Case 4: Report Found Item
```
START
  ↓
Click "Report Found Item"
  ↓
Fill Form:
- Item Title
- Category
- Description
- Location Found (Building/Floor)
- Date Found
- Distinguishing Features
- Upload Image (Required)
  ↓
Validate All Fields (Image Required)
  ├─ Empty Fields or No Image → Show Error
  └─ All Fields Valid & Image Present
     ↓
     Upload Image to Server
     ├─ Virus Scan (Security)
     └─ Process Image
        ↓
        Create Item Record in DB
        Status: "Open"
        ↓
        Send Notification to Matching Lost Items
        ↓
        SUCCESS - Item Published
        ↓
        END
```

### Use Case 5: Browse & Search Items
```
START
  ↓
View Browse Page
  ↓
Apply Filters:
- Item Type (Lost/Found)
- Category (Multi-select)
- Campus
- Status
- Search Keywords
  ↓
Submit Search
  ↓
Query Database with Filters
  ├─ No Results → Show "No items found"
  └─ Results Found
     ↓
     Display Items in Grid/List
     - Pagination (20 items/page)
     - Sorting Options (Recent, Popular)
     ↓
     User Clicks Item Details
     ↓
     Show Full Item Information
     - Images
     - Description
     - Features
     - Reporter Info
     - Claim Button
     ↓
     END
```

### Use Case 6: Submit Item Claim
```
START
  ↓
View Item Details
  ├─ Not Logged In → Prompt Login
  └─ Logged In
     ↓
     Click "Claim This Item"
     ↓
     Verification Questions:
     - "Describe 3 unique features"
     - "When did you lose/find it?"
     - "Any identifying marks?"
     ↓
     Validate Answers (Against Item Details)
     ├─ Insufficient Match → Warn User
     └─ Reasonable Match
        ↓
        Create Claim Record
        Status: "pending"
        ↓
        Notify Item Reporter
        ↓
        Claim Response Options:
        ├─ Approve Claim
        ├─ Request More Info
        ├─ Ask Follow-up Questions
        └─ Reject Claim
           ↓
           Update Claim Status
           ↓
           Notify Claimer
           ↓
           SUCCESS - Claim Processed
           ↓
           END
```

### Use Case 7: Manage Claims & Complete Transaction
```
START
  ↓
User Goes to "My Claims" Dashboard
  ↓
View Both:
- Claims I Submitted (As Claimer)
- Claims On My Items (As Reporter)
  ↓
Filter & Sort:
- By Status (pending, verified, rejected, completed)
- By Date
- By Item Type
  ↓
For Each Claim:
├─ If Reporter:
│  ├─ Ask Verification Questions
│  ├─ Review Claimer Answers
│  ├─ Approve/Reject/Request More Info
│  └─ Schedule Handoff
│
└─ If Claimer:
   ├─ View Status
   ├─ Respond to Questions
   ├─ View Message History
   └─ Confirm Receipt After Handoff
  ↓
Mark Claim as "completed"
  ↓
Request Feedback
- Rate Interaction
- Add Comments
  ↓
Item Status Changes to "Returned"
  ↓
SUCCESS - Transaction Complete
  ↓
END
```

---

## 2. STORYBOARD DIAGRAMS - 7 Major Use Cases

### Storyboard 1: User Registration & Email Verification

```
Screen 1: Registration Form
┌─────────────────────────────────┐
│ CampusFind - Register            │
├─────────────────────────────────┤
│ Student ID: [____________]       │
│ Email: [____________]            │
│ First Name: [____________]       │
│ Last Name: [____________]        │
│ Campus: [Dropdown] ▼             │
│ Program: [____________]          │
│ Password: [____________]         │
│ Confirm: [____________]          │
│ [Register] [Cancel]              │
└─────────────────────────────────┘
         ↓
Screen 2: Email Verification Required
┌─────────────────────────────────┐
│ Verify Your Email                │
├─────────────────────────────────┤
│ Check your email for OTP         │
│ Enter OTP: [______] [Resend]     │
│                                  │
│ [Verify] [Back]                  │
└─────────────────────────────────┘
         ↓
Screen 3: Profile Completion
┌─────────────────────────────────┐
│ Complete Your Profile            │
├─────────────────────────────────┤
│ Campus: Main Campus              │
│ Program: Mobile Dev              │
│ Phone: [____________] (Optional) │
│ Profile Photo: [Upload]          │
│ [Complete] [Skip]                │
└─────────────────────────────────┘
         ↓
Screen 4: Success Screen
┌─────────────────────────────────┐
│ ✓ Account Created Successfully!  │
├─────────────────────────────────┤
│ Welcome to CampusFind            │
│ Ready to search for lost items?  │
│ [Go to Dashboard]                │
└─────────────────────────────────┘
```

### Storyboard 2: User Login & Authentication

```
Screen 1: Login Form
┌─────────────────────────────────┐
│ CampusFind - Login               │
├─────────────────────────────────┤
│ Email: [____________]            │
│ Password: [____________]         │
│ [Remember Me] ☐                  │
│                                  │
│ [Login] [Register]               │
│ [Forgot Password?]               │
└─────────────────────────────────┘
         ↓
Screen 2: Dashboard
┌─────────────────────────────────┐
│ Welcome, John Doe!               │
├─────────────────────────────────┤
│ [Report Lost] [Report Found]     │
│ [My Claims] [My Items]           │
│                                  │
│ Recent Activity:                 │
│ • 2 new matches for your items   │
│ • 1 item claimed                 │
│ [See All]                        │
└─────────────────────────────────┘
```

### Storyboard 3: Report Lost Item

```
Screen 1: Report Form
┌─────────────────────────────────┐
│ Report Lost Item                 │
├─────────────────────────────────┤
│ Item Title: [____________]       │
│ Category: [Wallet ▼]             │
│ Description: [____________]      │
│ Location Lost: [Building A]      │
│ Date Lost: [Mar 01, 2026]        │
│ Features: [____________]         │
│ [Choose Image]                   │
│ [Submit] [Cancel]                │
└─────────────────────────────────┘
         ↓
Screen 2: Confirmation
┌─────────────────────────────────┐
│ ✓ Item Listed Successfully       │
├─────────────────────────────────┤
│ Item: Blue Leather Wallet        │
│ Your item is now searchable      │
│ We'll notify you of matches      │
│ [Continue] [View Item]           │
└─────────────────────────────────┘
```

### Storyboard 4: Report Found Item

```
Screen 1: Found Item Form
┌─────────────────────────────────┐
│ Report Found Item                │
├─────────────────────────────────┤
│ Item Title: [____________]       │
│ Category: [Keys ▼]               │
│ Description: [____________]      │
│ Location Found: [________]       │
│ Date Found: [Mar 01, 2026]       │
│ Features: [Keychain attached]    │
│ [Upload Image] ⬆ (Required)      │
│ [Submit] [Cancel]                │
└─────────────────────────────────┘
         ↓
Screen 2: Image Upload
┌─────────────────────────────────┐
│ Upload Item Photo                │
├─────────────────────────────────┤
│ [Drag & Drop or Click]           │
│ ========[████████] 65%           │
│ Processing...                    │
│ [Cancel]                         │
└─────────────────────────────────┘
         ↓
Screen 3: Published
┌─────────────────────────────────┐
│ ✓ Found Item Published!          │
├─────────────────────────────────┤
│ Item: Silver House Keys          │
│ Visible to all students          │
│ Potential Matches: 2 (notified)  │
│ [View Item] [Report Another]     │
└─────────────────────────────────┘
```

### Storyboard 5: Browse & Search Items

```
Screen 1: Browse Page
┌─────────────────────────────────┐
│ Browse Items                     │
├─────────────────────────────────┤
│ Type: [Lost ▼] [Found ▼]         │
│ Category: [Multi-select ▼]       │
│ Campus: [Main Campus ▼]          │
│ Status: [All ▼]                  │
│ Search: [____________] [🔍 Search]
│ [Clear Filters]                  │
└─────────────────────────────────┘
         ↓
Screen 2: Results Grid
┌──────────────┬──────────────┐
│ Blue Wallet  │  Silver Keys │
│ [IMG]        │  [IMG]       │
│ Found at A207│ Lost Mar 01  │
│ 2 claims     │ 1 claim      │
│ [Details]    │ [Details]    │
└──────────────┴──────────────┘
Pagination: < 1 2 3 >
         ↓
Screen 3: Item Details
┌─────────────────────────────────┐
│ Blue Leather Wallet             │
├─────────────────────────────────┤
│ [Large Image]                   │
│ Category: Wallet                │
│ Found at: Building A, 2nd Floor │
│ Date: Mar 01, 2026              │
│ Description: Blue leather       │
│ Features: Gold zipper           │
│ Reported by: John D.  (Verified)│
│ [Claim This Item]               │
└─────────────────────────────────┘
```

### Storyboard 6: Submit Item Claim

```
Screen 1: Claim Form
┌─────────────────────────────────┐
│ Claim Item: Blue Wallet          │
├─────────────────────────────────┤
│ Your Name: John Smith            │
│ Email: john@conestoga.on.ca      │
│                                  │
│ Answer verification questions:   │
│ Q1: Describe 3 unique features   │
│ [Blue color, gold zipper...]     │
│ Q2: When did you lose it?        │
│ [Mar 01, 2026]                   │
│ Q3: Any ID visible inside?       │
│ [Yes, student ID]                │
│ [Submit Claim] [Cancel]          │
└─────────────────────────────────┘
         ↓
Screen 2: Claim Pending
┌─────────────────────────────────┐
│ Claim Submitted!                │
├─────────────────────────────────┤
│ We've notified the item owner    │
│ They will review your answers    │
│ You'll be updated via email      │
│ [View Claim Status]              │
└─────────────────────────────────┘
         ↓
Screen 3: Report Verification
┌─────────────────────────────────┐
│ Verify Claim for Blue Wallet     │
├─────────────────────────────────┤
│ Claimer: John S.                 │
│ Answers: ✓ Accurate (3/3)        │
│ Risk: Low                        │
│ [Question]                       │
│ Action: [Approve] [More Info]    │
│        [Reject] [Message]        │
└─────────────────────────────────┘
```

### Storyboard 7: Manage Claims & Transactions

```
Screen 1: Claims Dashboard
┌─────────────────────────────────┐
│ My Claims                        │
├─────────────────────────────────┤
│ Filter: [Pending ▼] [Sort ▼]     │
│                                  │
│ CLAIMED (As Claimer):            │
│ □ Blue Wallet (Pending Review)   │
│   [Message] [View Details]       │
│                                  │
│ RECEIVED (As Reporter):          │
│ □ Blue Wallet (1 claim pending)  │
│   [Review] [Message] [View]      │
└─────────────────────────────────┘
         ↓
Screen 2: Claim Transaction
┌─────────────────────────────────┐
│ Approve Claim - Blue Wallet      │
├─────────────────────────────────┤
│ Claimer: John Smith              │
│ Status: Pending                  │
│ [Chat/Message History]           │
│ • "I can verify the student ID"  │
│ [Approve] [Request Info]         │
│ [Reject with Reason]             │
└─────────────────────────────────┘
         ↓
Screen 3: Schedule Handoff
┌─────────────────────────────────┐
│ Schedule Item Pickup             │
├─────────────────────────────────┤
│ Item: Blue Wallet                │
│ From: John D.                    │
│ When: [Select Date] [Select Time]│
│ Where: [Select Location]         │
│ [Confirm Pickup]                 │
└─────────────────────────────────┘
         ↓
Screen 4: Completion & Feedback
┌─────────────────────────────────┐
│ ✓ Item Returned Successfully!    │
├─────────────────────────────────┤
│ Blue Wallet                      │
│ Returned to: John Smith          │
│ Rate your experience:            │
│ ★★★★★ (5.0 stars)               │
│ Comments: [____________]         │
│ [Submit Feedback] [Done]         │
└─────────────────────────────────┘
```

---

## 3. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────┐         ┌──────────────────────────┐  │
│  │      USERS          │         │      ITEMS               │  │
│  ├─────────────────────┤    1:N  ├──────────────────────────┤  │
│  │ id (PK)         ■───┼────────┼┤ id (PK)                  │  │
│  │ student_id (U)      │         │ user_id (FK) ──┐         │  │
│  │ email (U)           │         │ title          │         │  │
│  │ first_name          │         │ category       │         │  │
│  │ last_name           │         │ description    │         │  │
│  │ campus              │         │ location_found │         │  │
│  │ program             │         │ campus         │         │  │
│  │ password            │         │ type (L/F)     │         │  │
│  │ is_verified         │         │ status         │         │  │
│  │ role                │         │ features       │         │  │
│  │ created_at          │         │ date_lost      │         │  │
│  │ updated_at          │         │ date_found     │         │  │
│  └─────────────────────┘         │ image_url      │         │  │
│         ▲                         │ created_at     │         │  │
│         │                         │ updated_at     │         │  │
│         │ 1:N                     └────┬───────────┘         │  │
│         │                             │ 1:N                  │  │
│         └─────────────────────────────┘                      │  │
│                                       ▲                      │  │
│                                       │                      │  │
│  ┌────────────────────────────────────┴──────┐              │  │
│  │                                           │              │  │
│  │  ┌──────────────────────────────┐  ┌──────────────┐      │  │
│  │  │      CLAIMS                  │  │NOTIFICATIONS│      │  │
│  │  ├──────────────────────────────┤  ├──────────────┤      │  │
│  │  │ id (PK)                      │  │ id (PK)      │      │  │
│  │  │ item_id (FK) ────────────────┼──┤ user_id (FK) │      │  │
│  │  │ claimer_id (FK)──────┐       │  │ type         │      │  │
│  │  │ owner_id (FK)────────┼──────┼──┤ message      │      │  │
│  │  │ status               │       │  │ read         │      │  │
│  │  │ verification_notes   │       │  │ created_at   │      │  │
│  │  │ created_at           │       │  └──────────────┘      │  │
│  │  │ updated_at           │       │                        │  │
│  │  └──────────────────────────────┘               ┌─────────┴─ │
│  └──────────────────────┬──────────────────────────┘         │  │
│                         │ N:M (References USERS)             │  │
│                         └────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Relationships:
- USERS (1:N) ITEMS: One user can report multiple items
- USERS (1:N) CLAIMS: User can be claimer or owner in multiple claims
- ITEMS (1:N) CLAIMS: One item can have multiple claims
```

---

## 4. DATA DICTIONARY

### USERS Table

| Field | Data Type | Size | Constraint | Default | Description |
|-------|-----------|------|-----------|---------|-------------|
| id | INT | - | PK, AUTO_INCREMENT | - | Unique user identifier |
| student_id | VARCHAR | 20 | UNIQUE, NOT NULL | - | Campus student ID for authentication |
| email | VARCHAR | 100 | UNIQUE, NOT NULL | - | Campus email (.on.ca) for verification |
| first_name | VARCHAR | 50 | NOT NULL | - | User's first name |
| last_name | VARCHAR | 50 | NOT NULL | - | User's last name |
| campus | VARCHAR | 50 | NOT NULL | - | Campus location (Main, Downtown, etc.) |
| program | VARCHAR | 100 | - | NULL | Academic program/course |
| password | VARCHAR | 255 | NOT NULL | - | Hashed password (bcryptjs) |
| is_verified | BOOLEAN | - | - | FALSE | Email verification status |
| role | VARCHAR | 20 | CHECK IN ('student', 'security', 'admin') | student | User role for access control |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | CURRENT_TIMESTAMP | Last profile update timestamp |

### ITEMS Table

| Field | Data Type | Size | Constraint | Default | Description |
|-------|-----------|------|-----------|---------|-------------|
| id | INT | - | PK, AUTO_INCREMENT | - | Unique item identifier |
| title | VARCHAR | 100 | NOT NULL | - | Item name/title |
| category | VARCHAR | 50 | CHECK IN ('wallet','phone','keys','id','clothing','bag','textbook','electronics','other') | - | Item category for classification |
| description | TEXT | - | - | NULL | Detailed item description |
| location_found | VARCHAR | 255 | NOT NULL | - | Specific location where lost/found (Building, Floor) |
| campus | VARCHAR | 50 | NOT NULL | - | Campus where item was lost/found |
| type | VARCHAR | 10 | CHECK IN ('lost', 'found') | found | Item type classification |
| status | VARCHAR | 20 | CHECK IN ('Reported','Open','Claimed','Returned','Disposed','Done','Pending','Verified') | Reported | Current item status |
| distinguishing_features | TEXT | - | - | NULL | Unique characteristics (serial #, color, marks) |
| date_lost | DATE | - | - | NULL | Date item was lost |
| date_found | DATE | - | - | NULL | Date item was found |
| image_url | VARCHAR | 500 | - | NULL | Path to stored item image |
| user_id | INT | - | FK, NOT NULL | - | Foreign key to USERS (item reporter) |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Item entry timestamp |
| updated_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | CURRENT_TIMESTAMP | Last item update timestamp |

### CLAIMS Table

| Field | Data Type | Size | Constraint | Default | Description |
|-------|-----------|------|-----------|---------|-------------|
| id | INT | - | PK, AUTO_INCREMENT | - | Unique claim identifier |
| item_id | INT | - | FK, NOT NULL | - | Foreign key to ITEMS |
| claimer_id | INT | - | FK, NOT NULL | - | Foreign key to USERS (person claiming item) |
| owner_id | INT | - | FK, ALLOW NULL | NULL | Foreign key to USERS (item reporter) |
| status | VARCHAR | 20 | CHECK IN ('pending','verified','rejected','completed') | pending | Claim processing status |
| verification_notes | TEXT | - | - | NULL | Security notes on claim verification |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Claim submission timestamp |
| updated_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | CURRENT_TIMESTAMP | Last claim update timestamp |

### NOTIFICATIONS Table (New)

| Field | Data Type | Size | Constraint | Default | Description |
|-------|-----------|------|-----------|---------|-------------|
| id | INT | - | PK, AUTO_INCREMENT | - | Unique notification identifier |
| user_id | INT | - | FK, NOT NULL | - | Foreign key to USERS (recipient) |
| type | VARCHAR | 50 | NOT NULL | - | Notification type (claim, match, update) |
| title | VARCHAR | 255 | NOT NULL | - | Notification title |
| message | TEXT | - | - | NULL | Notification body |
| related_item_id | INT | - | FK, ALLOW NULL | NULL | Related item if applicable |
| related_claim_id | INT | - | FK, ALLOW NULL | NULL | Related claim if applicable |
| read | BOOLEAN | - | - | FALSE | Read status |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Notification creation time |

### REPORTS Table (New)

| Field | Data Type | Size | Constraint | Default | Description |
|-------|-----------|------|-----------|---------|-------------|
| id | INT | - | PK, AUTO_INCREMENT | - | Unique report identifier |
| report_type | VARCHAR | 50 | NOT NULL | - | Type of report (daily, weekly, monthly) |
| generated_by | INT | - | FK, ALLOW NULL | NULL | Admin user who generated report |
| report_date | DATE | - | NOT NULL | CURDATE | Report generation date |
| total_items_reported | INT | - | - | 0 | Total items in the system |
| total_claimed | INT | - | - | 0 | Total items successfully claimed |
| total_returned | INT | - | - | 0 | Total items returned to owners |
| claims_pending | INT | - | - | 0 | Pending claims count |
| top_categories | JSON | - | - | NULL | Most reported item categories |
| top_locations | JSON | - | - | NULL | Most frequent locations |
| lost_vs_found | JSON | - | - | NULL | Breakdown of lost vs found |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Report creation timestamp |

---

## Summary of Design Documents

**Total Points Breakdown:**
- User Flow Diagrams: 8 points
- Storyboard Diagrams: 15 points
- Entity Relationship Diagram: 5 points
- Data Dictionary: 5 points
- **Total Design Documents: 33 points**

These design documents establish the foundation for Iteration 2 implementation with clear user workflows, visual mockups, database schema, and comprehensive field definitions.
