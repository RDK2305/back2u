# Back2u - Quick Start Guide

Get Back2u running in 5 minutes!

## Prerequisites Check

```bash
# Verify Node.js is installed
node --version  # Should be v14+

# Verify npm is installed
npm --version   # Should be v6+

# Verify PostgreSQL is running
psql --version  # Should be v12+
```

## 1. Install Dependencies

```bash
cd Back2u
npm install
```

## 2. Setup Database

```bash
node config/setupDatabase.js
```

This will:
- Create the `Back2u_db` database
- Create all tables (users, items, claims)
- Insert sample data for testing
- Output confirmation messages

## 3. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# OR Production
npm start
```

You should see:
```
✅ PostgreSQL connected!
🚀 Server running on port 5000
```

## 4. Access the Application

Open your browser and navigate to:

- **Home Page:** http://localhost:5000
- **Register:** http://localhost:5000/register.html
- **Login:** http://localhost:5000/login.html
- **API Docs:** See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## 5. Test with Sample Account

### Sample Student Account
```
Email: student@conestogac.on.ca
Password: Check setupDatabase.js for hashed version
```

### Register New Account
1. Go to `/register.html`
2. Create new account with email `yourname@conestogac.on.ca`
3. Password must have: 8+ chars, 1 number, 1 special char (!@#$%^&*)
4. Click "Create Account"

## 6. Test Core Features

### Report a Lost Item
1. Login
2. Click "Report Lost Item"
3. Fill in the form
4. Upload an image (optional)
5. Submit

### View My Items
1. Go to Dashboard
2. See your reported lost items
3. View stats and status

### Browse Found Items
1. Navigate to "Browse Found Items"
2. Filter by category or campus
3. View recently found items

### Update Profile
1. Click "Profile"
2. Update your information
3. Optionally change password
4. Save changes

## Common Commands

```bash
# Stop server
Ctrl + C

# Reset database
node config/setupDatabase.js

# View server logs
npm run dev

# Check API endpoints
curl http://localhost:5000/api/items

# View database
psql -U postgres -d Back2u_db
```

## Troubleshooting

### Port 5000Already in Use
```bash
# On Mac/Linux
lsof -ti :5000| xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error
```
Error: EADDRREFUSED
```
**Solution:** Make sure PostgreSQL is running
```bash
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
services.msc -> PostgreSQL -> Start
```

### Migration Failed
```
Error: CREATE TABLE failed
```
**Solution:** Drop and recreate database
```bash
dropdb Back2u_db
node config/setupDatabase.js
```

## Next Steps

1. **Read Full Documentation:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. **Run Tests:** See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. **Customize:** Edit styles in `/public/stylesheets/style.css`
4. **Deploy:** Push to Render, Heroku, or your preferred platform

## Production Deployment

Before going live:

1. **Update `.env`:**
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-new-secret>
   DB_* settings for your production database
   ```

2. **Run migrations:**
   ```bash
   node config/setupDatabase.js
   ```

3. **Test all endpoints:**
   See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

4. **Deploy:**
   ```bash
   git push origin main
   # Render/Heroku will auto-deploy
   ```

## Architecture Overview

```
┌─────────────────┐
│   Web Browser   │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server │
│  (API Routes)   │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│  PostgreSQL DB  │
│  (Data Store)   │
└─────────────────┘
```

## File Structure

```
Back2u/
├── config/          Database config
├── controllers/     Business logic
├── models/          Data models
├── routes/          API endpoints
├── middleware/      Auth, upload
├── public/          Frontend (HTML/CSS/JS)
├── uploads/         User uploaded images
├── server.js        Entry point
├── package.json     Dependencies
└── .env            Environment config
```

## Key Features Implemented

✅ User Registration (with password validation)
✅ User Login (JWT authentication)
✅ Report Lost Items
✅ View My Lost Items
✅ Update User Profile
✅ Logout
✅ Browse Found Items (public)
✅ File Upload Support
✅ Role-based Access Control
✅ Responsive UI

## Support & Resources

- **Documentation:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Reference:** See `routes/` folder
- **Database Schema:** See `config/setupDatabase.js`

## Tips for Development

1. **Use Postman:** Test API endpoints without frontend
2. **Watch console:** Server logs show errors and info
3. **Browser DevTools:** Check network requests and LocalStorage
4. **Database client:** Use pgAdmin or DBeaver for database debugging
5. **Git frequently:** Commit working features regularly

---

**Now you're ready to use Back2u! 🚀**

Have fun building! 😊
