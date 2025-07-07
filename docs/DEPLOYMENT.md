# Deployment Guide

This guide provides comprehensive instructions for deploying PDS Maker to production environments. It covers system requirements, deployment steps, configuration, security, and maintenance procedures.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Production Deployment Steps](#production-deployment-steps)
4. [Environment Configuration](#environment-configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Database Deployment](#database-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Kubernetes Deployment](#kubernetes-deployment)
9. [Nginx Configuration](#nginx-configuration)
10. [Database Backup Procedures](#database-backup-procedures)
11. [Monitoring Setup](#monitoring-setup)
12. [Scaling Strategies](#scaling-strategies)
13. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Hardware Requirements

**For Small Deployment (< 100 concurrent users)**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100 Mbps

**For Medium Deployment (100-1000 concurrent users)**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: 1 Gbps

**For Large Deployment (> 1000 concurrent users)**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 100GB+ SSD
- Network: 1 Gbps+

### Software Requirements

- **Operating System**: Ubuntu 20.04 LTS or newer (recommended)
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Redis**: v6.0 or higher
- **Nginx**: v1.18 or higher
- **Docker**: v20.10 or higher (for containerized deployment)
- **Git**: v2.30 or higher

### Network Requirements

- **Ports to Open**:
  - 80 (HTTP)
  - 443 (HTTPS)
  - 5432 (PostgreSQL - internal only)
  - 6379 (Redis - internal only)
  - 3001 (API - internal only)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Preparation
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Security vulnerabilities checked (`npm audit`)
- [ ] Environment variables documented
- [ ] Secrets removed from codebase

### Infrastructure
- [ ] Domain name configured
- [ ] SSL certificates obtained
- [ ] Firewall rules configured
- [ ] Backup strategy defined
- [ ] Monitoring tools ready
- [ ] Load balancer configured (if needed)

### Database
- [ ] Production database created
- [ ] Connection tested
- [ ] Migrations ready
- [ ] Backup system configured
- [ ] Replication setup (if needed)

### Security
- [ ] Strong passwords set
- [ ] JWT secret generated
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] File upload restrictions set

## Production Deployment Steps

### Step 1: Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential nginx postgresql postgresql-contrib redis-server

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version
npm --version
psql --version
redis-server --version
nginx -v
```

### Step 2: PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create production database and user
CREATE USER pds_maker_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE pds_maker_prod OWNER pds_maker_user;
GRANT ALL PRIVILEGES ON DATABASE pds_maker_prod TO pds_maker_user;
\q

# Configure PostgreSQL for remote connections (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost,your_server_ip'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all your_app_server_ip/32 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 3: Redis Setup

```bash
# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Set the following:
# bind 127.0.0.1 ::1
# protected-mode yes
# requirepass your_redis_password
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Enable Redis service
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis connection
redis-cli -a your_redis_password ping
```

### Step 4: Application Deployment

```bash
# Create application user
sudo useradd -m -s /bin/bash pdsmaker
sudo usermod -aG sudo pdsmaker

# Switch to application user
sudo su - pdsmaker

# Clone repository
git clone https://github.com/your-org/pds-maker.git
cd pds-maker

# Install dependencies
npm install --production

# Build applications
npm run build

# Create production environment file
cd api
cp .env.example .env.production
nano .env.production
```

### Step 5: Environment Configuration

Create `.env.production` with:

```env
# Application
NODE_ENV=production
API_PORT=3001

# Database
DATABASE_URL=postgresql://pds_maker_user:strong_password@localhost:5432/pds_maker_prod
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL=redis://:your_redis_password@localhost:6379

# Authentication
JWT_SECRET=your-very-long-random-string-generate-this-securely
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://pdsmaker.ph,https://www.pdsmaker.ph

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
UPLOAD_PATH=/var/pdsmaker/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/pdsmaker/app.log

# Email (if applicable)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@pdsmaker.ph
SMTP_PASS=smtp_password
```

### Step 6: Database Migrations

```bash
# Run migrations
cd /home/pdsmaker/pds-maker/api
NODE_ENV=production npm run migrate

# Verify migrations
NODE_ENV=production npm run migrate:status
```

### Step 7: Process Management with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'pds-maker-api',
      script: './api/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pdsmaker/pm2-error.log',
      out_file: '/var/log/pdsmaker/pm2-out.log',
      log_file: '/var/log/pdsmaker/pm2-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the instructions provided

# Monitor application
pm2 monit
```

## Environment Configuration

### Production Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment name | production |
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| REDIS_URL | Redis connection string | redis://:password@localhost:6379 |
| JWT_SECRET | JWT signing secret | 64-character random string |
| CORS_ORIGIN | Allowed CORS origins | https://pdsmaker.ph |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| API_PORT | API server port | 3001 |
| RATE_LIMIT_WINDOW | Rate limit window (minutes) | 15 |
| RATE_LIMIT_MAX | Max requests per window | 100 |
| LOG_LEVEL | Logging level | info |
| UPLOAD_PATH | File upload directory | ./uploads |
| MAX_FILE_SIZE | Max upload size (bytes) | 10485760 |

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32
```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d pdsmaker.ph -d www.pdsmaker.ph

# Test automatic renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e
# Add: 0 0 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate Installation

```bash
# Copy certificates to server
sudo mkdir -p /etc/nginx/ssl
sudo cp your_domain.crt /etc/nginx/ssl/
sudo cp your_domain.key /etc/nginx/ssl/

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/your_domain.key
sudo chmod 644 /etc/nginx/ssl/your_domain.crt
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name pdsmaker.ph www.pdsmaker.ph;

    ssl_certificate /etc/letsencrypt/live/pdsmaker.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdsmaker.ph/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/pdsmaker.ph/chain.pem;
}
```

## Database Deployment

### Production Database Configuration

```sql
-- Performance tuning for PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration
SELECT pg_reload_conf();
```

### Database Security

```sql
-- Revoke unnecessary privileges
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO pds_maker_user;

-- Create read-only user for backups
CREATE USER pds_backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE pds_maker_prod TO pds_backup_user;
GRANT USAGE ON SCHEMA public TO pds_backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pds_backup_user;
```

### Connection Pooling

Configure PgBouncer for connection pooling:

```bash
# Install PgBouncer
sudo apt install -y pgbouncer

# Configure PgBouncer
sudo nano /etc/pgbouncer/pgbouncer.ini
```

```ini
[databases]
pds_maker_prod = host=localhost port=5432 dbname=pds_maker_prod

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

## Docker Deployment

### Dockerfile for API

```dockerfile
# api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY api/package*.json ./api/

# Install dependencies
RUN npm ci --workspace=api

# Copy source code
COPY api ./api

# Build application
RUN npm run build --workspace=api

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/package*.json ./

# Install production dependencies
RUN npm ci --production

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: api/Dockerfile
    environment:
      - NODE_ENV=production
    env_file:
      - ./api/.env.production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: pds_maker_prod
      POSTGRES_USER: pds_maker_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./deployment/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pds_maker_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    environment:
      REDIS_PASSWORD_FILE: /run/secrets/redis_password
    secrets:
      - redis_password
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./deployment/nginx/sites:/etc/nginx/sites-enabled
      - ./web/dist:/usr/share/nginx/html
      - ./deployment/ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
```

### Building and Running with Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale API service
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

## Kubernetes Deployment

### Kubernetes Manifests

```yaml
# deployment/kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pds-maker
```

```yaml
# deployment/kubernetes/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pds-maker-config
  namespace: pds-maker
data:
  NODE_ENV: "production"
  API_PORT: "3001"
  CORS_ORIGIN: "https://pdsmaker.ph"
  RATE_LIMIT_WINDOW: "15"
  RATE_LIMIT_MAX: "100"
```

```yaml
# deployment/kubernetes/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pds-maker-secrets
  namespace: pds-maker
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/pds_maker"
  REDIS_URL: "redis://:password@redis:6379"
  JWT_SECRET: "your-jwt-secret"
```

```yaml
# deployment/kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pds-maker-api
  namespace: pds-maker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pds-maker-api
  template:
    metadata:
      labels:
        app: pds-maker-api
    spec:
      containers:
      - name: api
        image: pdsmaker/api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: pds-maker-config
        - secretRef:
            name: pds-maker-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

```yaml
# deployment/kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pds-maker-api
  namespace: pds-maker
spec:
  selector:
    app: pds-maker-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

```yaml
# deployment/kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pds-maker-ingress
  namespace: pds-maker
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.pdsmaker.ph
    secretName: pds-maker-tls
  rules:
  - host: api.pdsmaker.ph
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pds-maker-api
            port:
              number: 80
```

### Deploying to Kubernetes

```bash
# Apply all manifests
kubectl apply -f deployment/kubernetes/

# Check deployment status
kubectl get all -n pds-maker

# View logs
kubectl logs -f deployment/pds-maker-api -n pds-maker

# Scale deployment
kubectl scale deployment pds-maker-api --replicas=5 -n pds-maker
```

## Nginx Configuration

### Complete Nginx Configuration

```nginx
# /etc/nginx/sites-available/pdsmaker
upstream api_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    # Add more servers for load balancing
    # server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:3003 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name pdsmaker.ph www.pdsmaker.ph;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name pdsmaker.ph www.pdsmaker.ph;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/pdsmaker.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdsmaker.ph/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /var/log/nginx/pdsmaker_access.log;
    error_log /var/log/nginx/pdsmaker_error.log;

    # Root directory for static files
    root /var/www/pdsmaker/web;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # API routes
    location /api {
        # Apply rate limiting
        limit_req zone=api_limit burst=20 nodelay;
        
        # Special rate limit for auth endpoints
        location ~* ^/api/auth/(login|register) {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        proxy_pass http://api_backend;
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

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### Enable and Test Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/pdsmaker /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Monitor Nginx
sudo tail -f /var/log/nginx/pdsmaker_*.log
```

## Database Backup Procedures

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/pds-backup.sh

# Configuration
DB_NAME="pds_maker_prod"
DB_USER="pds_backup_user"
BACKUP_DIR="/var/backups/pdsmaker"
RETENTION_DAYS=30
S3_BUCKET="s3://pdsmaker-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pds_backup_$DATE.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup of $DB_NAME..."
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Upload to S3 (optional)
    if command -v aws &> /dev/null; then
        aws s3 cp $BACKUP_FILE $S3_BUCKET/
        echo "Backup uploaded to S3"
    fi
    
    # Remove old backups
    find $BACKUP_DIR -name "pds_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi

# Verify backup
echo "Verifying backup..."
gunzip -c $BACKUP_FILE | head -n 10 > /dev/null
if [ $? -eq 0 ]; then
    echo "Backup verification passed"
else
    echo "Backup verification failed!"
    exit 1
fi
```

### Backup Cron Job

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/pds-backup.sh >> /var/log/pdsmaker/backup.log 2>&1

# Add weekly full backup on Sunday
0 3 * * 0 /usr/local/bin/pds-backup-full.sh >> /var/log/pdsmaker/backup-full.log 2>&1
```

### Restore Procedures

```bash
#!/bin/bash
# /usr/local/bin/pds-restore.sh

# Usage: ./pds-restore.sh backup_file.sql.gz

BACKUP_FILE=$1
DB_NAME="pds_maker_prod"
DB_USER="pds_maker_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will restore the database from $BACKUP_FILE"
echo "All current data will be lost!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Stop application
echo "Stopping application..."
pm2 stop pds-maker-api

# Drop and recreate database
echo "Recreating database..."
PGPASSWORD=$DB_PASSWORD psql -U postgres -h localhost <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME OWNER $DB_USER;
EOF

# Restore backup
echo "Restoring backup..."
gunzip -c $BACKUP_FILE | PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost $DB_NAME

if [ $? -eq 0 ]; then
    echo "Restore completed successfully"
    
    # Run migrations to ensure schema is up to date
    cd /home/pdsmaker/pds-maker/api
    NODE_ENV=production npm run migrate
    
    # Restart application
    pm2 restart pds-maker-api
    echo "Application restarted"
else
    echo "Restore failed!"
    exit 1
fi
```

### Point-in-Time Recovery Setup

```bash
# Configure PostgreSQL for WAL archiving
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add/modify:
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
archive_timeout = 300

# Create archive directory
sudo mkdir -p /var/lib/postgresql/archive
sudo chown postgres:postgres /var/lib/postgresql/archive

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Monitoring Setup

### Application Monitoring with PM2

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Web dashboard
pm2 install pm2-web
```

### System Monitoring with Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

### Application Metrics

```typescript
// Add to API for Prometheus metrics
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Collect default metrics
collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### Log Aggregation with ELK Stack

```bash
# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update && sudo apt install elasticsearch

# Configure Logstash
sudo nano /etc/logstash/conf.d/pdsmaker.conf
```

```ruby
input {
  file {
    path => "/var/log/pdsmaker/*.log"
    start_position => "beginning"
    codec => "json"
  }
}

filter {
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "pdsmaker-%{+YYYY.MM.dd}"
  }
}
```

### Health Check Monitoring

```bash
# Create health check script
#!/bin/bash
# /usr/local/bin/pds-health-check.sh

API_URL="https://pdsmaker.ph/api/health"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Check API health
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $HTTP_STATUS -ne 200 ]; then
    # Send alert
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 PDS Maker API is down! Status: $HTTP_STATUS\"}" \
        $SLACK_WEBHOOK
    
    # Try to restart
    pm2 restart pds-maker-api
fi

# Check database
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 PDS Maker database is unreachable!"}' \
        $SLACK_WEBHOOK
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ PDS Maker server disk usage is at $DISK_USAGE%\"}" \
        $SLACK_WEBHOOK
fi
```

```bash
# Add to crontab for every 5 minutes
*/5 * * * * /usr/local/bin/pds-health-check.sh
```

## Scaling Strategies

### Horizontal Scaling

#### Load Balancer Configuration

```nginx
# For multiple API instances
upstream api_backend {
    least_conn;
    server api1.internal:3001 weight=5;
    server api2.internal:3001 weight=5;
    server api3.internal:3001 weight=5;
    
    # Health checks
    check interval=3000 rise=2 fall=5 timeout=1000;
}
```

#### Database Read Replicas

```sql
-- On primary database
CREATE PUBLICATION pds_maker_pub FOR ALL TABLES;

-- On replica
CREATE SUBSCRIPTION pds_maker_sub 
CONNECTION 'host=primary.db port=5432 dbname=pds_maker_prod user=replicator' 
PUBLICATION pds_maker_pub;
```

### Vertical Scaling

#### Database Optimization

```sql
-- Increase connection limits
ALTER SYSTEM SET max_connections = 200;

-- Tune for more RAM
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '16MB';

-- Restart required
SELECT pg_reload_conf();
```

#### Application Optimization

```javascript
// PM2 cluster mode with more workers
module.exports = {
  apps: [{
    name: 'pds-maker-api',
    script: './dist/index.js',
    instances: 8, // Or 'max' for all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '2G'
  }]
};
```

### Caching Strategy

#### Redis Configuration for Caching

```redis
# Redis configuration for caching
maxmemory 2gb
maxmemory-policy allkeys-lru
save ""
appendonly no
```

#### Application-Level Caching

```typescript
// Cache frequently accessed data
const CACHE_TTL = 3600; // 1 hour

async function getCachedPDS(pdsId: string): Promise<PDS | null> {
  const cacheKey = `pds:${pdsId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const pds = await pdsRepository.findById(pdsId);
  if (pds) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(pds));
  }
  
  return pds;
}
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: High Memory Usage

```bash
# Check memory usage
pm2 monit

# Increase memory limit
pm2 delete pds-maker-api
pm2 start ecosystem.config.js --max-memory-restart 2G

# Check for memory leaks
node --inspect dist/index.js
# Use Chrome DevTools for heap snapshots
```

#### Issue: Database Connection Errors

```bash
# Check connection limit
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase connection pool
# In knexfile.js
pool: {
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000
}
```

#### Issue: Slow API Response

```bash
# Enable slow query logging in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000; # Log queries over 1 second

# Check slow queries
tail -f /var/log/postgresql/postgresql-14-main.log | grep duration

# Add missing indexes
CREATE INDEX CONCURRENTLY idx_pds_user_status ON pds(user_id, status);
```

#### Issue: SSL Certificate Renewal Failed

```bash
# Manual renewal
sudo certbot renew --force-renewal

# Check renewal configuration
sudo certbot renew --dry-run

# View certificate details
sudo certbot certificates
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Using git tags
git checkout v1.2.3-stable
npm install
npm run build
pm2 restart pds-maker-api

# Using PM2 deploy
pm2 deploy production revert 1
```

#### Emergency Database Maintenance

```sql
-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query_start < now() - interval '5 minutes';

-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE pds_maker_prod;
```

#### Clear Application Cache

```bash
# Clear Redis cache
redis-cli -a $REDIS_PASSWORD FLUSHDB

# Clear file cache
rm -rf /var/cache/pdsmaker/*

# Restart application
pm2 restart pds-maker-api
```

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test all API endpoints
- [ ] Check SSL certificate validity
- [ ] Verify backup system is working
- [ ] Test monitoring alerts
- [ ] Review security headers
- [ ] Check log rotation
- [ ] Verify rate limiting
- [ ] Test database connections
- [ ] Monitor initial performance
- [ ] Document any custom configurations
- [ ] Update DNS records if needed
- [ ] Notify team of deployment completion

Remember: Always test deployment procedures in a staging environment before applying to production!