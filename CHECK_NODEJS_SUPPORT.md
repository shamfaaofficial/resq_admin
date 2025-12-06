# How to Check if Hostinger Supports Node.js

## Method 1: Visual Check in hPanel (Easiest)

### Step 1: Login to Hostinger
- Go to https://hpanel.hostinger.com
- Login with your credentials

### Step 2: Check Advanced Section

**Look in the LEFT SIDEBAR under "Advanced":**

```
hPanel Menu
├── Dashboard
├── Websites
├── Email
├── Domains
├── Files
│   ├── File Manager
│   └── FTP Accounts
└── Advanced
    ├── SSH Access
    ├── Cron Jobs
    ├── PHP Configuration
    ├── DNS Zone Editor
    ├── Node.js ← LOOK FOR THIS!
    ├── Python
    └── ...
```

### Result:

✅ **If you see "Node.js":**
- Your plan SUPPORTS Node.js
- You can use the official Node.js manager
- No workarounds needed
- Deployment is easy!

❌ **If you DON'T see "Node.js":**
- Your plan does NOT support Node.js
- You need to use SSH workaround (not recommended)
- Or upgrade to Cloud/VPS plan
- Or use alternative hosting (Render, Railway, etc.)

---

## Method 2: Check Your Plan Details

### Step 1: View Your Subscription

1. In hPanel, click your **profile icon** (top right)
2. Click **"Billing"** or **"Subscriptions"**
3. Find your **hosting plan name**

### Step 2: Check Plan Features

**Hostinger Plans with Node.js Support:**

| Plan Name | Node.js Support |
|-----------|----------------|
| **Single Shared Hosting** | ❌ NO |
| **Premium Shared Hosting** | ❌ NO |
| **Business Shared Hosting** | ❌ NO |
| **Cloud Startup** | ✅ YES |
| **Cloud Professional** | ✅ YES |
| **Cloud Enterprise** | ✅ YES |
| **VPS Plans (all)** | ✅ YES |
| **Minecraft Hosting** | ❌ NO |

**Your Plan: Premium Shared Hosting**
**Node.js Support: ❌ NO** (officially)

---

## Method 3: Check via SSH

If you have SSH access, you can check if Node.js is installed.

### Step 1: Enable SSH

1. hPanel → Advanced → SSH Access
2. Enable if not enabled
3. Note: Username, Host, Port

### Step 2: Connect via SSH

**Windows (PowerShell):**
```bash
ssh -p 65002 your_username@ssh.hostinger.com
```

**Mac/Linux (Terminal):**
```bash
ssh -p 65002 your_username@ssh.hostinger.com
```

Replace:
- `65002` with your SSH port (check hPanel)
- `your_username` with your Hostinger username
- `ssh.hostinger.com` with your SSH host from hPanel

### Step 3: Check Node.js

```bash
# Check if Node.js exists
which node

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Results:

**If you see versions:**
```
node --version
v18.17.0

npm --version
9.6.7
```
✅ Node.js is installed (but may not be officially supported)

**If you see "command not found":**
```
-bash: node: command not found
```
❌ Node.js is NOT installed on shared hosting

---

## Method 4: Contact Hostinger Support

### Ask Support Directly:

1. **Login to hPanel**
2. **Click Support/Help** (bottom left)
3. **Live Chat** or submit ticket
4. **Ask:** "Does my Premium Shared Hosting plan support Node.js applications?"

**They will tell you:**
- If Node.js is supported on your plan
- If you need to upgrade
- What plan you need for Node.js

---

## What to Do Based on Results

### ✅ If You Have Node.js Support:

**Use the official method:**
1. hPanel → Advanced → Node.js
2. Create New Application
3. Configure settings
4. Deploy easily!

**Follow guide:** HOSTINGER_DEPLOYMENT.md

---

### ❌ If You DON'T Have Node.js Support:

**You have 3 options:**

**Option 1: SSH Workaround (Not Recommended)**
- Use PM2 manually via SSH
- Not officially supported
- May stop working
- **Follow:** HOSTINGER_SSH_DEPLOYMENT.md

**Option 2: Upgrade Hostinger Plan**
- Upgrade to Cloud Startup (~$9.99/month)
- Get official Node.js support
- Better resources
- Contact: Hostinger support to upgrade

**Option 3: Use Free Node.js Hosting** (Recommended)
- Deploy to Render.com (FREE)
- Deploy to Railway.app (FREE)
- Keep Hostinger for domain/DNS
- **Follow:** RENDER_DEPLOYMENT.md

---

## Quick Visual Check

**Take screenshot of your hPanel Advanced section and check:**

### ✅ Has Node.js Support:
```
Advanced
├── SSH Access
├── Cron Jobs
├── PHP Configuration
├── Node.js ← THIS IS HERE!
├── Python
└── Cache Manager
```

### ❌ NO Node.js Support:
```
Advanced
├── SSH Access
├── Cron Jobs
├── PHP Configuration
├── DNS Zone Editor
├── Cache Manager
└── (No Node.js option)
```

---

## Summary

**Fastest Way to Check:**
1. Login to hPanel
2. Look at left sidebar → Advanced
3. See "Node.js"? → You have it!
4. Don't see it? → You don't have it

**Based on your earlier screenshot showing:**
- DNS Zone Editor
- PHP Configuration
- Cron Jobs
- SSH Access
- Cache Manager
- GIT
- Password Protect

**But NO "Node.js" option** → Your Premium plan does NOT include Node.js support.

---

## Recommendation

Since you have **Premium Shared Hosting** (no Node.js):

**Best Option:**
- Use **Render.com** for FREE Node.js hosting
- Keep Hostinger for domain management
- Point admin.resq-qa.com to Render via DNS
- **Total Cost: $0 extra**
- **Follow:** RENDER_DEPLOYMENT.md

**OR upgrade to:**
- Hostinger Cloud Startup ($9.99/month)
- Get official Node.js support

Your choice! 🚀
