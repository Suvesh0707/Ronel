# Perfume Upload Feature - Testing Guide

## Changes Made

### 1. **Updated Multer Configuration** (`middleware/upload.js`)
- Replaced `express-fileupload` with `multer`
- Added proper storage configuration for disk storage
- Added file filter to validate only image files (jpeg, png, webp, gif)
- File size limit: 5MB
- Creates `/uploads` directory automatically

### 2. **Fixed Perfume Controller** (`controllers/perfume.controller.js`)
- Fixed empty response `{}` issue by adding `return` statements
- Proper error handling with JSON responses
- Cloudinary integration with local file cleanup
- Added `createdBy` field to track which admin created the perfume
- Better error messages for debugging

### 3. **Updated Perfume Routes** (`routes/perfume.routes.js`)
- Changed to `upload.array("images", 10)` for proper multer handling
- Allows up to 10 images per request
- Fixed route order (trending route before :id to avoid conflicts)

### 4. **Enhanced Express Configuration** (`index.js`)
- Increased JSON payload limit to 10mb
- Added URL encoded limit
- Better error handling setup

### 5. **Removed Dependency**
- Removed `express-fileupload` from package.json (no longer needed)

---

## How to Test

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Test with Postman

#### Create New Request
- **Method:** POST
- **URL:** `http://localhost:3000/api/perfumes`
- **Headers:** 
  - Authorization: `Bearer <your_admin_token>`

#### Set Form Data
Go to **Body** → **form-data** and add:

| Key | Value | Type |
|-----|-------|------|
| name | Oud Perfume | text |
| price | 500 | text |
| fragranceType | oud | text |
| intensity | strong | text |
| volume | 100 | text |
| stock | 50 | text |
| description | Premium oud fragrance | text |
| images | [Select image file] | file |
| images | [Select another image] | file |

**Note:** You can add multiple images by clicking "Add" multiple times for the "images" key

#### Expected Response (Success)
```json
{
  "success": true,
  "perfume": {
    "_id": "...",
    "name": "Oud Perfume",
    "price": 500,
    "fragranceType": "oud",
    "intensity": "strong",
    "volume": 100,
    "stock": 50,
    "description": "Premium oud fragrance",
    "images": [
      "https://res.cloudinary.com/...",
      "https://res.cloudinary.com/..."
    ],
    "isActive": true,
    "createdAt": "2024-01-21T...",
    "updatedAt": "2024-01-21T..."
  }
}
```

#### Expected Response (Error - No Images)
```json
{
  "success": false,
  "message": "Please upload at least one image"
}
```

#### Expected Response (Error - Missing Fields)
```json
{
  "success": false,
  "message": "Please fill all required fields"
}
```

#### Expected Response (Error - Invalid Image)
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, png, webp, gif)"
}
```

---

## Troubleshooting

### Issue: "images is not defined"
- Make sure you're sending form-data, not JSON
- Field name must be exactly "images"

### Issue: "Cloudinary upload failed"
- Check `.env` file has correct `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Verify Cloudinary credentials are valid

### Issue: "File too large"
- Maximum file size is 5MB
- Reduce image size or compress before uploading

### Issue: "Unauthorized"
- Make sure you have admin token in Authorization header
- Token format: `Bearer <token>`

---

## Updated Request Format

### Using cURL
```bash
curl -X POST http://localhost:3000/api/perfumes \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=Oud Perfume" \
  -F "price=500" \
  -F "fragranceType=oud" \
  -F "intensity=strong" \
  -F "volume=100" \
  -F "stock=50" \
  -F "description=Premium oud fragrance" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('name', 'Oud Perfume');
formData.append('price', 500);
formData.append('fragranceType', 'oud');
formData.append('intensity', 'strong');
formData.append('volume', 100);
formData.append('stock', 50);
formData.append('description', 'Premium oud fragrance');
formData.append('images', fileInput1);
formData.append('images', fileInput2);

fetch('http://localhost:3000/api/perfumes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Key Files Modified
- `backend/middleware/upload.js` - Multer configuration
- `backend/controllers/perfume.controller.js` - Fixed controller logic
- `backend/routes/perfume.routes.js` - Updated routes
- `backend/index.js` - Enhanced configuration
- `backend/package.json` - Removed express-fileupload
