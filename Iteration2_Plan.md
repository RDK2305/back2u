# Iteration 2 Plan and Agile Backlog - Back2u Lost & Found System

### Overview
Iteration 2 focuses on completing the core lost and found functionality by implementing found item registration, claim management, and enhanced search capabilities. This iteration aims for 70% code completion.

### Goals
1. Implement found item reporting and management
2. Complete claim submission and verification workflow
3. Enhance search and filtering capabilities
4. Add security administrative features
5. Improve user experience with notifications

### Timeline
- **Start Date:** [Date]
- **End Date:** [Date]
- **Duration:** [Weeks] weeks
- **Sprint Length:** 2 weeks

### Success Criteria
- All major use cases (UC05-UC10) implemented and tested
- 70% of total code completed
- Working claim verification workflow
- Enhanced search functionality
- security dashboard operational

### Team Roles
- **Product Owner:** [Name]
- **Scrum Master:** [Name]
- **Developers:** [Names]
- **QA Tester:** [Name]
- **UI/UX Designer:** [Name]

### Risk Assessment
- **Technical Risks:** Database performance with increased data
- **Timeline Risks:** Complex claim workflow implementation
- **Resource Risks:** Team availability during exam period

### Dependencies
- Iteration 1 completion and testing
- Database schema stability
- Client feedback incorporation

---

## Agile Backlog

### Epic 1: Found Item Management
**Priority:** High  
**Story Points:** 21  
**Status:** To Do

#### User Stories:
1. **As a security member, I want to register found items so that lost items can be claimed**
   - Acceptance Criteria:
     - security can access found item registration form
     - Form includes all required fields (title, category, description, location, date found, image)
     - Items are saved with "Found" status
     - Only security can register found items

2. **As a student, I want to view found items so that I can identify my lost belongings**
   - Acceptance Criteria:
     - Public access to found items list
     - Items display with image, title, category, location, date found
     - Search and filter functionality
     - Pagination for large result sets

3. **As a security member, I want to manage found items so that I can update status and information**
   - Acceptance Criteria:
     - security can edit found item details
     - Status updates (Found → Claimed → Returned)
     - Image management (add/change/delete)
     - Audit trail of changes

### Epic 2: Claim Management System
**Priority:** High  
**Story Points:** 34  
**Status:** To Do

#### User Stories:
1. **As a student, I want to submit claims for found items so that I can recover my belongings**
   - Acceptance Criteria:
     - Claim form with item selection and description
     - Proof of ownership requirements
     - Claim status tracking
     - Notification system integration

2. **As a security member, I want to verify claims so that items are returned to rightful owners**
   - Acceptance Criteria:
     - Claim review interface
     - Verification notes and decisions
     - Status updates (Pending → Approved/Rejected)
     - Owner notification upon decision

3. **As a student, I want to track my claims so that I know the status of my requests**
   - Acceptance Criteria:
     - Personal claims dashboard
     - Status indicators and updates
     - Claim history and details
     - Communication with security

### Epic 3: Enhanced Search and Filtering
**Priority:** Medium  
**Story Points:** 13  
**Status:** To Do

#### User Stories:
1. **As a user, I want advanced search options so that I can find specific items quickly**
   - Acceptance Criteria:
     - Multiple filter criteria (category, campus, date range, status)
     - Keyword search across title and description
     - Saved search functionality
     - Search result sorting options

2. **As a security member, I want to generate reports so that I can analyze lost and found trends**
   - Acceptance Criteria:
     - Date range filtering
     - Category and campus breakdowns
     - Claim success rates
     - Export functionality (CSV/PDF)

### Epic 4: security Administrative Features
**Priority:** Medium  
**Story Points:** 18  
**Status:** To Do

#### User Stories:
1. **As a security member, I want an administrative dashboard so that I can manage the system**
   - Acceptance Criteria:
     - Overview statistics (total items, pending claims, etc.)
     - Recent activity feed
     - Quick actions for common tasks
     - Role-based access control

2. **As a security member, I want to manage user accounts so that I can assist with account issues**
   - Acceptance Criteria:
     - User search and lookup
     - Account status management
     - Password reset capability
     - User activity history

### Epic 5: Notification System
**Priority:** Low  
**Story Points:** 8  
**Status:** To Do

#### User Stories:
1. **As a user, I want email notifications so that I stay updated on my items and claims**
   - Acceptance Criteria:
     - Item status change notifications
     - Claim status updates
     - System announcements
     - Notification preferences

### Sprint 1 (Weeks 1-2)
**Focus:** Found Item Management  
**Stories:** 1-3 from Epic 1  
**Story Points:** 21

### Sprint 2 (Weeks 3-4)
**Focus:** Claim Management  
**Stories:** 1-3 from Epic 2  
**Story Points:** 34

### Sprint 3 (Weeks 5-6)
**Focus:** Enhanced Features  
**Stories:** Epic 3 + Epic 4  
**Story Points:** 31

### Sprint 4 (Weeks 7-8)
**Focus:** Notifications and Polish  
**Stories:** Epic 5 + remaining tasks  
**Story Points:** 8

---

## User Flow Diagrams

### Student User Flow
```
Home Page → Browse Found Items → Login → Dashboard → Report Lost Item → View My Items → Submit Claim → Track Claim Status
```

### security User Flow
```
Login → security Dashboard → Register Found Item → Manage Items → Review Claims → Verify Claims → Update Item Status
```

### Claim Process Flow
```
Student finds item → Submits claim → security reviews → Approves/Rejects → Student notified → Item returned/picked up
```

*Note: Detailed flow diagrams should be created using diagramming tools like Lucidchart or draw.io*

---

## Storyboard Diagrams

