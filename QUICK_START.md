# Quick Setup Guide - Slack Clone Auth Integration

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Quick Start

### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with these values:
# MONGO_URI=mongodb://localhost:27017/main_db
# JWT_SECRET=your_secret_key_here_change_in_production
# NODE_ENV=development
# PORT=8080
# CLIENT_URL=http://localhost:5173

# Start the backend server
npm run dev
```

Backend will run on: http://localhost:8080

### 2. Frontend Setup
```powershell
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:8080/api

# Start the frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### 3. Test the Application

1. Open browser to http://localhost:5173
2. Click "Create an account"
3. Register with:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
4. You'll be redirected to the workspace selection page
5. Your username should appear in the header
6. Click "LOGOUT" to sign out
7. Sign in again with the same credentials

## What's Been Integrated

✅ **User Registration**
- Frontend: `/register` page with form validation
- Backend: `POST /api/auth/register` endpoint
- Password hashing with bcrypt
- JWT token generation

✅ **User Sign In**
- Frontend: `/signin` page
- Backend: `POST /api/auth/signin` endpoint
- Password verification
- Session management with localStorage

✅ **Authentication State Management**
- React Context API for global auth state
- Persistent login across page refreshes
- Automatic token handling

✅ **Protected Routes**
- Routes that require authentication
- Automatic redirect to signin if not authenticated
- Loading states during auth checks

✅ **Logout Functionality**
- Logout button in header
- Clears user data
- Redirects to signin page

## File Structure Created

### Frontend
```
frontend/src/
├── config/
│   └── axios.ts              # Axios configuration with interceptors
├── services/
│   └── authApi.ts            # Auth API functions (register, signin, signout)
├── context/
│   └── AuthContext.tsx       # Auth state management
├── components/
│   └── ProtectedRoute.tsx    # Route guard component
├── pages/
│   ├── SignIn.tsx            # Updated with backend integration
│   └── Register.tsx          # New registration page
└── .env                      # Environment variables
```

### Backend
```
backend/
├── .env                      # Environment variables (newly created)
└── (existing auth structure already present)
```

## API Endpoints Available

### POST /api/auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### POST /api/auth/signin
Sign in existing user
```json
{
  "email": "string",
  "password": "string"
}
```

## Common Issues & Solutions

**Issue: Cannot connect to backend**
- Verify backend is running on port 8080
- Check `.env` file in frontend has correct `VITE_API_URL`

**Issue: MongoDB connection error**
- Ensure MongoDB is running
- Check `MONGO_URI` in backend `.env`

**Issue: CORS error**
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Default should be `http://localhost:5173`

**Issue: "Invalid credentials" on signin**
- Verify you registered first
- Check email and password are correct
- Password must be at least 6 characters

## Next Steps

Now that auth is integrated, you can:
1. Test user registration and login
2. Explore the protected workspace selection page
3. Verify logout functionality
4. Check that unauthorized access redirects to signin

For detailed documentation, see [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md)
