# RESQ Admin Deployment Guide

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Docker (optional, for containerized deployment)
- Git

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure the following variables:
   ```
   PORT=3000
   NODE_ENV=production
   BASE_API_URL=https://your-api-url.com
   SESSION_SECRET=generate-a-strong-random-secret
   ```

   **Important**: Generate a strong SESSION_SECRET using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Deployment Options

### Option 1: Traditional Node.js Deployment

1. Install dependencies:
   ```bash
   npm ci --only=production
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. For production with PM2 (recommended):
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

### Option 2: Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t resq-admin .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Check logs:
   ```bash
   docker-compose logs -f
   ```

4. Stop the container:
   ```bash
   docker-compose down
   ```

### Option 3: Cloud Platform Deployment

#### Heroku

1. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set BASE_API_URL=https://your-api-url.com
   heroku config:set SESSION_SECRET=your-secret-here
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

#### Railway / Render

1. Connect your GitHub repository
2. Add environment variables in the dashboard
3. Deploy automatically on push

#### AWS EC2

1. SSH into your EC2 instance
2. Install Node.js and PM2
3. Clone your repository
4. Set up environment variables
5. Run with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

#### DigitalOcean App Platform

1. Create a new app from GitHub
2. Add environment variables
3. Set build command: `npm install`
4. Set run command: `npm start`

## Security Checklist

- [ ] Change SESSION_SECRET from default
- [ ] Set NODE_ENV to 'production'
- [ ] Configure HTTPS/SSL certificate
- [ ] Enable firewall rules
- [ ] Set up rate limiting (consider adding express-rate-limit)
- [ ] Keep dependencies updated
- [ ] Enable security headers (consider helmet.js)
- [ ] Review and restrict API CORS settings

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs resq-admin
pm2 status
```

### Docker Monitoring

```bash
docker stats resq-admin
docker logs -f resq-admin
```

## Troubleshooting

### Application won't start
- Check if PORT is already in use
- Verify all environment variables are set
- Check logs for errors

### API connection issues
- Verify BASE_API_URL is correct
- Check network connectivity
- Ensure API is accessible from server

### Session issues
- Verify SESSION_SECRET is set
- Check cookie configuration
- Ensure server time is correct

## Backup and Recovery

1. Regular backups of environment configuration
2. Document any custom configurations
3. Keep track of dependency versions

## Scaling

For high traffic:
- Use PM2 cluster mode (already configured in ecosystem.config.js)
- Consider load balancer (nginx, AWS ELB)
- Implement caching strategy
- Use CDN for static assets

## Updates and Maintenance

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Install new dependencies:
   ```bash
   npm install
   ```

3. Restart application:
   ```bash
   pm2 restart resq-admin
   # or
   docker-compose restart
   ```

## Support

For issues, check:
- Server logs
- Application logs (./logs/ directory)
- PM2 logs
- Docker logs

## License

Refer to project LICENSE file