### Storyboard 1: Student Claiming an Item
1. **Scene 1:** Student browses found items on public page
2. **Scene 2:** Student logs in to access claim functionality
3. **Scene 3:** Student views item details and submits claim
4. **Scene 4:** Student receives confirmation and tracks status
5. **Scene 5:** Student gets notification when claim is approved

### Storyboard 2: security Processing Claims
1. **Scene 1:** security logs into administrative dashboard
2. **Scene 2:** security views pending claims list
3. **Scene 3:** security reviews claim details and evidence
4. **Scene 4:** security approves claim and updates item status
5. **Scene 5:** System notifies student of approval

### Storyboard 3: Enhanced Search Experience
1. **Scene 1:** User accesses search page with filters
2. **Scene 2:** User applies multiple filters (category, date, campus)
3. **Scene 3:** System displays filtered results
4. **Scene 4:** User refines search with keywords
5. **Scene 5:** User finds desired item and takes action

*Note: Storyboards should include wireframe sketches or screenshots*

---

## Entity Relationship Diagram

```
Users (1) ──── (Many) Items
  │                    │
  │                    │
  └─── (Many) Claims ──┘

Detailed Schema:
Users {
  id (PK)
  student_id
  email (unique)
  first_name
  last_name
  campus
  program
  password (hashed)
  role (student/security)
  is_verified
  created_at
  updated_at
}

Items {
  id (PK)
  title
  category
  description
  location_found
  campus
  type (lost/found)
  status (Reported/Found/Open/Claimed/Returned/Disposed)
  distinguishing_features
  date_lost
  date_found
  image_url
  user_id (FK → Users)
  created_at
  updated_at
}

Claims {
  id (PK)
  item_id (FK → Items)
  claimer_id (FK → Users)
  owner_id (FK → Users)
  status (Pending/Approved/Rejected)
  claim_description
  proof_of_ownership
  verification_notes
  created_at
  updated_at
}
```

---

## Data Dictionary

### Users Table

| Field | Type | Length | Required | Description |
|-------|------|--------|----------|-------------|
| id | INT | - | Yes | Primary key, auto-increment |
| student_id | VARCHAR | 20 | Yes | Unique student identifier |
| email | VARCHAR | 100 | Yes | Conestoga email address |
| first_name | VARCHAR | 50 | Yes | User's first name |
| last_name | VARCHAR | 50 | Yes | User's last name |
| campus | ENUM | - | Yes | Main, Waterloo, Cambridge |
| program | VARCHAR | 100 | No | Academic program |
| password | VARCHAR | 255 | Yes | Bcrypt hashed password |
| role | ENUM | - | Yes | student, security |
| is_verified | BOOLEAN | - | Yes | Email verification status |
| created_at | TIMESTAMP | - | Yes | Account creation date |
| updated_at | TIMESTAMP | - | Yes | Last profile update |

### Items Table

| Field | Type | Length | Required | Description |
|-------|------|--------|----------|-------------|
| id | INT | - | Yes | Primary key, auto-increment |
| title | VARCHAR | 100 | Yes | Item title/name |
| category | ENUM | - | Yes | electronics, textbooks, keys, etc. |
| description | TEXT | - | Yes | Detailed item description |
| location_found | VARCHAR | 100 | Yes | Where item was found/lost |
| campus | ENUM | - | Yes | Campus location |
| type | ENUM | - | Yes | lost, found |
| status | ENUM | - | Yes | Reported, Found, Open, Claimed, etc. |
| distinguishing_features | TEXT | - | No | Unique identifying features |
| date_lost | DATE | - | No | When item was lost |
| date_found | DATE | - | No | When item was found |
| image_url | VARCHAR | 255 | No | Path to uploaded image |
| user_id | INT | - | Yes | Foreign key to Users table |
| created_at | TIMESTAMP | - | Yes | Item creation date |
| updated_at | TIMESTAMP | - | Yes | Last item update |

### Claims Table

| Field | Type | Length | Required | Description |
|-------|------|--------|----------|-------------|
| id | INT | - | Yes | Primary key, auto-increment |
| item_id | INT | - | Yes | Foreign key to Items table |
| claimer_id | INT | - | Yes | Foreign key to Users (claimer) |
| owner_id | INT | - | No | Foreign key to Users (item owner) |
| status | ENUM | - | Yes | Pending, Approved, Rejected |
| claim_description | TEXT | - | Yes | Why user thinks item is theirs |
| proof_of_ownership | TEXT | - | No | Proof details |
| verification_notes | TEXT | - | No | security verification notes |
| created_at | TIMESTAMP | - | Yes | Claim submission date |
| updated_at | TIMESTAMP | - | Yes | Last claim update |

### Category Values
- electronics
- textbooks
- keys
- id_cards
- clothing
- bags
- other

### Status Values (Items)
- Reported (initial lost item status)
- Found (initial found item status)
- Open (available for claiming)
- Claimed (claim submitted)
- Returned (item returned to owner)
- Disposed (item disposed of)

### Status Values (Claims)
- Pending (awaiting review)
- Approved (claim verified)
- Rejected (claim denied)

---

## Release Summary for Iteration 2

### Planned Features
- Complete found item management system
- Full claim submission and verification workflow
- Enhanced search and filtering capabilities
- security administrative dashboard
- Email notification system
- Improved reporting and analytics

### Success Metrics
- 70% code completion
- All major use cases implemented
- Working end-to-end claim process
- security dashboard operational
- Enhanced user experience

### Testing Plan
- Unit tests for all new controllers
- Integration tests for claim workflow
- UI/UX testing for security features
- Performance testing for search functionality
- Security testing for administrative features

### Deployment Plan
- Database schema updates
- Environment configuration
- User acceptance testing
- Production deployment
- User training and documentation
