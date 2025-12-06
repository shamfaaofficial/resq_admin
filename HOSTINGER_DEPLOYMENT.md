# Hostinger Deployment Guide for RESQ Admin

## Files and Folders to Upload

### ✅ INCLUDE (Upload these):

```
resq_admin/
├── assets/              (upload entire folder)
├── middleware/          (upload entire folder)
├── public/              (upload entire folder)
├── views/               (upload entire folder)
├── resq_admin/          (upload entire folder if exists)
├── package.json         (required)
├── package-lock.json    (required)
├── server.js            (required)
└── .env                 (create this on server - see below)
```

### ❌ EXCLUDE (DO NOT upload these):

```
- node_modules/          (will be installed on server)
- .git/                  (not needed)
- .claude/               (not needed)
- .env.example           (not needed, create .env instead)
- .gitignore             (not needed)
- .dockerignore          (not needed)
- Dockerfile             (not needed)
- docker-compose.yml     (not needed)
- ecosystem.config.js    (optional - only if using PM2)
- DEPLOYMENT.md          (not needed)
- README.md              (optional)
- *.log files            (not needed)
- WhatsApp*.jpeg         (not needed)
- nul                    (not needed)
```

## Step-by-Step Hostinger Deployment

### Step 1: Prepare Your Files Locally

Create a clean folder with only necessary files:

```bash
# Create deployment folder
mkdir resq_admin_deploy
cd resq_admin_deploy

# Copy necessary folders
cp -r assets/ resq_admin_deploy/
cp -r middleware/ resq_admin_deploy/
cp -r public/ resq_admin_deploy/
cp -r views/ resq_admin_deploy/
cp -r resq_admin/ resq_admin_deploy/

# Copy necessary files
cp package.json resq_admin_deploy/
cp package-lock.json resq_admin_deploy/
cp server.js resq_admin_deploy/
```

### Step 2: Access Hostinger Control Panel

1. Log in to Hostinger
2. Go to **hPanel** → **Advanced** → **File Manager**
3. Navigate to `public_html` or your app directory

### Step 3: Upload Files

1. Click **Upload Files** button
2. Upload all folders and files from the list above
3. Or use **FTP client** (FileZilla recommended):
   - Host: Your domain or IP
   - Username: FTP username from Hostinger
   - Password: FTP password from Hostinger
   - Port: 21

### Step 4: Create .env File on Server

1. In File Manager, click **+ New File**
2. Name it `.env`
3. Add this content (update with your values):

```env
PORT=3000
NODE_ENV=production
BASE_API_URL=https://dev.resq-qa.com
SESSION_SECRET=GENERATE_A_SECURE_SECRET_HERE
```

To generate SESSION_SECRET, use this online or locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Install Dependencies via SSH

1. Go to **hPanel** → **Advanced** → **SSH Access**
2. Enable SSH if not enabled
3. Connect via terminal:
   ```bash
   ssh username@your-domain.com
   ```

4. Navigate to your app directory:
   ```bash
   cd public_html  # or your app directory
   ```

5. Install Node.js dependencies:
   ```bash
   npm install --production
   ```

### Step 6: Configure Node.js Application

1. Go to **hPanel** → **Advanced** → **Node.js**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 20.x (latest LTS)
   - **Application mode**: Production
   - **Application root**: `public_html` (or your folder)
   - **Application URL**: your-domain.com
   - **Application startup file**: `server.js`
   - **Port**: Use the port Hostinger assigns (usually auto-configured)

4. Click **Create**

### Step 7: Start the Application

1. In Node.js section, click **Start** or **Restart**
2. Application should now be running

### Step 8: Verify Deployment

Visit your domain: `https://your-domain.com`

## Hostinger-Specific Configuration

### If Hostinger Uses Apache/Nginx Proxy

Create `.htaccess` file in application root (if needed):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

### Port Configuration

Hostinger might assign a specific port. Update in:
1. `.env` file: `PORT=assigned_port`
2. Or check Node.js application settings in hPanel

## Quick Checklist

- [ ] Upload all necessary folders (assets, middleware, public, views)
- [ ] Upload package.json and package-lock.json
- [ ] Upload server.js
- [ ] Create .env file with correct settings
- [ ] Connect via SSH
- [ ] Run `npm install --production`
- [ ] Configure Node.js application in hPanel
- [ ] Start the application
- [ ] Test the website

## Troubleshooting

### Application won't start
- Check Node.js logs in hPanel
- Verify .env file exists and has correct values
- Check if all dependencies installed: `npm list`
- Verify PORT matches Hostinger's assigned port

### Cannot access website
- Check if application is running in hPanel
- Verify domain DNS settings
- Check .htaccess configuration
- Review error logs in hPanel

### 502 Bad Gateway
- Application crashed - check logs
- Port mismatch - verify PORT in .env
- Restart Node.js application

### Session issues
- Verify SESSION_SECRET is set in .env
- Check file permissions on .env

### LiteSpeed Cache / WordPress Optimization Errors

If you see errors like:
```
GET /?LSCWP_CTRL=before_optm&nocache=... 403 (Forbidden)
```

**This is because Hostinger is treating your Node.js app like WordPress.**

**Solutions:**

1. **Disable LiteSpeed Cache in hPanel:**
   - Go to Websites → Your domain
   - Advanced → LiteSpeed Cache
   - Click "Disable"

2. **Upload the .htaccess file** (already created) to your app root

3. **The server.js file already includes headers** to disable caching

4. **Clear browser cache** after fixing:
   - Chrome: Ctrl+Shift+Delete
   - Hard refresh: Ctrl+F5

5. **If still showing**, check:
   - Ensure .htaccess is in the correct directory
   - Restart Node.js app in hPanel
   - Clear LiteSpeed cache in hPanel

## FTP Upload Alternative

If you prefer FTP (using FileZilla):

1. Download FileZilla
2. Connect with credentials from Hostinger
3. Drag and drop these folders/files to `public_html`:
   - assets/
   - middleware/
   - public/
   - views/
   - resq_admin/
   - package.json
   - package-lock.json
   - server.js
4. Create .env file manually or upload

## Updates After Deployment

1. Make changes locally
2. Upload changed files via FTP or File Manager
3. If package.json changed, SSH and run `npm install`
4. Restart application in hPanel Node.js section

## Important Notes

- **Never upload node_modules** - always install on server
- **Keep .env secure** - never commit to git
- **Backup .env file** - save credentials safely
- **Monitor logs** - check regularly for errors
- **Use production mode** - NODE_ENV=production

## Need Help?

- Hostinger Support: https://www.hostinger.com/tutorials/
- Check Node.js application logs in hPanel
- Review Hostinger knowledge base for Node.js hosting
