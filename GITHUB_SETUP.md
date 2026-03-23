# 📌 GitHub Setup - Step by Step

**Status**: Local commit created ✅  
**Next**: Push to GitHub + Connect to Vercel

---

## Step 1: Create GitHub Repository

### 1a. Go to GitHub
- Open: https://github.com/new
- OR log in to https://github.com (if not already)
- Click "+" → "New repository"

### 1b. Create Repository

Fill in these details:

```
Repository name: khai
Description: Student productivity app - track expenses, goals, study time, and scheduling

Public / Private: Choose one
  - Public: Anyone can see/fork (good for portfolio)
  - Private: Only you can see (if sensitive)

Initialize: NO checkmarks
  - ❌ Don't add README
  - ❌ Don't add .gitignore
  - ❌ Don't add license
```

Then click: **"Create repository"**

### 1c. Copy Your Repository URL

After creation, GitHub shows a page with commands.

**Copy this URL:**
```
https://github.com/[YOUR_USERNAME]/khai.git
```

(It will be listed as "HTTPS" option)

---

## Step 2: Push Local Code to GitHub

Run these commands in terminal:

```bash
cd /Users/mac/Personal/Khai

git remote add origin https://github.com/[YOUR_USERNAME]/khai.git

git branch -M main

git push -u origin main
```

⚠️ **Replace `[YOUR_USERNAME]` with your actual GitHub username!**

**Example:**
```bash
git remote add origin https://github.com/john-doe/khai.git
```

---

## Step 3: Verify Push Succeeded

```bash
git status
```

Should show:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

✅ Your code is now on GitHub!

---

## Step 4: Connect to Vercel

1. Go to: https://vercel.com
2. Sign up/login (GitHub login recommended)
3. Click: **"New Project"**
4. Click: **"Import Git Repository"**
5. Select your **`khai`** repository from the list

If it doesn't show:
- Check GitHub is connected (Settings → Git Integration)
- Or manually enter: `https://github.com/[YOUR_USERNAME]/khai.git`

---

## Step 5: Configure Vercel Build

After selecting repo, Vercel shows build settings:

```
Framework: Leave blank (or select "Expo")
Root Directory: .
Build Command: expo export --platform web
Output Directory: dist
```

**Environment Variables:**
Add these (find values in `/Users/mac/Personal/Khai/.env`):

```
EXPO_PUBLIC_SUPABASE_URL = [copy from .env]
EXPO_PUBLIC_SUPABASE_ANON_KEY = [copy from .env]
```

Then click: **"Deploy"**

---

## Step 6: Wait for Build

Vercel will:
1. Pull code from GitHub
2. Run: `expo export --platform web`
3. Upload `dist/` folder
4. Deploy to CDN

**Takes ~2-3 minutes**

---

## ✅ Success!

When done, Vercel shows:
```
✓ Production Deployment Ready
Your site is live at: https://khai.vercel.app
```

---

## 🎁 Auto-Deploy Magic

Now whenever you:
```bash
git push origin main
```

Vercel automatically:
1. Pulls latest code
2. Rebuilds
3. Deploys new version

**No manual steps needed!** 🚀

---

## 📞 Stuck?

### "I don't have a GitHub account"
- Go to https://github.com/signup
- Create account (free)
- Then come back to Step 1

### "Push failed: Permission denied"
```bash
# Check SSH key setup:
ssh -T git@github.com

# If not working, use personal access token instead of HTTPS
```

### "Vercel can't see my GitHub repo"
- Check: Settings → Applications → Vercel has access
- Disconnect and reconnect GitHub in Vercel settings

### "Build failed on Vercel"
- Check Vercel build logs
- Common issue: `dist/` folder not created
- Solution: Run `expo export --platform web` locally first

---

## 🎯 Next Steps After Deployment

1. **Test your live app**
   - Open: https://khai.vercel.app
   - Test all features
   - Check mobile view

2. **Deploy Android**
   - Follow: DEPLOY_ANDROID.md
   - Takes 2-3 hours

3. **Fix Web Data Persistence (v1.0.1)**
   - Follow: ARCHITECTURE_IMPROVEMENTS.md
   - Add localStorage
   - Takes 2-3 hours

4. **Monitor & Iterate**
   - Share URL with users
   - Collect feedback
   - Plan v1.1 features

---

**Ready? Follow the steps above, then reply when Vercel shows "Deployment Ready"! 🚀**

