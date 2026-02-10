# AuthSystem Setup Guide for Friends

## Quick Start Guide

If you're getting errors like:
- `GET data:;base64,= net::ERR_INVALID_URL`
- `404 (Not Found)` on `/api/health`
- `503 (Service Unavailable)` on payment orders

Follow these steps:

### Step 1: Extract and Navigate
```bash
# Extract the zip file
# Open terminal/PowerShell in the extracted folder
cd authSystem
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# Create a file named .env with this content:
```

Create `backend/.env` with:
```env
PORT=3000
DB_URI=mongodb://localhost:27017/authsystem
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important**: 
- You need MongoDB running locally (`mongodb://localhost:27017`) or use a MongoDB Atlas connection string
- For payment features, you need a Razorpay account
- For image uploads, you need a Cloudinary account

```bash
# Start backend server
npm start
# You should see: "server is running on port : 3000"
```

### Step 3: Frontend Setup

In a NEW terminal:
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file (if needed)
# Create a file named .env.local with:
VITE_API_URL=http://localhost:3000/api

# Start frontend server
npm run dev
# You should see: "Local: http://localhost:5173"
```

### Step 4: Verify Setup

1. Open browser to `http://localhost:5173`
2. Check the Footer - it should show a green health status if backend is connected
3. No more 404 or data URL errors should appear

## Troubleshooting

### Error: `Cannot connect to MongoDB`
- Make sure MongoDB is running
- Check `DB_URI` in `.env` is correct
- Install MongoDB Community from mongodb.com if needed

### Error: `Razorpay keys not set`
- This is a warning, not an error
- Payment will fail but other features work
- Get keys from razorpay.com dashboard

### Error: Still seeing 404 on /api/health
- Make sure backend is running (`npm start` in backend folder)
- Make sure frontend is pointing to correct API URL (http://localhost:3000/api)
- Check CORS is enabled (should be working out of the box)

### Images not loading / data:;base64 error
- This is now fixed
- Images will show fallback perfume image if upload fails
- Make sure Cloudinary is configured for uploads

## Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| PORT | Backend server port | Yes (default 3000) |
| DB_URI | MongoDB connection | Yes |
| JWT_SECRET | Token signing key | Yes |
| RAZORPAY_KEY_ID | Razorpay merchant ID | For payments only |
| RAZORPAY_KEY_SECRET | Razorpay secret | For payments only |
| CLOUDINARY_* | Image upload service | For uploads only |

## File Structure

```
authSystem/
├── backend/          ← Start here: npm start
│   └── .env         ← Create this with your keys
├── frontend/        ← Start here: npm run dev
│   └── .env.local   ← Create this if using custom API URL
```

## Getting Credentials

### MongoDB
1. Option A: Use local MongoDB (download from mongodb.com)
2. Option B: Use MongoDB Atlas (cloud - free tier available)
   - Sign up at mongodb.com/cloud/atlas
   - Create cluster
   - Copy connection string to DB_URI

### Razorpay
1. Sign up at razorpay.com
2. Go to Settings > API Keys
3. Copy Key ID and Key Secret

### Cloudinary
1. Sign up at cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name and API Key

## Common Issues Checklist

- [ ] Both `npm install` completed without errors
- [ ] `.env` file exists in backend folder
- [ ] MongoDB is running
- [ ] Backend starts without errors (`npm start`)
- [ ] Frontend can access http://localhost:3000/api/health
- [ ] No data URL errors in console
- [ ] Footer shows green connection status

## Still Having Issues?

Check the browser console (F12) for specific error messages. Share the exact error with what step you're stuck on.
