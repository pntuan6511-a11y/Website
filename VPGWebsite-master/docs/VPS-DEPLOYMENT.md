# VPS Deployment Guide (1vCPU + 2GB RAM)

## Server Requirements

- **CPU**: 1 vCPU
- **RAM**: 2GB
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or Debian 11+
- **Node.js**: 18.x or 20.x
- **PM2**: Latest version

## Installation Steps

### 1. Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 3. Clone and Build

```bash
# Clone repository
git clone <your-repo-url>
cd VPGWebsite-master

# Install dependencies
npm ci --production=false

# Build application
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Remove dev dependencies to save space
npm prune --production
```

### 4. Configure Environment

```bash
# Copy environment file
cp .env.product .env

# Edit environment variables
nano .env
```

Required variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 5. Start with PM2

```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs vpg-website
```

## Memory Optimization

### Swap File (Recommended for 2GB RAM)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

### Node.js Memory Limits

The build process is configured to use max 1.5GB:
```bash
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

PM2 will restart the app if it exceeds 1.5GB memory usage.

## Nginx Configuration

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configure Reverse Proxy

Create `/etc/nginx/sites-available/vpg-website`:

```nginx
# Upstream configuration
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    gzip_disable "MSIE [1-6]\.";

    # Client body size limit
    client_max_body_size 10M;

    # Proxy settings
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Cache images
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/vpg-website /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## Database Optimization

### PostgreSQL Configuration

Edit `/etc/postgresql/*/main/postgresql.conf`:

```conf
# Memory settings for 2GB RAM VPS
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Connection settings
max_connections = 20

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# CPU and memory usage
pm2 status

# Logs
pm2 logs vpg-website --lines 100
```

### System Monitoring

```bash
# Install htop
sudo apt install htop

# Monitor system resources
htop

# Check memory usage
free -h

# Check disk usage
df -h
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci --production=false

# Build with memory limit
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Prune dev dependencies
npm prune --production

# Restart PM2
pm2 restart vpg-website

# Check logs
pm2 logs vpg-website --lines 50
```

### Clear Cache

```bash
# Clear Next.js cache
rm -rf .next/cache

# Rebuild
NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 restart vpg-website
```

### Database Backup

```bash
# Backup database
pg_dump -U postgres dbname > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres dbname < backup_20231123.sql
```

## Troubleshooting

### Out of Memory Errors

```bash
# Check memory usage
free -h

# Check swap
swapon --show

# Restart application
pm2 restart vpg-website

# Check PM2 logs
pm2 logs vpg-website --err
```

### High CPU Usage

```bash
# Check processes
top

# Restart application
pm2 restart vpg-website

# Check for memory leaks
pm2 monit
```

### Application Not Starting

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs vpg-website

# Restart PM2
pm2 restart vpg-website

# If still failing, rebuild
NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 restart vpg-website
```

## Performance Tips

1. **Enable Swap**: Always use swap file on 2GB RAM VPS
2. **Limit Connections**: Keep database connections low (max 20)
3. **Use CDN**: Offload static assets to CDN if possible
4. **Monitor Memory**: Set up alerts for high memory usage
5. **Regular Restarts**: Schedule weekly restarts to clear memory leaks
6. **Optimize Images**: Always use WebP format
7. **Cache Aggressively**: Use Nginx caching for static content
8. **Database Indexes**: Add indexes to frequently queried columns

## Automated Restart Schedule

```bash
# Edit crontab
crontab -e

# Add weekly restart (Sunday 3 AM)
0 3 * * 0 pm2 restart vpg-website
```

## Security

### Firewall

```bash
# Install UFW
sudo apt install ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Cost Optimization

- Use CloudFlare for free CDN and DDoS protection
- Enable Nginx caching to reduce server load
- Use database connection pooling
- Implement API response caching
- Compress all responses with gzip
- Optimize images before upload

## Expected Performance

With proper optimization:
- **Response Time**: 200-500ms
- **Concurrent Users**: 50-100
- **Memory Usage**: 800MB-1.2GB
- **CPU Usage**: 20-40% average
- **Uptime**: 99.5%+
