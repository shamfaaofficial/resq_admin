# Fixing 403 Forbidden Error on Hostinger

## What is 403 Forbidden?
The server is refusing to show your website. This happens when:
- Wrong file permissions
- Missing index file
- Directory listing disabled
- .htaccess blocking access
- Node.js app not running
- Wrong directory configuration

## Solutions to Try (in order):

### Solution 1: Check if Node.js App is Running

**In Hostinger hPanel:**
1. Go to **Advanced** → **Node.js**
2. Check if your application status shows **"Running"**
3. If it says **"Stopped"** → Click **Start**
4. If it says **"Error"** → Click **Logs** to see what went wrong

### Solution 2: Fix File Permissions

**Via Hostinger File Manager:**
1. Go to **File Manager**
2. Right-click on your app folder
3. Select **Permissions** or **Change Permissions**
4. Set folders to: **755**
5. Set files to: **644**

**Via SSH:**
```bash
cd public_html  # or your app directory
chmod 755 .
chmod 755 */
chmod 644 *.js *.json *.env
```

### Solution 3: Check .htaccess File

The .htaccess might be blocking access. Try these options:

**Option A: Temporarily rename .htaccess to test**
```bash
mv .htaccess .htaccess.backup
# Test if site works
# If it works, the .htaccess was the problem
```

**Option B: Use simpler .htaccess for Node.js**

If you're running Node.js through hPanel (not Apache proxy), you **DON'T NEED .htaccess** at all!

**Delete or rename the .htaccess file** and let Node.js handle everything.

### Solution 4: Check Node.js Configuration

**In hPanel → Node.js section, verify:**

1. **Application root**: Should point to your app folder
   - Example: `/home/username/public_html` or `/home/username/domains/admin.resq-qa.com/public_html`

2. **Application startup file**: Should be `server.js`

3. **Port**: Should match your .env PORT (usually auto-assigned by Hostinger)

4. **Application mode**: Should be `production`

5. **Application URL**: Should be `admin.resq-qa.com`

### Solution 5: Check if There's an Index File Conflict

If you have BOTH Node.js app AND static files:

**Remove any index.html or index.php files:**
```bash
# These files might be blocking your Node.js app
rm index.html
rm index.php
```

### Solution 6: Verify Domain Points to Correct Directory

**In Hostinger hPanel:**
1. Go to **Websites** → Your domain
2. Check **Document Root** or **Website Root**
3. Should point to where your Node.js app is located

### Solution 7: Check DNS and SSL

1. **DNS**: Make sure `admin.resq-qa.com` points to Hostinger servers
   - Check in **Domains** → **DNS** section
   - Should have Hostinger's nameservers

2. **SSL Certificate**:
   - Go to **SSL** section
   - Make sure SSL is installed for `admin.resq-qa.com`
   - Try accessing via `http://` instead of `https://` to test

### Solution 8: Check Node.js Logs

**In hPanel → Node.js → Your App → Logs:**

Look for errors like:
- Port already in use
- Module not found
- Syntax errors
- Permission denied

**Via SSH:**
```bash
# View Node.js logs
pm2 logs
# or
journalctl -u nodejs-app -f
```

### Solution 9: Verify .env File Exists

```bash
cd public_html  # your app directory
ls -la .env
cat .env  # Check contents
```

Make sure .env has:
```
PORT=3000
NODE_ENV=production
BASE_API_URL=https://dev.resq-qa.com
SESSION_SECRET=your-secret-here
```

### Solution 10: Test if Node.js is Working

**SSH into Hostinger and manually start:**
```bash
cd /path/to/your/app
node server.js
```

If you see errors, that's your problem!

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Node.js app is **Running** (not Stopped)
- [ ] No .htaccess file (or .htaccess renamed)
- [ ] File permissions: folders 755, files 644
- [ ] .env file exists with correct values
- [ ] server.js is in the application root
- [ ] No index.html blocking the app
- [ ] Domain points to correct directory
- [ ] SSL certificate installed
- [ ] Check Node.js logs for errors

## Most Likely Causes for Your Setup

Based on your error, it's probably one of these:

### 1. Node.js App Not Running
**Fix:** Start it in hPanel → Node.js

### 2. .htaccess Causing Issues
**Fix:** Delete or rename .htaccess (you don't need it for Node.js hosting)

### 3. Wrong Directory Configuration
**Fix:** Make sure hPanel Node.js points to correct folder

### 4. File Permissions
**Fix:** Set to 755/644

## Need Help?

After trying these solutions, check:
1. Can you access the site?
2. What do the Node.js logs say?
3. Is the app showing as "Running" in hPanel?

Report back with this info and I can help further!
