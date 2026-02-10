# AuthSystem

A **production-ready authentication system** built with Node.js, Express, and MongoDB.  
Supports **normal email/password login**, **Google OAuth**, **OTP-based registration**, **password reset**, **rate limiting**, and more.

---

## Features ✅

- **User Authentication**
  - Register with email/password + OTP verification
  - Login with email/password
  - Login/Register with Google OAuth

- **Security**
  - Password hashing with `bcryptjs`
  - JWT-based authentication
  - Account lockout after 3 failed login attempts
  - Warning after 2 failed login attempts
  - IP-based rate limiting (startup-friendly)
  - CSRF protection (planned for frontend integration)

- **Password Management**
  - Forgot password (OTP-based or token-based reset)
  - Reset password functionality

- **User Roles**
  - Role-based access (`user`, `admin`)
  - Admin-only protected routes

- **Cookies**
  - HTTP-only JWT cookie for secure authentication

- **Utilities**
  - Nodemailer for sending OTPs and password reset emails
  - MongoDB/Mongoose for database management

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, bcrypt, Google OAuth
- **Email:** Nodemailer (Gmail SMTP)
- **Rate Limiting:** Express-rate-limit
- **Environment Management:** dotenv
- **Dev Tools:** Nodemon, ES Modules

---

## Installation

1. Clone the repo:

```bash
git clone https://github.com/Suvesh0707/AuthSystem.git
cd AuthSystem/backend

npm install

PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=10d
EMAIL_USER=<your-gmail>
EMAIL_PASS=<gmail-app-password>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_CALLBACK_URL=<callback-url>
CLIENT_URL=http://localhost:5173
NODE_ENV=development

Start server:

npm run dev
