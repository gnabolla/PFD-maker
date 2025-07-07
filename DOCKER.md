# PDS-Maker Docker Setup

This document provides comprehensive information about the Docker setup for PDS-Maker.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Makefile Commands](#makefile-commands)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pds-maker.git
   cd pds-maker
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services**
   ```bash
   make build
   make up
   ```

4. **Run migrations**
   ```bash
   make migrate
   make seed
   ```

5. **Access the application**
   - Web UI: http://localhost:3000
   - API: http://localhost:3001
   - API Docs: http://localhost:3001/api-docs

## Architecture

The Docker setup includes the following services:

- **postgres**: PostgreSQL 15 database
- **redis**: Redis 7 cache server
- **api**: Node.js Express API
- **web**: React web application
- **nginx**: Reverse proxy (production only)

### Network Architecture

All services communicate on a custom bridge network (`pds-network`) with the subnet `172.20.0.0/16`.

### Volume Management

- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- `./uploads`: Shared upload directory

## Development Setup

### Using Docker Compose Override

The `docker-compose.override.yml` file automatically loads in development:

```bash
# Start development environment
docker-compose up

# Or use the Makefile
make dev-docker
```

This provides:
- Hot reloading for both API and web
- Source code mounting
- Debugger port exposure (9229)
- Development environment variables

### Development Commands

```bash
# View logs
make logs         # All services
make logs-api     # API only
make logs-web     # Web only

# Access service shells
make shell-api    # API container shell
make shell-web    # Web container shell
make shell-db     # PostgreSQL shell

# Run tests
make test         # All tests
make test-api     # API tests only
make test-web     # Web tests only
```

## Production Deployment

### Building for Production

```bash
# Build production images
make build-prod

# Or manually
docker-compose -f docker-compose.yml build
```

### Deployment Script

Use the automated deployment script:

```bash
./deployment/deploy.sh --env production --tag v1.0.0
```

Options:
- `--env`: Environment (production/staging)
- `--tag`: Docker image tag
- `--registry`: Docker registry URL
- `--no-backup`: Skip database backup

### Manual Production Start

```bash
# Start production services
docker-compose -f docker-compose.yml up -d

# Check health
./deployment/health-check.sh
```

## Environment Variables

### Required Variables

```bash
# Database
DB_NAME=pds_maker
DB_USER=pds_user
DB_PASSWORD=your-secure-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# API Configuration
API_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Web Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=production
```

### Optional Variables

```bash
# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10MB

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-license-key
```

See `.env.example` for a complete list.

## Makefile Commands

### Development

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make dev` | Start development (local) |
| `make dev-docker` | Start development (Docker) |
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make format` | Format code |

### Docker

| Command | Description |
|---------|-------------|
| `make build` | Build Docker images |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | Show service logs |
| `make ps` | Show running containers |

### Database

| Command | Description |
|---------|-------------|
| `make migrate` | Run migrations |
| `make seed` | Seed database |
| `make backup` | Backup database |
| `make restore` | Restore from backup |
| `make db-reset` | Reset database |

### Deployment

| Command | Description |
|---------|-------------|
| `make deploy` | Deploy to production |
| `make health-check` | Run health checks |
| `make clean` | Clean build artifacts |
| `make clean-all` | Clean everything |

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :3001
   lsof -i :5432
   
   # Change ports in .env if needed
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres pg_isready
   ```

3. **Permission issues**
   ```bash
   # Fix upload directory permissions
   sudo chown -R $(id -u):$(id -g) ./uploads
   ```

4. **Build failures**
   ```bash
   # Clean and rebuild
   make clean-all
   make build
   ```

### Health Checks

Run comprehensive health checks:

```bash
# Single check
./deployment/health-check.sh

# Continuous monitoring
./deployment/health-check.sh --continuous
```

### Viewing Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

## Security Considerations

### SSL/TLS Configuration

1. Place SSL certificates in `deployment/nginx/ssl/`:
   - `cert.pem`: SSL certificate
   - `key.pem`: Private key
   - `chain.pem`: Certificate chain

2. Update nginx configuration for your domain

3. Enable HTTPS redirect in production

### Security Best Practices

1. **Strong passwords**: Use complex passwords for database and JWT secret
2. **Environment isolation**: Never share .env files between environments
3. **Regular updates**: Keep Docker images updated
4. **Network isolation**: Use custom networks, not default bridge
5. **Non-root users**: Containers run as non-root users
6. **Secret management**: Use Docker secrets or external secret management in production

### Backup Strategy

Regular backups are crucial:

```bash
# Manual backup
make backup

# Automated daily backups (cron)
0 2 * * * cd /path/to/pds-maker && ./deployment/backup.sh
```

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs linting and tests
2. Builds Docker images
3. Performs security scanning
4. Runs integration tests

### Running CI Locally

```bash
# Install act (GitHub Actions locally)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act push
```

## Monitoring

### Metrics and Monitoring

1. **Container metrics**
   ```bash
   docker stats
   ```

2. **Application metrics**
   - API: http://localhost:3001/metrics
   - Custom dashboards can be added

3. **Log aggregation**
   - Logs are JSON formatted for easy parsing
   - Can be integrated with ELK stack or similar

### Alerts

Configure alerts in `deployment/health-check.sh`:

```bash
export ALERT_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
./deployment/health-check.sh --continuous
```

## Advanced Configuration

### Scaling

To scale services horizontally:

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 3
```

### Custom Networks

Add additional networks for service isolation:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### Resource Limits

Set resource constraints:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Support

For issues or questions:

1. Check the [troubleshooting](#troubleshooting) section
2. Review container logs
3. Run health checks
4. Open an issue on GitHub