# 🔍 Detailed Error Breakdown & Solutions

## Compilation Errors

### Error Set 1: Missing Dependencies in authController.ts

```
File: /backend/src/controllers/authController.ts
Line 2: import jwt from 'jsonwebtoken';
Error: Cannot find module 'jsonwebtoken' or its corresponding type declarations.

Line 3: import User from '../models/User.js';
Error: Cannot find module '../models/User.js' or its corresponding type declarations.
```

#### Why This Happens

The `authController.ts` file was written when the system had user authentication. Looking at the evidence:

1. **models/User.ts doesn't exist** - Only these models are present:
   - `Expense.ts`
   - `Goal.ts`
   - `Schedule.ts`
   - `StudySession.ts`

2. **Dependencies not installed** - `backend/package.json` doesn't include:
   - `jsonwebtoken`
   - `@types/jsonwebtoken`
   - `bcryptjs` (usually needed with auth)

3. **Routes are empty** - `backend/src/routes/userRoutes.ts`:
   ```typescript
   import express from 'express';
   const router = express.Router();
   // Removed authentication-related routes
   export default router;
   ```

4. **Not imported in server** - `backend/src/server.ts` doesn't import auth routes

#### How to Verify

```bash
# Check if User model exists
ls -la backend/src/models/
# Output: Expense.ts Goal.ts Schedule.ts StudySession.ts
# (NO User.ts)

# Check if jwt is installed
cat backend/package.json | grep jsonwebtoken
# (Nothing - not installed)

# Check if auth controller is used anywhere
grep -r "authController" backend/src/
# (Likely returns nothing - not used)
```

#### Solution 1: Delete Dead Code (RECOMMENDED)

```bash
# Delete the orphaned controller
rm backend/src/controllers/authController.ts

# Keep userRoutes.ts but ensure it's properly formatted
cat > backend/src/routes/userRoutes.ts << 'EOF'
import express from 'express';

const router = express.Router();

// Authentication routes removed - handled by frontend
// This file is kept for future extensibility

export default router;
EOF
```

#### Solution 2: Implement Full Authentication (Advanced)

Only do this if you want to add authentication back:

```bash
# Install required packages
cd backend
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken

# Create User model
cat > src/models/User.ts << 'EOF'
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
EOF

# Connect routes in server.ts
# Add: app.use('/api/users', userRoutes);
```

---

## Build Configuration Errors

### Error Set 2: TypeScript ES Module Configuration Mismatch

**File:** `backend/tsconfig.json`

**Current:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": false
  }
}
```

**Problem:**

```
When "type": "module" is in package.json (ES modules enabled)
AND "verbatimModuleSyntax": false in tsconfig.json
THEN TypeScript may:
  ❌ Strip necessary .js extensions from imports
  ❌ Cause "Cannot find module" errors at runtime
  ❌ Break in Node.js ES module environment
```

#### Evidence in Project

**backend/package.json:**
```json
{
  "name": "backend",
  "type": "module",  // <- This enables ES modules
  "scripts": {
    "start": "node dist/server.js"  // <- Runs compiled output as ES module
  }
}
```

**backend/src/server.ts:**
```typescript
import connectDB from './config/db.js';  // <- Explicit .js extension
import expenseRoutes from './routes/expenseRoutes.js';
```

The `.js` extensions in imports are **required** for ES modules in Node.js but TypeScript's `verbatimModuleSyntax: false` might remove them during compilation, causing runtime failures.

#### Solution

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true  // <- CHANGE: From false to true
  },
  "include": ["src/**/*"]
}
```

---

## Deployment Configuration Errors

### Error Set 3: Root vercel.json Incorrect for Monorepo

**File:** `/vercel.json`

**Current Content:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Problems with Current Config

1. **Framework Mismatch**
   - Config is for SPA (Single Page Applications)
   - Appropriate for: Next.js, CRA (Create React App), Vue, etc.
   - **Wrong for Expo** which has its own build process

