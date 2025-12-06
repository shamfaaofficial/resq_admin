# Deploy Node.js App on Hostinger Premium via SSH

## ⚠️ Important Notes

- Hostinger Premium doesn't officially support Node.js applications
- This is a manual workaround using SSH access
- Hostinger may restart/kill your process
- Not recommended for production, but can work

---

## Prerequisites

- ✅ SSH Access enabled in Hostinger
- ✅ FTP credentials
- ✅ Your files uploaded to Hostinger

---

## Step 1: Enable SSH Access

1. Login to Hostinger **hPanel**
2. Go to **Advanced** → **SSH Access**
3. **Enable SSH** if not already enabled
4. Note down:
   - **SSH Host**: Usually `ssh.hostinger.com` or your server IP
   - **SSH Port**: Usually `65002` (not 22!)
   - **Username**: Your hosting username
   - **Password**: Your hosting password

---

## Step 2: Upload Your Files via FTP

### Files to Upload:

```
public_html/resq-admin/  (or your chosen folder)
├── assets/
├── middleware/
├── public/
├── views/
├── server.js
├── package.json
├── package-lock.json
└── .env
```

**DO NOT upload:**
- `node_modules/` (will install on server)
- `.git/`
- `.htaccess` (not needed)

### Upload via FileZilla:

1. Open FileZilla
2. Host: Your FTP host from Hostinger
3. Username: FTP username
4. Password: FTP password
5. Port: 21
6. Connect
7. Navigate to `public_html/`
8. Create folder: `resq-admin/`
9. Upload all files into this folder

---

## Step 3: Create .env File on Server

**Via FileZilla or File Manager, create `.env` file:**

```env
PORT=3000
NODE_ENV=production
BASE_API_URL=https://dev.resq-qa.com
SESSION_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE
```

**Generate SESSION_SECRET locally:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Connect via SSH

### On Windows (Using PowerShell or CMD):

```bash
ssh -p 65002 your_username@ssh.hostinger.com
```

Replace:
- `65002` with your SSH port (check hPanel)
- `your_username` with your Hostinger username
- `ssh.hostinger.com` with your SSH host

**Enter password when prompted**

### On Mac/Linux (Using Terminal):

```bash
ssh -p 65002 your_username@ssh.hostinger.com
```

---

## Step 5: Check Node.js Version

```bash
# Check if Node.js is installed
node --version

# Check npm version
npm --version
```

**If Node.js is not installed or version is old:**
```bash
# Hostinger Premium usually has Node.js pre-installed
# If not, you may need to contact support or upgrade plan
```

**Minimum required:** Node.js 16.x or higher

---

## Step 6: Navigate to Your App Directory

```bash
# List your directories
ls

# Navigate to your app folder
cd public_html/resq-admin

# or if different path:
cd domains/admin.resq-qa.com/public_html

# Verify files are there
ls -la
```

You should see:
- server.js
- package.json
- .env
- All folders (assets, middleware, public, views)

---

## Step 7: Install Dependencies

```bash
# Install all dependencies
npm install --production

# Wait for installation to complete (2-5 minutes)

# Verify node_modules folder was created
ls -la
```

---

## Step 8: Test Run Your App

```bash
# Try running the app
node server.js
```

**If successful, you'll see:**
```
Server running on http://localhost:3000
```

