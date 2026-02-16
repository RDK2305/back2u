# Iteration 1 Consolidated Report - Back2u Lost & Found System

**Team Name:** [Your Team Name]  
**Team Number:** [Your Team Number]  
**Project Title:** Back2u - Lost & Found System for College Communities  
**Date:** [Current Date]  
**Course Code:** [Course Code]  
**Professor/Instructor Name:** [Professor Name]  
**Client Name:** [Client Name, if applicable]  

## Table of Contents
1. [Use Case Diagrams](#use-case-diagrams)
2. [Use Case Descriptions](#use-case-descriptions)
3. [User Interface Prototypes](#user-interface-prototypes)
4. [Release Summary for Iteration 1](#release-summary-for-iteration-1)

---

## Use Case Diagrams

### Primary Use Case Diagram

```
[Actor: Student/security]
    |
    |-- Register Account
    |-- Log In
    |-- Submit Lost Item Report
    |-- View My Submitted Lost Items
    |-- Update User Profile
    |-- Logout
    |-- View System Home/Public Found Items
```

### Detailed Use Case Diagram

```
Back2u System
├── Actors:
│   ├── Student
│   └── security
│
├── Use Cases:
│   ├── UC01: Register Account
│   ├── UC02: Log In
│   ├── UC03: Submit Lost Item Report
│   ├── UC04: View My Submitted Lost Items
│   ├── UC11: Update User Profile
│   ├── UC12: Logout
│   └── UC13: View System Home/Public Found Items
│
├── Relationships:
│   ├── Student extends User
│   ├── security extends User
│   └── All use cases include Authentication
```

*Note: Diagrams are textual representations. For actual diagrams, use tools like Lucidchart or draw.io.*

---

## Use Case Descriptions

### UC01: Register Account
**Actor:** Student/security  
**Description:** A new user creates an account by providing personal information, selecting a role, and verifying their Conestoga email.  
**Preconditions:** User has a valid @conestogac.on.ca email.  
**Postconditions:** Account is created, user is logged in, and redirected to dashboard.  
**Main Flow:**
1. User navigates to registration page.
2. User enters email, password, name, campus, program, and selects role.
3. System validates email domain and password strength.
4. System creates account and sends JWT token.
5. User is redirected to dashboard.

**Alternative Flows:**
- Invalid email: Display error message.
- Weak password: Show requirements and prevent submission.

### UC02: Log In
**Actor:** Student/security  
**Description:** Existing user authenticates using email and password.  
**Preconditions:** User has a registered account.  
**Postconditions:** User is authenticated and redirected to dashboard.  
**Main Flow:**
1. User enters email and password.
2. System verifies credentials.
3. System generates JWT token.
4. User is redirected to dashboard.

**Alternative Flows:**
- Invalid credentials: Display error message.

### UC03: Submit Lost Item Report
**Actor:** Student/security  
**Description:** User reports a lost item with details and optional image.  
**Preconditions:** User is logged in.  
**Postconditions:** Item is saved in database with "Reported" status.  
**Main Flow:**
1. User fills form with title, category, description, location, date lost, campus.
2. User uploads optional image.
3. System validates input and saves item.
4. User sees success message and item in dashboard.

**Alternative Flows:**
- Invalid input: Display validation errors.
- File too large: Show error message.

### UC04: View My Submitted Lost Items
**Actor:** Student/security  
**Description:** User views their reported lost items with status and details.  
**Preconditions:** User is logged in and has reported items.  
**Postconditions:** Items are displayed with statistics.  
**Main Flow:**
1. User accesses dashboard.
2. System loads user's lost items.
3. Items are displayed with title, category, date, status, location.
4. Statistics show total, open, claimed items.

### UC11: Update User Profile
**Actor:** Student/security  
**Description:** User updates their profile information and password.  
**Preconditions:** User is logged in.  
**Postconditions:** Profile is updated in database.  
**Main Flow:**
1. User accesses profile page.
2. User edits name, campus, program.
3. User changes password with current password verification.
4. System validates and updates profile.
5. Success message displayed.

### UC12: Logout
**Actor:** Student/security  
**Description:** User ends their session.  
**Preconditions:** User is logged in.  
**Postconditions:** JWT token is invalidated, user redirected to home.  
**Main Flow:**
1. User clicks logout.
2. System removes token from client.
3. User redirected to home page.

### UC13: View System Home/Public Found Items
**Actor:** Public User  
**Description:** Anyone can view recently found items on the home page.  
**Preconditions:** None.  
**Postconditions:** Found items are displayed with pagination.  
**Main Flow:**
1. User visits home page.
2. System loads recent found items.
3. Items shown with title, category, location, date found.
4. Pagination allows browsing more items.

---

## User Interface Prototypes

### 1. Home Page (index.html)
- **Header:** Logo, navigation links (Login, Register, Browse Found Items)
- **Hero Section:** Welcome message, call-to-action buttons
- **Recent Found Items:** Grid of cards showing item title, category, location, date
- **Footer:** Links to about, contact

### 2. Registration Page (register.html)
- **Form Fields:** Email, First Name, Last Name, Campus, Program, Password, Confirm Password, Role (Student/security)
- **Password Requirements:** Real-time display of strength requirements
- **Buttons:** Register, Already have account? Login

### 3. Login Page (login.html)
- **Form Fields:** Email, Password
- **Buttons:** Login, Forgot Password (deferred), Register
- **Error Display:** Invalid credentials message

### 4. Dashboard (dashboard.html)
- **Sidebar:** User profile card, navigation menu
- **Main Content:** Statistics cards (Total Items, Open, Claimed), List of user's lost items
- **Item Cards:** Title, Category, Date Lost, Status, Location, Actions (Edit, View)

### 5. Report Lost Item (report-lost.html)
- **Form Fields:** Title, Category dropdown, Description, Location, Date Lost, Campus, Distinguishing Features, Image Upload
- **Image Preview:** Shows uploaded image
- **Buttons:** Submit Report, Cancel

### 6. Profile Page (profile.html)
- **Profile Section:** Edit name, campus, program
- **Password Section:** Current password, New password, Confirm new password
- **Buttons:** Save Changes, Cancel

### 7. Browse Found Items (browse-found.html)
- **Search Bar:** Keyword search
- **Filters:** Category, Campus, Status
- **Items Grid:** Cards with image, title, category, location, date
- **Pagination:** Page navigation
- **Modal:** Item details on click

### 8. My Claims (my-claims.html)
- **Claims List:** User's submitted claims with item details, status, verification notes
- **Status Indicators:** Color-coded status

*Note: Prototypes are described textually. Screenshots or wireframes can be added in actual Word document.*

---

## Release Summary for Iteration 1

### Completed Features
- **User Authentication:** Registration, login, logout with JWT
- **Lost Item Reporting:** Full form with image upload
- **Dashboard:** View user's lost items with statistics
- **Profile Management:** Update user information and password
- **Public Browsing:** View found items without login
- **Database:** MySQL with proper schema
- **Security:** Password hashing, input validation, role-based access

### Code Quality
- **Backend:** Node.js/Express with modular controllers, models, routes
- **Frontend:** HTML/CSS/JS with responsive design
- **Database:** Normalized schema with foreign keys
- **Testing:** Comprehensive test suite covering all endpoints
- **Documentation:** Complete API reference and implementation guides

### Working Code Demonstration
- **Video Recording:** [Link to MP4 video]
- **Demonstration Points:**
  - User registration and login
  - Lost item reporting with image
  - Dashboard viewing
  - Profile updates
  - Public item browsing
  - API testing with Postman

### Alignment with Plans
- **Iteration Plan:** All core use cases (UC01-04, UC11-13) implemented
- **Project Plan:** 30% code completion achieved, foundation for remaining features
- **Agile Backlog:** Basic CRUD operations complete, ready for advanced features

### Known Issues
- Email notifications deferred to Iteration 2
- security features partially implemented
- Mobile responsiveness needs refinement

### Next Steps
- Implement found item registration (UC05)
- Add claim submission and verification (UC07-08)
- Enhance search and filtering (UC06)
- Add notifications (UC09)
- Admin dashboard (UC10)

---

**End of Iteration 1 Report**