2. **Monorepo Not Recognized**
   - Vercel won't know about `frontend/` and `backend/` folders
   - It will treat root as the deployment root
   - Will fail to find `package.json` (it's in frontend/ and backend/)

3. **Backend Not Configured**
   - Render deployment configured separately ✓
   - But Vercel config doesn't acknowledge this
   - Creates confusion about deployment flow

#### How This Causes Deployment Failure

```
1. Vercel receives: git push
2. Vercel reads: /vercel.json
3. Vercel tries: npm install (looks for package.json in root - NOT FOUND ❌)
4. Vercel tries: npm run build (no build script at root ❌)
5. Result: Build fails
```

#### Solution 1: Delete Root vercel.json (SIMPLE)

```bash
rm /vercel.json
```

Instead, use:
- **Frontend deployment**: Vercel with `frontend/vercel.json`
- **Backend deployment**: Render with `render.yaml`

#### Solution 2: Proper Monorepo Config (ADVANCED)

If you want single vercel.json in root:

```json
{
  "projects": [
    {
      "rootDirectory": "frontend",
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "name": "khai-frontend",
      "env": {
        "EXPO_PUBLIC_API_URL": "@khai-backend-url"
      }
    }
  ]
}
```

---

### Error Set 4: Frontend Build Output Mismatch

**Files Involved:**
- `frontend/vercel.json`
- `frontend/package.json`
- `frontend/tsconfig.json`

**Current frontend/vercel.json:**
```json
{
  "outputDirectory": "dist"
}
```

**Current frontend/package.json:**
```json
{
  "scripts": {
    "build": "expo export -p web"
  }
}
```

#### Problem

- `vercel.json` expects output in `dist/`
- Expo builds to different location
- Vercel won't find the built files

#### Solution

Update `frontend/vercel.json`:
```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "EXPO_PUBLIC_API_URL": "@khai-backend-api"
  }
}
```

Or let Vercel auto-detect (delete the file and Vercel will handle it).

---

## Runtime Configuration Errors

### Error Set 5: Missing Environment Variables

**Impact:** Deployment may succeed but app fails at runtime

#### Backend Needs (render.yaml)

**File:** `backend/.env`

**Required Variables:**
```bash
# Database connection (CRITICAL - without this, app crashes on startup)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/khai

# Server configuration
PORT=10000
NODE_ENV=production

# Optional but recommended
LOG_LEVEL=info
JWT_SECRET=your-secret-here  # Only if re-adding auth
```

**How to Verify:**
```bash
# Check what's currently set
cat backend/.env

# Required check:
grep -E "^MONGO_URI=" backend/.env
# Should output something like:
# MONGO_URI=mongodb+srv://...
```

**Deployment Setup (Render):**
1. Go to render.yaml `envVars` section
2. Verify `MONGO_URI` is set in Render dashboard
3. Or add to render.yaml:
   ```yaml
   envVars:
     - key: MONGO_URI
       scope: runtime
   ```

#### Frontend Needs (Vercel)

**File:** `frontend/.env`

**Required Variables:**
```bash
# API URL pointing to your Render backend
EXPO_PUBLIC_API_URL=https://khai-backend.onrender.com/api
```

**How Vercel uses this:**
1. Sets env var during build
2. Frontend code accesses via `process.env.EXPO_PUBLIC_API_URL`
3. API client (frontend/src/services/api.ts) uses it

**Current Code in api.ts:**
```typescript
const getBaseUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
  // ...
};
```

**Deployment Setup (Vercel):**
1. Go to Vercel project settings
2. Add environment variable:
   - Key: `EXPO_PUBLIC_API_URL`
   - Value: `https://khai-backend.onrender.com/api`

---

## Common Runtime Errors & Fixes

### Runtime Error 1: "Cannot connect to MongoDB"

**Error Message:**
```
Error: connect ECONNREFUSED
Error: E11000 duplicate key error
MongoNetworkError: failed to connect
```

**Causes & Solutions:**

| Cause | Check | Fix |
|-------|-------|-----|
| MONGO_URI not set | `echo $MONGO_URI` | Add to Render env |
| Wrong MONGO_URI | Check connection string | Update in Render |
| MongoDB Atlas firewall | Test connection | Add Render IP to whitelist |
| Typo in connection string | Verify carefully | Re-enter correct string |

**Test Locally:**
```bash
cd backend
MONGO_URI="your-mongodb-uri" npm run dev
# Should see: "MongoDB Connected: cluster..."
```

### Runtime Error 2: "Frontend can't reach backend"

**Error Pattern:**
```
GET https://localhost:5001/api/expenses 
CORS error: blocked
```

**Causes & Solutions:**

| Cause | Evidence | Fix |
|-------|----------|-----|
| Wrong API URL | Frontend console shows `localhost:5001` | Update `EXPO_PUBLIC_API_URL` |
| Backend not running | GET request times out | Start backend on Render |
| CORS issue | Console shows CORS error | Backend has CORS enabled ✓ |

**Test Locally:**
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Should see: "Server running on port 10000"

# Terminal 2: Frontend test
curl http://localhost:10000/
# Should see: "Khai API is running..."
```

### Runtime Error 3: "authMiddleware not found"

**Why This Won't Happen:**
- Current routing doesn't use authMiddleware
- All routes are public
- User authentication is handled on frontend only

**If you see this:** Someone added auth-protected routes without the middleware.

---

## Verification Script

**Run this to verify everything:**

```bash
#!/bin/zsh

echo "🔍 Khai Project Verification"
echo "======================================"

# Check 1: authController exists
if [ -f "backend/src/controllers/authController.ts" ]; then
    echo "❌ authController.ts exists - should be deleted"
else
    echo "✅ authController.ts deleted"
fi

# Check 2: TypeScript config
if grep -q '"verbatimModuleSyntax": true' backend/tsconfig.json; then
    echo "✅ tsconfig.json has correct verbatimModuleSyntax"
else
    echo "⚠️  tsconfig.json has verbatimModuleSyntax: false"
fi

# Check 3: Backend builds
cd backend
if npm run build > /dev/null 2>&1; then
    echo "✅ Backend builds successfully"
else
    echo "❌ Backend build fails"
fi
cd ..

# Check 4: Environment variables
echo ""
echo "📋 Environment Variables:"
echo "Backend:"
[ -f "backend/.env" ] && grep "MONGO_URI" backend/.env && echo "✅ MONGO_URI set" || echo "❌ MONGO_URI missing"
echo "Frontend:"
[ -f "frontend/.env" ] && grep "EXPO_PUBLIC_API_URL" frontend/.env && echo "✅ API_URL set" || echo "❌ API_URL missing"

# Check 5: Root vercel.json
if [ -f "vercel.json" ]; then
    echo "⚠️  Root vercel.json exists - consider deleting"
else
    echo "✅ Root vercel.json deleted"
fi

echo ""
echo "======================================"
echo "Verification complete!"
```

---

## Summary Table

| Error | File | Line | Type | Status | Fix Time |
|-------|------|------|------|--------|----------|
| Missing `jsonwebtoken` | authController.ts | 2 | Compilation | 🔴 Critical | 1 min |
| Missing `User` model | authController.ts | 3 | Compilation | 🔴 Critical | 1 min |
| Wrong vercel.json | /vercel.json | - | Config | 🔴 Critical | 2 min |
| Wrong verbatimModuleSyntax | tsconfig.json | 8 | Config | 🟠 Warning | 1 min |
| Missing env vars | .env files | - | Runtime | 🟠 Warning | 3 min |
| Build output mismatch | frontend/vercel.json | 2 | Config | 🟡 Info | 2 min |

**Total Fix Time:** ~10 minutes ⚡

---

**Generated:** March 27, 2026
