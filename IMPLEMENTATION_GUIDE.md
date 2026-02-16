# Back2u - Lost & Found Management System

A comprehensive web-based lost and found management system for college campuses, built with Node.js, Express, and PostgreSQL.

## Overview

Back2u helps students and security report lost items, browse found items, and manage item claims. The system features user authentication, image uploads, and role-based access control.

## Features

### Core Features (Iteration 1)

- **UC01: User Registration** - Create account with email verification
- **UC02: User Login** - Secure JWT-based authentication
- **UC03: Report Lost Item** - Submit lost item reports with images and details
- **UC04: View My Items** - Dashboard to track personal lost items
- **UC11: Update Profile** - Modify user information and password
- **UC12: Logout** - Secure session termination
- **UC13: Public Home** - Browse recent found items

### Features for Future Iterations

- **UC05: Register Found Item** - Campus security can register found items
- **UC06: Search Found Items** - Advanced search with filters
- **UC07: Submit Claim** - Users can claim found items
- **UC08: Verify Claims** - security approval/rejection workflow
- **UC09: Notifications** - Email alerts on claim updates
- **UC10: Admin Dashboard** - security analytics and management

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Password Security:** bcryptjs
- **Frontend:** HTML5, CSS3, JavaScript

## Project Structure

```
Back2u/
├── config/
│   ├── database.js          # Database connection
│   └── setupDatabase.js     # Database schema setup
├── controllers/
│   ├── authController.js    # Auth logic (register, login, profile)
│   ├── itemController.js    # Item management logic
│   └── claimController.js   # Claim management logic
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── upload.js            # File upload configuration
├── models/
│   ├── User.js              # User model
│   ├── Item.js              # Item model
│   └── Claim.js             # Claim model
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── itemRoutes.js        # Item endpoints
│   └── claimRoutes.js       # Claim endpoints
├── public/
│   ├── index.html           # Home page
│   ├── register.html        # Registration page
│   ├── login.html           # Login page
│   ├── dashboard.html       # User dashboard
│   ├── report-lost.html     # Report lost item form
│   ├── profile.html         # User profile page
│   ├── browse-found.html    # Browse found items
│   ├── my-claims.html       # View user's claims
│   ├── javascripts/
│   │   ├── api.js           # API helper functions
│   │   ├── register.js      # Register page logic
│   │   ├── login.js         # Login page logic
│   │   ├── dashboard.js     # Dashboard logic
│   │   ├── report-lost.js   # Report lost logic
│   │   ├── profile.js       # Profile update logic
│   │   ├── browse-found.js  # Browse found items logic
│   │   ├── my-claims.js     # Claims page logic
│   │   └── home.js          # Home page logic
│   └── stylesheets/
│       └── style.css        # Global styles
├── uploads/                 # Uploaded images directory
├── .env                     # Environment variables
├── server.js               # Main server file
├── package.json            # Dependencies
└── README.md               # Documentation
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone or navigate to project:**
   ```bash
   cd Back2u
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   Create/update `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=Back2u_db
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5000000
   ```

4. **Setup database:**
   ```bash
   node config/setupDatabase.js
   ```
   This will create all required tables and insert sample data.

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

6. **Access the application:**
   - Frontend: `http://localhost:5000`
   - API: `http://localhost:5000/api`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Items

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/items` | Get all items (with filters) | No |
| GET | `/api/items/:id` | Get single item | No |
| POST | `/api/items/lost` | Report a lost item | Yes |
| POST | `/api/items/found` | Register a found item | Yes |
| GET | `/api/items/lost/my-items` | Get user's lost items | Yes |
| GET | `/api/items/found/my-items` | Get user's found items | Yes |
| GET | `/api/items/public/found-items` | Get public found items | No |
| PUT | `/api/items/:id` | Update item | Yes |
| PUT | `/api/items/:id/status` | Update item status | Yes (security) |
| DELETE | `/api/items/:id` | Delete item | Yes (security) |

### Claims

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/claims` | Submit claim for found item | Yes |
| GET | `/api/claims/:id` | Get claim details | Yes |
| GET | `/api/claims/user/my-claims` | Get user's claims | Yes |
| GET | `/api/items/:id/claims` | Get claims for item | Yes |
| PUT | `/api/claims/:id` | Update claim | Yes |
| PUT | `/api/claims/:id/verify` | Verify/approve claim | Yes (security) |
| DELETE | `/api/claims/:id` | Cancel claim | Yes |

