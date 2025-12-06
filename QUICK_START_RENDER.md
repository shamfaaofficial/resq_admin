# Quick Start: Deploy to Render in 20 Minutes

## Prerequisites
- GitHub account (create free at github.com if you don't have one)
- Your code is in D:\MMM\resq_admin

---

## Step 1: Push Code to GitHub (5 minutes)

### A. Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Repository name: `resq-admin`
4. Set to **Private** (recommended)
5. **Do NOT** initialize with README
6. Click **"Create repository"**

### B. Push Your Code

**Open Command Prompt or PowerShell in your project folder:**

```bash
# Navigate to your project
cd D:\MMM\resq_admin

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Add your GitHub repository
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/resq-admin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If asked for credentials:** Use your GitHub username and Personal Access Token (not password)

**To create token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select: `repo` scope
4. Copy token and use as password

---

## Step 2: Deploy to Render (10 minutes)

### A. Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest!)
4. Authorize Render to access your GitHub

### B. Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find **"resq-admin"** in the list
5. Click **"Connect"**

### C. Configure Service

**Fill in these settings:**

**Name:** `resq-admin` (or any name you want)

**Region:** Choose closest to you:
- Singapore (Asia)
- Frankfurt (Europe)
- Oregon (USA West)

**Branch:** `main`

**Root Directory:** (leave empty)

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `node server.js`

**Instance Type:** Select **"Free"**

### D. Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** for each:

**Variable 1:**
- Key: `PORT`
- Value: `3000`

**Variable 2:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 3:**
- Key: `BASE_API_URL`
- Value: `https://dev.resq-qa.com`

**Variable 4:**
- Key: `SESSION_SECRET`
- Value: (Generate using command below)

**Generate SESSION_SECRET:**

Open terminal/cmd and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (long random string) and paste as SESSION_SECRET value.

### E. Deploy!

1. Click **"Create Web Service"** at the bottom
2. Wait 2-5 minutes while Render builds and deploys
3. Watch the logs - you'll see:
   ```
   ==> Installing dependencies
   ==> Building...
   ==> Starting server
   Server running on http://localhost:3000
   ```

4. Once deployed, you'll get a URL like:
   ```
   https://resq-admin.onrender.com
   ```

5. **Test it!** Click the URL - your app should work!

---

## Step 3: Connect Custom Domain (5 minutes)

### A. Add Domain in Render

1. In your Render service page, click **"Settings"** tab
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `admin.resq-qa.com`
5. Click **"Save"**

**Render will show you:**
```
Add a CNAME record:
Name: admin
Value: resq-admin.onrender.com
```

### B. Update DNS in Hostinger

1. Login to Hostinger hPanel
2. Go to **Domains** → **DNS Zone Editor**
3. Select your domain: `resq-qa.com`
4. Look for existing **admin** record
   - If exists: **Delete** it
5. Click **"Add Record"**
6. Fill in:
   - **Type:** `CNAME`
   - **Name:** `admin`
   - **Points to:** `resq-admin.onrender.com` (from Render)
   - **TTL:** `3600`
7. Click **"Add Record"**

### C. Wait for DNS Propagation

- Takes **5-30 minutes** usually
- Check status: https://dnschecker.org
- Search for: `admin.resq-qa.com`

Once propagated, access your app at:
```
https://admin.resq-qa.com
```

✅ **SSL certificate is automatically provided by Render!**

---

## Done! 🎉

Your app is now live at:
- https://resq-admin.onrender.com (Render URL)
- https://admin.resq-qa.com (Your custom domain)

---

## Future Updates

**To deploy updates:**

```bash
# Make changes to your code
# Then:

git add .
git commit -m "Update feature"
git push
```

**Render automatically rebuilds and deploys!** 🚀

---

## Troubleshooting

### Build fails
- Check logs in Render dashboard
- Verify package.json is correct
- Check for syntax errors

### App crashes on start
- Check environment variables are set
- View logs: Render → Logs tab
- Make sure SESSION_SECRET is set

### Custom domain not working
- Wait 30 minutes for DNS
- Check CNAME record in Hostinger
- Verify it points to: `resq-admin.onrender.com`

### 502/503 errors
- Check if app is running: Render → Logs
- Restart: Render → Manual Deploy → Deploy latest commit

---

## Cost

**Free Plan:**
- ✅ $0/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Wakes up in ~30 seconds on first request

**For always-on (optional):**
- Upgrade to Starter: $7/month
- No sleep, faster performance

---

## Need Help?

If you get stuck:
1. Check Render logs
2. Verify environment variables
3. Make sure code is pushed to GitHub
4. Check DNS settings in Hostinger

Ready? Let's do this! 🚀