**Press `Ctrl + C` to stop** (we'll use PM2 next to keep it running)

**If errors:**
- Check `.env` file exists
- Check all dependencies installed
- Fix any errors shown

---

## Step 9: Install PM2 (Process Manager)

PM2 keeps your app running even after you close SSH.

```bash
# Install PM2 globally
npm install -g pm2

# Verify PM2 installed
pm2 --version
```

**If permission error:**
```bash
# Install PM2 locally in your project
npm install pm2 --save-dev

# Use npx to run PM2
npx pm2 --version
```

---

## Step 10: Start App with PM2

```bash
# Start your app
pm2 start server.js --name "resq-admin"

# Check if it's running
pm2 status

# View logs
pm2 logs resq-admin

# To stop viewing logs, press Ctrl + C
```

**Make PM2 restart on server reboot:**
```bash
# Generate startup script
pm2 startup

# Save current PM2 processes
pm2 save
```

---

## Step 11: Configure Reverse Proxy (.htaccess)

Your app runs on port 3000, but visitors access port 80/443. Need proxy.

### Create/Edit .htaccess in public_html root:

**Via SSH:**
```bash
cd ~/public_html
nano .htaccess
```

**Add this content:**
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js app
RewriteCond %{HTTP_HOST} ^admin\.resq-qa\.com$ [NC]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Save:** `Ctrl + O`, `Enter`, `Ctrl + X`

**Or create via File Manager/FTP and upload**

---

## Step 12: Point Domain to App Directory

### In Hostinger hPanel:

1. Go to **Domains**
2. Click on **admin.resq-qa.com** (or add subdomain)
3. **Manage** → **Point to Directory**
4. Point to: `public_html` (where .htaccess is)
5. Save

---

## Step 13: Test Your Deployment

Visit: `https://admin.resq-qa.com`

**If it works:** ✅ Success!

**If 502/503 error:**
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs`
- Restart: `pm2 restart resq-admin`

**If 403 error:**
- Check .htaccess is correct
- Check file permissions: `chmod 755 ~/public_html`

**If 404 error:**
- Check domain points to correct directory
- Check .htaccess is in right location

---

## Managing Your App

### View App Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs resq-admin

# View last 100 lines
pm2 logs resq-admin --lines 100

# View only errors
pm2 logs resq-admin --err
```

### Restart App
```bash
pm2 restart resq-admin
```

### Stop App
```bash
pm2 stop resq-admin
```

### Start App
```bash
pm2 start resq-admin
```

### Delete App from PM2
```bash
pm2 delete resq-admin
```

### Update Code After Changes

```bash
# 1. Upload new files via FTP

# 2. SSH into server
ssh -p 65002 your_username@ssh.hostinger.com

# 3. Navigate to app
cd public_html/resq-admin

# 4. Install any new dependencies
npm install --production

# 5. Restart app
pm2 restart resq-admin

# 6. Check logs
pm2 logs resq-admin
```

---

## Troubleshooting

### PM2 process keeps stopping

**Hostinger might be killing it. Check:**
```bash
# Check if process is running
pm2 status

# If stopped, check logs
pm2 logs resq-admin

# Restart
pm2 restart resq-admin
```

**If Hostinger keeps killing it:**
- Contact Hostinger support
- May need to upgrade to Cloud/VPS
- Premium hosting has resource limits

### Port 3000 already in use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
pm2 delete resq-admin

# Change port in .env to 3001
# Restart
```

### Can't install PM2 globally

```bash
# Install locally
npm install pm2 --save-dev

# Use with npx
npx pm2 start server.js --name "resq-admin"
npx pm2 status
npx pm2 logs
```

### Permission denied errors

```bash
# Fix permissions
chmod 755 ~/public_html
chmod 644 ~/public_html/resq-admin/.env
chmod 644 ~/public_html/resq-admin/server.js
```

### Module not found errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install --production
pm2 restart resq-admin
```

---

## Important Notes

### Resource Limits

Hostinger Premium has limits:
- CPU usage limits
- Memory limits
- Process limits

**If your app uses too many resources, Hostinger will kill it.**

### Not Production-Ready

This setup:
- ❌ Not officially supported
- ❌ May stop working after server restarts
- ❌ No guaranteed uptime
- ❌ Hostinger may disable it

### Better Alternative

For production Node.js apps:
- Use Hostinger Cloud/VPS (with Node.js support)
- Or use dedicated Node.js hosts (Render, Railway, etc.)

---

## Quick Command Reference

```bash
# SSH connect
ssh -p 65002 username@ssh.hostinger.com

# Navigate to app
cd public_html/resq-admin

# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name "resq-admin"

# Check status
pm2 status

# View logs
pm2 logs resq-admin

# Restart
pm2 restart resq-admin

# Save PM2 configuration
pm2 save
```

---

## Success Checklist

- [ ] SSH access enabled
- [ ] Files uploaded via FTP
- [ ] .env file created with secrets
- [ ] SSH connected successfully
- [ ] Dependencies installed (npm install)
- [ ] App tested (node server.js)
- [ ] PM2 installed
- [ ] App started with PM2
- [ ] .htaccess configured for proxy
- [ ] Domain points to correct directory
- [ ] App accessible at admin.resq-qa.com

---

## Need Help?

**Common issues:**
1. PM2 keeps stopping → Contact Hostinger support
2. 502/503 errors → Check PM2 logs
3. Permission errors → Fix file permissions
4. Can't connect SSH → Check port (usually 65002, not 22)

Good luck with your deployment! 🚀