## User Roles & Permissions

### Student
- Register and login
- Report lost items
- View own lost items
- Browse found items
- Submit claims for found items
- Update profile and password

### security
- All student permissions
- Register found items
- Manage item status
- Verify/approve/reject claims
- Delete items

## Usage Guide

### For Students

1. **Register Account:**
   - Go to `/register.html`
   - Fill in details (must use @conestogac.on.ca email)
   - Set password (min 8 chars, 1 number, 1 special char)
   - Click "Create Account"

2. **Login:**
   - Go to `/login.html`
   - Enter email and password
   - Click "Login"

3. **Report Lost Item:**
   - Go to Dashboard → "Report Lost Item"
   - Fill in item details
   - Select category, campus, date lost
   - Add distinguishing features
   - Upload image (optional)
   - Click "Report Lost Item"

4. **View My Lost Items:**
   - Dashboard shows all reported items
   - View status and last reported date
   - See statistics about reports

5. **Browse Found Items:**
   - Click "Browse Found Items"
   - Use search filters (keyword, category, campus)
   - Click on item to view details
   - Submit claim if it matches your lost item

6. **Update Profile:**
   - Go to "Profile" from dashboard
   - Update name, campus, program
   - Change password if needed
   - Click "Save Changes"

### For Campus security

1. **All student features plus:**
   - Report found items via `/api/items/found`
   - Verify user claims and update status
   - Delete inactive items
   - Manage all items on campus

## Password Requirements

- Minimum 8 characters
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

Examples of valid passwords:
- `Password123!`
- `MyFirstPassword@2026`
- `Back2u#Pass123`

## Database Schema

### Users Table
```sql
- id (PRIMARY KEY)
- student_id (UNIQUE)
- email (UNIQUE)
- first_name
- last_name
- campus
- program
- password (hashed)
- is_verified
- role (student/security)
- created_at
- updated_at
```

### Items Table
```sql
- id (PRIMARY KEY)
- title
- category
- description
- location_found
- campus
- type (lost/found)
- status (Reported/Open/Claimed/Returned/Disposed)
- distinguishing_features
- date_lost
- date_found
- image_url
- user_id (FOREIGN KEY)
- created_at
- updated_at
```

### Claims Table
```sql
- id (PRIMARY KEY)
- item_id (FOREIGN KEY)
- claimer_id (FOREIGN KEY)
- owner_id (FOREIGN KEY)
- status (pending/verified/rejected/completed)
- verification_notes
- created_at
- updated_at
```

## Common Issues & Solutions

### Database Connection Error
- Ensure PostgreSQL is running
- Check `.env` database credentials
- Verify database name exists

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 5000: `lsof -ti :5000| xargs kill -9`

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file size (max 5MB)
- Verify file format (JPG, PNG, GIF only)

### JWT Token Expired
- Refresh page and login again
- Token expires after 7 days by default

## Testing

### Sample Test Credentials

The database includes sample test users:

**security Member:**
- Email: `djivani@conestogac.on.ca`
- Password: (same as others)

**Students:**
- Email: `student@conestogac.on.ca`
- Email: `maya@conestogac.on.ca`
- Email: `alex@conestogac.on.ca`
- Email: `sarah@conestogac.on.ca`

*Note: Run `node config/setupDatabase.js` to generate valid hashed passwords*

## Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- Email validation for Conestoga domain
- File uploads validated by type and size
- Role-based access control implemented
- CORS enabled for local development

## Future Enhancements

- Email notifications via Nodemailer
- Advanced matching algorithm for lost/found items
- Admin dashboard with analytics
- Mobile app version
- QR code generation for items
- Item tracking timeline
- Google integration for campus location
- SMS notifications

## License

This project is part of the Conestoga College curriculum. All rights reserved.

## Support

For issues or questions, contact the development team or submit an issue through the college's support system.

---

**Last Updated:** February 10, 2026
**Version:** 1.0.0
