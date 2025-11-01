# Slack Clone - Auth Integration Documentation

## Overview
This project is a Slack clone with a React + TypeScript frontend and Node.js + Express backend. The authentication system has been fully integrated between frontend and backend.

## Tech Stack

### Frontend
- React 19 with TypeScript
- React Router DOM for navigation
- Axios for HTTP requests
- Tailwind CSS for styling
- Vite as build tool

### Backend
- Node.js with Express 5
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Socket.io for real-time communication
- Cookie-parser for handling cookies

## Project Structure

```
slack-RL-env/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── socket.js          # Socket.io setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # Auth logic (register, signin)
│   │   │   └── message.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js      # User schema
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── auth.route.js      # Auth routes
│   │   │   └── message.route.js
│   │   ├── middlewares/
│   │   │   └── protectRoute.js    # Auth middleware
│   │   └── server.js              # Entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── axios.ts           # Axios configuration
│   │   ├── services/
│   │   │   ├── authApi.ts         # Auth API calls
│   │   │   └── workspaceApi.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state management
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx # Route guard
│   │   │   ├── Header.tsx         # Header with logout
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── SignIn.tsx         # Login page
│   │   │   ├── Register.tsx       # Registration page
│   │   │   └── ...
│   │   ├── App.tsx                # Main app with routes
│   │   └── main.tsx
│   ├── .env                       # Frontend env variables
│   └── package.json
```

## Authentication Flow

### Registration Flow
1. User fills registration form (username, email, password, confirm password)
2. Frontend validates password match and length
3. POST request to `/api/auth/register` with credentials
4. Backend validates and checks for existing users
5. Password is hashed using bcrypt (via pre-save hook in User model)
6. User is created in MongoDB
7. JWT token is generated and sent in httpOnly cookie
8. User data (without password) is returned to frontend
9. User data stored in localStorage
10. User is redirected to `/home` (workspace selection)

### Sign In Flow
1. User enters email and password
2. POST request to `/api/auth/signin`
3. Backend finds user by email
4. Password is compared using bcrypt
5. If valid, user data is returned (token in cookie)
6. User data stored in localStorage
7. User is redirected to `/home`

### Sign Out Flow
1. User clicks logout button in Header
2. User data is removed from localStorage
3. User is redirected to `/signin`

### Protected Routes
- Routes wrapped in `<ProtectedRoute>` component
- Checks `isAuthenticated` status from AuthContext
- If not authenticated, redirects to `/signin`
- If authenticated, renders the protected content

## API Endpoints

### Auth Routes (Backend)

#### POST `/api/auth/register`
Register a new user

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

#### POST `/api/auth/signin`
Sign in an existing user

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (or copy from `.env.example`):
```env
MONGO_URI=mongodb://localhost:27017/main_db
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:5173
```

4. Make sure MongoDB is running locally or update `MONGO_URI` with your MongoDB connection string

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Features Implemented

### Frontend
- ✅ Registration page with form validation
- ✅ Sign in page with email/password authentication
- ✅ Auth context for global state management
- ✅ Protected routes that require authentication
- ✅ Axios instance with interceptors
- ✅ Automatic redirection based on auth status
- ✅ User data persistence in localStorage
- ✅ Logout functionality in Header
- ✅ Error handling and display

### Backend
- ✅ User registration endpoint
- ✅ Sign in endpoint
- ✅ Password hashing with bcrypt
- ✅ JWT token generation
- ✅ Cookie-based authentication
- ✅ Input validation
- ✅ Duplicate email/username checking
- ✅ Error handling

## Key Files

### Frontend Files

**`src/config/axios.ts`**
- Axios instance with base URL configuration
- Request/response interceptors
- Handles 401 errors globally

**`src/services/authApi.ts`**
- `register()` - Register new user
- `signin()` - Sign in user
- `signout()` - Clear user data
- `getCurrentUser()` - Get user from localStorage

**`src/context/AuthContext.tsx`**
- React Context for auth state
- `useAuth()` hook for accessing auth state
- Provides: `user`, `loading`, `setUser`, `logout`, `isAuthenticated`

**`src/components/ProtectedRoute.tsx`**
- Route wrapper for authenticated routes
- Shows loading state while checking auth
- Redirects to `/signin` if not authenticated

**`src/pages/SignIn.tsx`**
- Sign in form with email and password
- Error handling and loading states
- Redirects to `/home` after successful login

**`src/pages/Register.tsx`**
- Registration form with validation
- Password confirmation check
- Redirects to `/home` after successful registration

### Backend Files

**`src/controllers/auth.controller.js`**
- `register()` - Handles user registration
- `signin()` - Handles user sign in
- Password hashing via User model pre-save hook
- JWT token generation

**`src/routes/auth.route.js`**
- POST `/register` - Registration route
- POST `/signin` - Sign in route

**`src/models/user.model.js`**
- User schema with username, email, password
- Pre-save hook for password hashing
- `comparePassword()` method for authentication

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/main_db  # MongoDB connection string
JWT_SECRET=your_secret_key_here              # Secret for JWT signing
NODE_ENV=development                          # Environment (development/production)
PORT=8080                                     # Server port
CLIENT_URL=http://localhost:5173              # Frontend URL for CORS
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api       # Backend API base URL
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storing
2. **JWT Tokens**: Secure token-based authentication
3. **httpOnly Cookies**: Tokens stored in httpOnly cookies (not accessible via JavaScript)
4. **CORS Configuration**: Proper CORS setup to allow only frontend origin
5. **Input Validation**: Server-side validation of all inputs
6. **Error Handling**: Proper error messages without exposing sensitive info

## Testing the Integration

1. Start MongoDB
2. Start backend server: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open browser to `http://localhost:5173`
5. Click "Create an account" to register
6. Fill in username, email, and password
7. After registration, you'll be redirected to workspace selection
8. Logout using the header button
9. Sign in again using the credentials you created

## Next Steps / TODO

- [ ] Implement refresh token mechanism
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Implement OAuth (Google, Apple) sign in
- [ ] Add profile update endpoint
- [ ] Add "Remember me" functionality
- [ ] Implement rate limiting for auth endpoints
- [ ] Add CAPTCHA for registration
- [ ] Create user profile page
- [ ] Add workspace creation/joining flow

## Troubleshooting

### "Network Error" when trying to sign in/register
- Make sure backend server is running on port 8080
- Check that `VITE_API_URL` in frontend `.env` matches backend URL
- Verify MongoDB is running

### "CORS Error"
- Check `CLIENT_URL` in backend `.env` matches frontend URL
- Ensure CORS is properly configured in `server.js`

### "Invalid credentials" error
- Verify email and password are correct
- Check that user exists in database
- Ensure password is at least 6 characters

### Protected routes redirecting to sign in
- Check that user data is in localStorage
- Verify AuthContext is providing user correctly
- Check browser console for errors

## Contributing

When adding new features:
1. Follow the existing code structure
2. Add proper TypeScript types
3. Handle errors appropriately
4. Update this README with new features
5. Test authentication flows thoroughly

## License

MIT
