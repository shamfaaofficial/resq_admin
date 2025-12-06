# Quick SSH Check for Node.js on Hostinger

## Step 1: Connect to SSH

### Get SSH Details from Hostinger:
1. hPanel → Advanced → SSH Access
2. Note down:
   - **Host**: (e.g., `ssh.hostinger.com`)
   - **Port**: (e.g., `65002`)
   - **Username**: Your hosting username
   - **Password**: Your hosting password

### Connect via SSH:

**Windows (PowerShell or CMD):**
```bash
ssh -p 65002 YOUR_USERNAME@ssh.hostinger.com
```

**Mac/Linux (Terminal):**
```bash
ssh -p 65002 YOUR_USERNAME@ssh.hostinger.com
```

Replace `YOUR_USERNAME` and use your port/host from hPanel.

---

## Step 2: Check Node.js

Once connected, run these commands:

```bash
# Check if Node.js is installed
node --version

# Check npm
npm --version

# Check if PM2 is installed
pm2 --version
# or
npx pm2 --version

# Check if any Node.js processes are running
pm2 list
# or
ps aux | grep node

# Check your directories
ls
ls public_html
```

---

## Step 3: Report Results

**Tell me what you see for each command:**

### If Node.js is installed:
```
$ node --version
v18.17.0

$ npm --version
9.6.7
```
✅ **Node.js IS available!** You can deploy using SSH method.

### If Node.js is NOT installed:
```
$ node --version
-bash: node: command not found
```
❌ **Node.js is NOT available** on this server.

---

## Step 4: Check for Previous Deployment

```bash
# List all directories
ls -la ~/

# Check public_html
ls -la ~/public_html

# Look for node_modules or Node.js apps
find ~/public_html -name "node_modules" -type d

# Check if PM2 has any saved processes
pm2 list
pm2 status
```

**Look for:**
- Folders with `server.js`, `index.js`, `app.js`
- `node_modules` folders
- Any running PM2 processes

---

## What to Report Back

After running the commands, tell me:

1. **Node.js version** (or "not found")
2. **npm version** (or "not found")
3. **PM2 status** (any apps running?)
4. **Directories you see** in public_html
5. **Any Node.js apps** you found

This will help me understand how your previous deployment worked!
