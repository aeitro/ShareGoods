# ShareGoods Backend

This is the backend for the ShareGoods application, providing authentication and user registration functionality.

## Features

- User registration for Donors, Individuals, and NGOs
- Email/password authentication with JWT
- Google Sign-In using Firebase Auth
- Password reset via email
- Role-based access control
- Protected routes
- MongoDB database integration with Mongoose
- Input validation using Joi
- Password hashing with bcrypt
- CORS enabled for frontend integration
- Centralized error handling

## Folder Structure

```
/backend
  /authentication
    /controllers - Business logic for each route
    /routes - API route definitions
    /validators - Input validation schemas
    /models - Mongoose data models
    /middleware - Express middleware functions
    /utils - Utility functions and classes
  index.js - Main entry point
  .env - Environment variables
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Rename `.env.example` to `.env` (if needed)
   - Update the MongoDB connection string and other variables as needed

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Registration

- **POST /api/register/donor** - Register a new donor
- **POST /api/register/individual** - Register a new individual recipient
- **POST /api/register/ngo** - Register a new NGO recipient

### Authentication

- **POST /api/login** - Login with email and password
- **POST /api/auth/google** - Login with Google
- **POST /api/auth/forgot-password** - Request password reset
- **POST /api/auth/reset-password** - Reset password with token

### Protected Routes

- **GET /api/protected/profile** - Access user profile (all authenticated users)
- **GET /api/protected/admin** - Admin-only route
- **GET /api/protected/donor** - Donor-only route
- **GET /api/protected/ngo** - NGO-only route
- **GET /api/protected/individual** - Individual-only route

### Health Check

- **GET /api/health** - Check if the authentication service is running

## Admin Registration

To create an admin account, you need to manually insert it into the MongoDB database:

1. Connect to your MongoDB database
2. Insert a new user document with role set to 'ADMIN'
3. Ensure the password is properly hashed using bcrypt

## Testing Data

### Registration

#### Donor Registration

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "password": "password123",
  "address": "123 Main St, City, Country"
}
```

#### Individual Registration

```json
{
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "9876543210",
  "password": "Password205",
  "address": "456 Oak St, City, Country"
}
```

#### NGO Registration

```json
{
  "fullName": "Helping Hands NGO",
  "email": "contact@helpinghands.org",
    "phone": "5555555555",
    "password": "password123",
    "address": "789 Pine St, City, Country",
    "registrationNumber": "NGO12345"
}
```

### Login

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "rememberMe": true
}
```

### Google Auth

For Google Sign-In, you need to:

1. Set up Firebase in your frontend
2. Get the ID token from Firebase Auth
3. Send the ID token to the backend

```json
{
  "idToken": "firebase_id_token_here"
}
```

### Forgot Password

```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## Authentication Flow

1. **Registration**: User registers with email/password or Google Sign-In
2. **Login**: User logs in and receives a JWT token
3. **Protected Routes**: User includes the JWT token in the Authorization header for protected routes
   - Format: `Authorization: Bearer <token>`

## Frontend Integration

The backend is configured to work with the frontend running at http://localhost:3000 by default. You can change this in the .env file if needed.