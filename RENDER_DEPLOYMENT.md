# Deploy RESQ Admin to Render.com (FREE)

## Why Render?
- ✅ **100% FREE** for your app (no credit card required)
- ✅ **Built for Node.js** applications
- ✅ **Automatic deployments** from GitHub
- ✅ **Free SSL/HTTPS** certificate
- ✅ **Custom domain** support (admin.resq-qa.com)
- ✅ **Easy to use** - perfect for beginners

---

## Step-by-Step Deployment Guide

### Prerequisites
- [ ] GitHub account (free)
- [ ] Render.com account (free - sign up with GitHub)
- [ ] Your project code pushed to GitHub

---

## Part 1: Push Your Code to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Name it: `resq-admin`
4. Make it **Private** (recommended)
5. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

**Open terminal/command prompt in your project folder:**

```bash
# Navigate to your project
cd D:\MMM\resq_admin

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/resq-admin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important:** Make sure `.gitignore` file exists so you don't commit:
- `node_modules/`
- `.env`
- Temporary files

---

## Part 2: Deploy to Render

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (easiest)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service

1. Click **"New +"** button
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select **"resq-admin"** repository
5. Click **"Connect"**

### Step 3: Configure Your Service

Fill in these settings:

**Basic Settings:**
- **Name:** `resq-admin` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Singapore, Frankfurt, Oregon)
- **Branch:** `main`
- **Root Directory:** Leave empty (unless code is in subfolder)

**Build & Deploy:**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Instance Type:**
- **Plan:** Select **"Free"**
  - ⚠️ Note: Free plan sleeps after 15 min of inactivity, wakes on request

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section:

Click **"Add Environment Variable"** and add these:

| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `BASE_API_URL` | `https://dev.resq-qa.com` |
| `SESSION_SECRET` | `PASTE_YOUR_GENERATED_SECRET` |

**Generate SESSION_SECRET locally:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as SESSION_SECRET value.

### Step 5: Deploy!

1. Click **"Create Web Service"** button at the bottom
2. Render will start building and deploying your app
3. Wait 2-5 minutes for deployment to complete

**Watch the logs** - you'll see:
```
==> Installing dependencies...
==> Building...
==> Starting server...
Server running on http://localhost:3000
```

### Step 6: Access Your App

Once deployed, you'll get a URL like:
```
https://resq-admin.onrender.com
```

**Test it!** Your app should be live!

---

## Part 3: Connect Custom Domain (admin.resq-qa.com)

### Step 1: Add Custom Domain in Render

1. In your Render dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Custom Domain"** section
4. Click **"Add Custom Domain"**
5. Enter: `admin.resq-qa.com`
6. Click **"Save"**

Render will show you DNS records to add.

### Step 2: Update DNS in Hostinger

1. Login to Hostinger hPanel
2. Go to **Domains** → **DNS Zone Editor**
3. Select `resq-qa.com` domain
4. **Add CNAME Record:**
   - **Type:** `CNAME`
   - **Name:** `admin` (or `@` if using root domain)
   - **Points to:** Copy from Render (e.g., `resq-admin.onrender.com`)
   - **TTL:** `3600` (1 hour)

5. Click **"Add Record"**

### Step 3: Wait for DNS Propagation

- DNS changes take **5 minutes to 24 hours**
- Usually works within **10-30 minutes**
- Check status: https://dnschecker.org

### Step 4: Enable SSL (Automatic)

Render automatically provides **free SSL certificate** via Let's Encrypt.

Once DNS propagates:
- Your site will be accessible at `https://admin.resq-qa.com`
- SSL certificate auto-renews

---

## Part 4: Auto-Deploy on Git Push

**Already configured!** 🎉

Every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Render **automatically** rebuilds and deploys your app!

---

## Managing Your Deployment

### View Logs
1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time application logs

### Restart Service
1. Go to service page
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Or click **"Restart"** under settings

### Update Environment Variables
1. Go to **"Environment"** tab
2. Edit/Add variables
3. Click **"Save Changes"**
4. Service will auto-restart

### Monitor Status
- Dashboard shows: CPU, Memory, Requests
- Email alerts for crashes (optional)

---

## Troubleshooting

### Service won't start

**Check logs for errors:**
- Missing dependencies? Run `npm install` locally
- Syntax errors? Fix in code and push
- Port issues? Render sets PORT automatically

### Can't access custom domain

**DNS not propagated yet:**
- Wait 30 minutes
- Check DNS: https://dnschecker.org
- Verify CNAME points to Render URL

### App is slow (Free tier)

**Free tier sleeps after 15 min inactivity:**
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier ($7/month) for always-on
- Or use UptimeRobot to ping every 14 minutes (free)

### Session issues

**Make sure SESSION_SECRET is set:**
- Check Environment Variables in Render
- Must be different from default value

---

## Upgrading to Paid Plan (Optional)

**If you need always-on service:**

**Starter Plan: $7/month**
- ✅ No sleep/cold starts
- ✅ Faster performance
- ✅ More resources

**To upgrade:**
1. Go to service settings
2. Change instance type to "Starter"
3. Add payment method

---

## Cost Summary

| Feature | Free Plan | Starter Plan |
|---------|-----------|--------------|
| **Price** | $0/month | $7/month |
| **RAM** | 512 MB | 512 MB |
| **Sleeps** | Yes (15 min) | No |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Free | ✅ Free |
| **Auto-deploy** | ✅ Yes | ✅ Yes |

**Free plan is perfect for:**
- Development/staging
- Low-traffic apps
- Internal admin tools

---

## Alternative Free Platforms

If Render doesn't work for you:

### Railway.app
- Similar to Render
- $5 free credit monthly
- Easy deployment

### Fly.io
- Free tier available
- More configuration required
- Good for multiple regions

### Vercel
- Best for Next.js/static sites
- Can adapt Node.js apps (requires changes)

---

## Quick Command Reference

```bash
# Deploy updates
git add .
git commit -m "Your update message"
git push

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check if app is running
curl https://resq-admin.onrender.com

# View logs (from Render dashboard)
# Logs tab in Render service page
```

---

## Support

**Render Documentation:**
- https://render.com/docs

**Need Help?**
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

## Summary

✅ Push code to GitHub
✅ Create Render account
✅ Connect repository
✅ Configure environment variables
✅ Deploy (automatic)
✅ Add custom domain
✅ Update DNS in Hostinger
✅ Done! App is live

**Total time: 10-15 minutes**
**Cost: FREE** 🎉
